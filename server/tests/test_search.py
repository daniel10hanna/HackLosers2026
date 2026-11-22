import asyncio
import json
import os
import unittest
from datetime import datetime, timedelta
from unittest.mock import AsyncMock, patch

import httpx
from fastapi.testclient import TestClient
from google import genai
from google.genai import errors, types
from pydantic import ValidationError

import main
from listings import (
    MONTREAL, Listing, explain, keyword_search, load_listings, rank_listings, search_window,
)
from llm import DEFAULT_MODEL, Criteria, extract_criteria

NOW = datetime(2026, 11, 21, 14, tzinfo=MONTREAL)


def criteria(**fields):
    return Criteria(**{**dict.fromkeys(Criteria.model_fields), **fields})


def listing(id="event-1", **fields):
    return Listing(**{
        "id": id, "title": "Jazz Workshop", "kind": "event", "audience_tags": ["Family"],
        **fields,
    })


def gemini_response(text, finish_reason=types.FinishReason.STOP):
    return types.GenerateContentResponse(candidates=[
        types.Candidate(
            finish_reason=finish_reason,
            content=types.Content(parts=[types.Part(text=text)], role="model"),
        ),
    ])


class RankingTests(unittest.TestCase):
    def test_expired_events_excluded(self):
        past = listing("past", start_time=NOW - timedelta(minutes=1))
        future = listing("future", start_time=NOW + timedelta(minutes=1))
        self.assertEqual(rank_listings([past, future], criteria(), NOW), [future])

    def test_price_limits_and_unknown_values(self):
        low, equal, unknown = listing("low", price=29), listing("equal", price=30), listing("unknown")
        rows = [low, equal, unknown]
        self.assertEqual(rank_listings(rows, criteria(max_price=30, price_exclusive=True), NOW), [low])
        self.assertEqual(rank_listings(rows, criteria(max_price=30), NOW), [equal, low])
        free = listing("free", price=0)
        self.assertEqual(rank_listings([low, unknown, free], criteria(free_only=True), NOW), [free])

    def test_neighborhood_matches_address_text(self):
        row = listing(address="100 St-Denis, Plateau-Mont-Royal")
        result = rank_listings([row, listing("other")], criteria(neighborhood="Plateau Mont Royal"), NOW)
        self.assertEqual(result, [row])

    def test_indoor_and_audience_filters(self):
        match = listing("match", is_indoor=True)
        mixed = [match, listing("unknown"), listing("outside", is_indoor=False),
                 listing("date", is_indoor=True, audience_tags=["Date"])]
        self.assertEqual(rank_listings(mixed, criteria(is_indoor=True, audience="Family"), NOW), [match])

    def test_category_and_accessibility_filters(self):
        row = listing(category="Music", kid_friendly=True, wheelchair_accessible=True)
        filters = criteria(category="Music", kid_friendly=True, wheelchair_accessible=True)
        self.assertEqual(rank_listings([row, listing("other", category="Art")], filters, NOW), [row])

    def test_tonight_and_undated_dining(self):
        future = listing("future", start_time=NOW.replace(hour=18))
        early = listing("early", start_time=NOW.replace(hour=16))
        diner = listing("diner", kind="restaurant")
        rows = [early, future, diner, listing("unknown")]
        self.assertEqual(rank_listings(rows, criteria(when="tonight"), NOW), [future, diner])
        self.assertEqual(rank_listings(rows, criteria(when="tonight", kind="event"), NOW), [future])

    def test_weekend_and_tomorrow_use_montreal_dates(self):
        sunday = NOW + timedelta(days=1)
        self.assertEqual(search_window(criteria(when="this weekend"), sunday),
                         (NOW.replace(hour=0), (NOW + timedelta(days=2)).replace(hour=0)))
        self.assertEqual(search_window(criteria(when="tomorrow"), NOW)[0], sunday.replace(hour=0))

    def test_maximum_ten_with_deterministic_order(self):
        rows = [listing(str(i)) for i in range(15)]
        matches = rank_listings(rows, criteria(), NOW)
        self.assertEqual(len(matches), 10)
        self.assertEqual(matches, rank_listings(list(reversed(rows)), criteria(), NOW))

    def test_keyword_search_uses_stored_text_and_returns_no_match(self):
        row = listing(category="Music", address="Old Port")
        self.assertEqual(keyword_search([row], "music", NOW), [row])
        self.assertEqual(keyword_search([row], "port", NOW), [row])
        self.assertEqual(keyword_search([row], "unicorn", NOW), [])
        self.assertEqual(keyword_search([row], "free Jazz", NOW), [])

    def test_only_known_facts_in_explanations(self):
        self.assertEqual(explain(listing(audience_tags=[])), "Event")
        self.assertEqual(explain(listing(category="Music", price=0, is_indoor=True)),
                         "Music \u00b7 Free \u00b7 Indoor \u00b7 Family")

    def test_fabricated_ids_and_modified_rows_are_rejected(self):
        row = listing()
        altered = row.model_copy(update={"price": 0})
        result = main.build_result([row], [listing("fake"), altered, row, row], [], False)
        self.assertEqual([match.listing.id for match in result.matches], [row.id])


