import asyncio
import os
import re
import unicodedata
from datetime import date, datetime, time, timedelta
from decimal import Decimal
from pathlib import Path
from typing import Literal
from zoneinfo import ZoneInfo

import httpx
from pydantic import AwareDatetime, BaseModel, TypeAdapter

from llm import Audience, Criteria

MONTREAL = ZoneInfo("America/Toronto")


class Listing(BaseModel):
    id: str
    title: str
    kind: Literal["event", "restaurant"]
    category: str | None = None
    address: str | None = None
    venue: str | None = None
    start_time: AwareDatetime | None = None
    price: Decimal | None = None
    audience_tags: list[Audience]
    is_indoor: bool | None = None
    kid_friendly: bool | None = None
    wheelchair_accessible: bool | None = None


async def load_demo_listings(path: str) -> list[Listing]:
    contents = await asyncio.to_thread(Path(path).read_bytes)
    return TypeAdapter(list[Listing]).validate_json(contents)


async def load_listings() -> list[Listing]:
    url = os.getenv("SUPABASE_URL", "").rstrip("/")
    key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "")
    if not url or not key.startswith("sb_publishable_"):
        raise ValueError("Supabase URL and publishable key required")

    common = "id,title,category,address,price,audience_tags,is_indoor,kid_friendly,wheelchair_accessible"
    async with httpx.AsyncClient(timeout=4, headers={"apikey": key}) as client:
        async with asyncio.TaskGroup() as group:
            events = group.create_task(read_published(
                client, url, "events", "event", "status", "published",
                f"{common},status,start_time,venue",
            ))
            restaurants = group.create_task(read_published(
                client, url, "restaurants", "restaurant", "published", True,
                f"{common},published",
            ))
        return events.result() + restaurants.result()


async def read_published(client, url, table, kind, flag, published, columns) -> list[Listing]:
    offset = 0
    listings = {}
    while True:
        response = await client.get(
            f"{url}/rest/v1/{table}",
            params={"select": columns, flag: f"eq.{str(published).lower()}",
                    "order": "id.asc", "limit": 500, "offset": offset},
        )
        response.raise_for_status()
        rows = response.json()
        if not isinstance(rows, list):
            raise ValueError("Invalid Supabase response")
        if not rows:
            return list(listings.values())
        for row in rows:
            value = row.get(flag)
            if value == published and type(value) is type(published):
                listing = Listing.model_validate({**row, "kind": kind})
                listings[listing.id] = listing
        offset += len(rows)


def normalize(text: str) -> str:
    decomposed = unicodedata.normalize("NFKD", text.casefold())
    return "".join(char for char in decomposed if not unicodedata.combining(char))


def words(text: str) -> list[str]:
    return re.findall(r"[^\W_]+", normalize(text))


def local(day: date, hour: int = 0) -> datetime:
    return datetime.combine(day, time(hour), MONTREAL)


def search_window(criteria: Criteria, now: datetime) -> tuple[datetime, datetime] | None:
    today = now.astimezone(MONTREAL).date()
    if criteria.when == "tonight":
        return local(today, 17), local(today + timedelta(days=1), 4)
    if criteria.when == "this weekend":
        # Sunday belongs to the current weekend, as does Saturday.
        saturday = today + timedelta(days=5 - today.weekday())
        return local(saturday), local(saturday + timedelta(days=2))
    if criteria.when == "today":
        return local(today), local(today + timedelta(days=1))
    if criteria.when == "tomorrow":
        return local(today + timedelta(days=1)), local(today + timedelta(days=2))
    if criteria.first_date:
        return local(criteria.first_date), local((criteria.last_date or criteria.first_date) + timedelta(days=1))
    return None


def available(listing: Listing, now: datetime) -> bool:
    # The event schema exposes start_time as its sole schedule timestamp.
    return listing.kind == "restaurant" or listing.start_time is None or listing.start_time >= now


def text_score(listing: Listing, terms: set[str]) -> int:
    title = set(words(listing.title))
    details = set(words(" ".join(filter(None, (listing.category, listing.address, listing.venue)))))
    return 2 * len(terms & title) + len(terms & details)


def rank_key(listing: Listing, score: int) -> tuple:
    return (-score, listing.start_time is None, listing.start_time, normalize(listing.title), listing.id)


def matches_criteria(listing: Listing, criteria: Criteria, window) -> bool:
    if criteria.kind and listing.kind != criteria.kind:
        return False
    if criteria.category and listing.category != criteria.category:
        return False
    if criteria.neighborhood:
        address = " ".join(words(listing.address or ""))
        neighborhood = " ".join(words(criteria.neighborhood))
        if not neighborhood or f" {neighborhood} " not in f" {address} ":
            return False
    if criteria.audience and criteria.audience not in listing.audience_tags:
        return False
    for field in ("is_indoor", "kid_friendly", "wheelchair_accessible"):
        expected = getattr(criteria, field)
        if expected is not None and getattr(listing, field) is not expected:
            return False
    if criteria.free_only and listing.price != 0:
        return False
    if criteria.max_price is not None:
        budget = Decimal(str(criteria.max_price))
        if listing.price is None or listing.price > budget:
            return False
        if criteria.price_exclusive and listing.price == budget:
            return False
    # Restaurant hours are absent. A dated event can be verified against the window.
    if window and listing.kind == "event":
        return listing.start_time is not None and window[0] <= listing.start_time < window[1]
    return True


def rank_listings(listings: list[Listing], criteria: Criteria, now: datetime) -> list[Listing]:
    window = search_window(criteria, now)
    terms = set(words(criteria.keywords or ""))
    ranked = []
    for listing in listings:
        if not available(listing, now) or not matches_criteria(listing, criteria, window):
            continue
        score = text_score(listing, terms)
        if score or not terms:
            ranked.append((rank_key(listing, score), listing))
    return [listing for _, listing in sorted(ranked, key=lambda item: item[0])[:10]]


STOP_WORDS = set(words(
    "find me show want something to do a an for the in with my i montreal this "
    "activities activity plans fun good and of some friendly looking please"
))


def keyword_search(listings: list[Listing], query: str, now: datetime) -> list[Listing]:
    query = normalize(query)
    terms = set(words(query)) - STOP_WORDS
    budget_match = re.search(r"\b(under|less than|up to|at most|max(?:imum)?)\s*\$?\s*(\d+(?:\.\d{1,2})?)\b", query)
    flags = {}
    if budget_match:
        flags["max_price"] = float(budget_match[2])
        flags["price_exclusive"] = budget_match[1] in {"under", "less than"}
        terms -= set(words(budget_match[0]))
    for when in ("tonight", "tomorrow", "this weekend", "today"):
        if re.search(rf"\b{when}\b", query):
            flags["when"] = when
            terms -= set(words(when))
            break
    for field, pattern, value in (
        ("free_only", r"free", True),
        ("is_indoor", r"indoors?", True),
        ("is_indoor", r"outdoors?", False),
        ("kid_friendly", r"kids?|children", True),
        ("wheelchair_accessible", r"wheelchair|accessible", True),
        ("audience", r"family|families", "Family"),
        ("audience", r"date|romantic", "Date"),
        ("audience", r"solo", "Solo"),
        ("audience", r"friends", "Friends"),
        ("audience", r"tourists?", "Tourist"),
        ("kind", r"events?", "event"),
        ("kind", r"restaurants?|dining|dinner|lunch", "restaurant"),
    ):
        matches = re.findall(rf"\b(?:{pattern})\b", query)
        if matches:
            flags[field] = value
            terms.difference_update(matches)
    if not (flags or terms):
        return []
    empty = dict.fromkeys(Criteria.model_fields)
    return rank_listings(listings, Criteria(**{**empty, **flags, "keywords": " ".join(sorted(terms)) or None}), now)


def price_label(price) -> str:
    return f"${price:.2f}".removesuffix(".00")


def criteria_chips(criteria: Criteria) -> list[str]:
    chips = []
    if criteria.when:
        chips.append(criteria.when.capitalize())
    if criteria.first_date:
        dates = criteria.first_date.isoformat()
        if criteria.last_date:
            dates += f" to {criteria.last_date.isoformat()}"
        chips.append(dates)
    if criteria.free_only:
        chips.append("Free")
    if criteria.max_price is not None:
        comparison = "Under" if criteria.price_exclusive else "Up to"
        chips.append(f"{comparison} {price_label(criteria.max_price)}")
    if criteria.is_indoor is not None:
        chips.append("Indoor" if criteria.is_indoor else "Outdoor")
    chips.extend(value for value in (criteria.audience, criteria.category, criteria.neighborhood) if value)
    if criteria.kid_friendly is True:
        chips.append("Kid-friendly")
    if criteria.wheelchair_accessible is True:
        chips.append("Wheelchair accessible")
    return chips


def explain(listing: Listing) -> str:
    facts = [listing.category or listing.kind.capitalize()]
    if listing.price is not None:
        facts.append("Free" if listing.price == 0 else price_label(listing.price))
    if listing.is_indoor is not None:
        facts.append("Indoor" if listing.is_indoor else "Outdoor")
    if listing.audience_tags:
        facts.append(", ".join(listing.audience_tags))
    if listing.kid_friendly is True:
        facts.append("Kid-friendly")
    if listing.wheelchair_accessible is True:
        facts.append("Wheelchair accessible")
    if listing.kind == "event" and listing.start_time:
        starts = listing.start_time.astimezone(MONTREAL)
        facts.append(starts.strftime("%b %d, %H:%M"))
    return " \u00b7 ".join(facts)