class UpstreamTests(unittest.IsolatedAsyncioTestCase):
    async def test_published_rest_reads_and_paginates(self):
        requests = []
        def respond(request):
            requests.append(request)
            if request.url.params["offset"] != "0":
                return httpx.Response(200, json=[])
            if request.url.path.endswith("/events"):
                return httpx.Response(200, json=[
                    {"id": "e1", "title": "Published", "status": "published", "audience_tags": []},
                    {"id": "e2", "title": "Pending", "status": "pending", "audience_tags": []},
                ])
            return httpx.Response(200, json=[
                {"id": "r1", "title": "Published", "published": True, "audience_tags": []},
                {"id": "r2", "title": "Hidden", "published": False, "audience_tags": []},
            ])
        client_type = httpx.AsyncClient
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.test",
                                     "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_mock"}), patch(
            "listings.httpx.AsyncClient",
            side_effect=lambda **kwargs: client_type(transport=httpx.MockTransport(respond), **kwargs),
        ):
            rows = await load_listings()
        self.assertEqual([row.id for row in rows], ["e1", "r1"])
        self.assertEqual(len(requests), 4)
        for request in requests:
            self.assertEqual(request.headers["apikey"], "sb_publishable_mock")
            flag, expected = (("status", "eq.published") if request.url.path.endswith("/events")
                              else ("published", "eq.true"))
            self.assertEqual(request.url.params[flag], expected)

    async def test_rejects_non_publishable_key(self):
        with patch.dict(os.environ, {"SUPABASE_URL": "https://example.test",
                                     "SUPABASE_PUBLISHABLE_KEY": "sb_secret_mock"}):
            with self.assertRaises(ValueError):
                await load_listings()

    async def test_structured_response_and_category_validation(self):
        query = "Family music tomorrow"
        payload = criteria(audience="Family", category="Music", when="tomorrow").model_dump_json()
        generate = AsyncMock(return_value=gemini_response(payload))
        with patch("llm.genai.Client") as sdk, patch.dict(
            os.environ, {"GEMINI_API_KEY": "mock", "GEMINI_MODEL": ""}
        ):
            sdk.return_value.aio.__aenter__.return_value.models.generate_content = generate
            extracted = await extract_criteria(query, NOW, ["Music"])
            self.assertEqual(extracted.category, "Music")
            self.assertEqual(extracted.audience, "Family")
            args = generate.call_args.kwargs
            self.assertEqual(args["model"], DEFAULT_MODEL)
            self.assertEqual(args["contents"], query)
            self.assertFalse(sdk.call_args.kwargs["vertexai"])
            config = args["config"]
            self.assertIn(NOW.isoformat(), config.system_instruction)
            self.assertEqual(config.response_mime_type, "application/json")
            self.assertFalse(config.response_json_schema["additionalProperties"])
            self.assertEqual(
                config.response_json_schema["properties"]["category"]["anyOf"][0]["enum"],
                ["Music"],
            )
            with patch.dict(os.environ, {"GEMINI_MODEL": "gemini-3.8-flash"}):
                await extract_criteria(query, NOW, ["Music"])
                self.assertEqual(generate.call_args.kwargs["model"], "gemini-3.8-flash")
            with self.assertRaises(ValueError):
                await extract_criteria(query, NOW, ["Art"])

    async def test_sdk_serializes_structured_request_to_developer_api(self):
        def respond(request):
            self.assertEqual(request.url.host, "generativelanguage.googleapis.com")
            self.assertTrue(request.url.path.endswith(f"/{DEFAULT_MODEL}:generateContent"))
            self.assertEqual(request.headers["x-goog-api-key"], "mock")
            body = json.loads(request.content)
            self.assertEqual(body["contents"][0]["parts"][0]["text"], "Indoor tomorrow")
            config = body["generationConfig"]
            self.assertEqual(config["responseMimeType"], "application/json")
            self.assertFalse(config["responseJsonSchema"]["additionalProperties"])
            return httpx.Response(200, json={
                "candidates": [{
                    "finishReason": "STOP",
                    "content": {"role": "model", "parts": [{
                        "text": criteria(is_indoor=True, when="tomorrow").model_dump_json(),
                    }]},
                }],
            })

        real_client = genai.Client

        def mock_transport_client(*, http_options, **kwargs):
            http_options.async_client_args = {"transport": httpx.MockTransport(respond)}
            return real_client(http_options=http_options, **kwargs)

        with patch("llm.genai.Client", side_effect=mock_transport_client), patch.dict(os.environ, {
            "GEMINI_API_KEY": "mock", "GEMINI_MODEL": "",
        }):
            self.assertEqual(await extract_criteria("Indoor tomorrow", NOW, []),
                             criteria(is_indoor=True, when="tomorrow"))

    def test_invalid_audience_and_injected_fields_rejected(self):
        fields = criteria().model_dump()
        for invalid in ({"audience": "Everyone"}, {"ids": ["fake"]}, {"is_indoor": "true"},
                        {"max_price": -1}, {"first_date": "9999-12-31"}):
            with self.subTest(invalid=invalid), self.assertRaises(ValidationError):
                Criteria.model_validate_json(json.dumps({**fields, **invalid}))


class ApiTests(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(main.app)
        self.enterContext(patch.dict(os.environ, {"US06_DEMO_LISTINGS_FILE": ""}))

    def test_health(self):
        self.assertEqual(self.client.get("/health").json(), {"status": "ok"})

    def test_search_contract_and_grounding(self):
        match = listing(price=0, is_indoor=True)
        with patch("main.load_listings", return_value=[match, listing("unknown")]), patch(
            "main.extract_criteria", return_value=criteria(free_only=True, is_indoor=True)
        ):
            response = self.client.post("/search", json={"query": "  Free indoor event  "})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {
            "criteria": ["Free", "Indoor"], "usedFallback": False,
            "matches": [{"listing": {"id": match.id},
                         "explanation": "Event \u00b7 Free \u00b7 Indoor \u00b7 Family"}],
        })

    def test_search_through_rest_and_structured_responses(self):
        def supabase_response(request):
            if request.url.path.endswith("/events") and request.url.params["offset"] == "0":
                return httpx.Response(200, json=[
                    {"id": "jazz", "title": "Jazz Workshop", "category": "Music",
                     "status": "published", "audience_tags": ["Family"], "price": 0},
                    {"id": "pending", "title": "Jazz Workshop", "category": "Music",
                     "status": "pending", "audience_tags": ["Family"], "price": 0},
                ])
            return httpx.Response(200, json=[])

        async_client = httpx.AsyncClient
        with patch.dict(os.environ, {
            "SUPABASE_URL": "https://example.test",
            "SUPABASE_PUBLISHABLE_KEY": "sb_publishable_mock",
            "GEMINI_API_KEY": "mock",
        }), patch(
            "listings.httpx.AsyncClient",
            side_effect=lambda **kwargs: async_client(
                transport=httpx.MockTransport(supabase_response), **kwargs,
            ),
        ), patch("llm.genai.Client") as sdk:
            sdk.return_value.aio.__aenter__.return_value.models.generate_content = AsyncMock(
                return_value=gemini_response(
                    criteria(category="Music", audience="Family", free_only=True).model_dump_json(),
                ),
            )
            response = self.client.post("/search", json={"query": "Free music for families"})
        self.assertEqual(response.status_code, 200)
        self.assertFalse(response.json()["usedFallback"])
        self.assertEqual([item["listing"]["id"] for item in response.json()["matches"]], ["jazz"])

    def test_invalid_request(self):
        self.assertEqual(self.client.post("/search", json={"query": " "}).status_code, 422)

    def test_no_results(self):
        with patch("main.load_listings", return_value=[]), patch(
            "main.extract_criteria", return_value=criteria(audience="Solo")
        ):
            result = self.client.post("/search", json={"query": "Solo activities"}).json()
        self.assertEqual(result["matches"], [])
        self.assertFalse(result["usedFallback"])

    def test_missing_key_switches_to_keyword_search(self):
        with patch("main.load_listings", return_value=[listing()]), patch.dict(
            os.environ, {"GEMINI_API_KEY": ""}
        ):
            result = self.client.post("/search", json={"query": "jazz"}).json()
        self.assertTrue(result["usedFallback"])
        self.assertEqual(result["matches"][0]["listing"], {"id": "event-1"})

    def test_timeout_switches_to_keyword_search(self):
        async def delayed(*args):
            await asyncio.sleep(1)
        with patch("main.load_listings", return_value=[listing()]), patch(
            "main.extract_criteria", side_effect=delayed
        ), patch("main.SEARCH_TIMEOUT", 0.01):
            result = self.client.post("/search", json={"query": "jazz"}).json()
        self.assertTrue(result["usedFallback"])
        self.assertEqual(len(result["matches"]), 1)

    def test_invalid_model_output_switches_to_keyword_search(self):
        bad_responses = [
            gemini_response("not JSON"),
            gemini_response('{"ids": ["fake"]}'),
            gemini_response(criteria().model_dump_json(), types.FinishReason.MAX_TOKENS),
            types.GenerateContentResponse(),
        ]
        with patch("main.load_listings", return_value=[listing()]), patch.dict(
            os.environ, {"GEMINI_API_KEY": "mock"}
        ), patch("llm.genai.Client") as sdk:
            generate = sdk.return_value.aio.__aenter__.return_value.models.generate_content
            for response in bad_responses:
                with self.subTest(response=response):
                    generate.return_value = response
                    result = self.client.post("/search", json={"query": "unicorn"}).json()
                    self.assertTrue(result["usedFallback"])
                    self.assertEqual(result["matches"], [])

    def test_gemini_api_and_transport_errors_switch_to_keyword_search(self):
        failures = [
            (400, "API key invalid", "authentication_or_permission"),
            (400, "Invalid response schema", "request_schema"),
            (403, "Permission denied", "authentication_or_permission"),
            (404, "Unsupported model", "model_unavailable"),
            (429, "Rate limit or quota exceeded", "quota_or_rate_limit"),
            (503, "Unavailable", "provider_unavailable"),
        ]
        secret = "sensitive-provider-detail"
        cases = [
            ((errors.ServerError if code >= 500 else errors.ClientError)(
                code, {"error": {"message": f"{message}: {secret}"}}
            ), category, code)
            for code, message, category in failures
        ] + [
            (httpx.ConnectError(secret), "transport", None),
            (httpx.ReadTimeout(secret), "timeout", None),
        ]
        with patch("main.load_listings", return_value=[listing()]), patch.dict(
            os.environ, {"GEMINI_API_KEY": "mock"}
        ), patch("llm.genai.Client") as sdk:
            generate = sdk.return_value.aio.__aenter__.return_value.models.generate_content
            for failure, category, status in cases:
                with self.subTest(category=category), self.assertLogs("main", level="WARNING") as logs:
                    generate.side_effect = failure
                    response = self.client.post("/search", json={"query": "jazz"})
                    self.assertEqual(response.status_code, 200)
                    self.assertTrue(response.json()["usedFallback"])
                    self.assertEqual(response.json()["matches"][0]["listing"], {"id": "event-1"})
                    self.assertIn(f"category={category}", logs.output[0])
                    self.assertIn(f"http_status={status}", logs.output[0])
                    self.assertNotIn(secret, logs.output[0])

    def test_missing_database_returns_service_unavailable(self):
        with patch("main.load_listings", side_effect=ValueError("configuration missing")):
            response = self.client.post("/search", json={"query": "jazz"})
        self.assertEqual(response.status_code, 503)
