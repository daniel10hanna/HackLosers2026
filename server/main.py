import asyncio
import logging
import os
from datetime import datetime
from typing import Annotated

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from google.genai.errors import APIError
from pydantic import BaseModel, ConfigDict, Field, StringConstraints

from listings import (
    MONTREAL, Listing, available, criteria_chips, explain, keyword_search,
    load_demo_listings, load_listings, rank_listings,
)
from llm import extract_criteria, gemini_failure_category

logger = logging.getLogger(__name__)
SEARCH_TIMEOUT = 8.0


class SearchRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    query: Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=500)]


class ListingReference(BaseModel):
    id: str


class Match(BaseModel):
    listing: ListingReference
    explanation: str


class AiResult(BaseModel):
    criteria: list[str]
    matches: list[Match] = Field(max_length=10)
    usedFallback: bool


app = FastAPI(title="MTL NOW Search")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_methods=["POST"],
                   allow_headers=["Content-Type"])


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/search", response_model=AiResult)
async def search(request: SearchRequest):
    loop = asyncio.get_running_loop()
    deadline = loop.time() + SEARCH_TIMEOUT
    demo_path = os.getenv("US06_DEMO_LISTINGS_FILE", "").strip()
    source = load_demo_listings(demo_path) if demo_path else load_listings()
    try:
        listings = await asyncio.wait_for(source, timeout=5)
    except (TimeoutError, ValueError, OSError, ExceptionGroup) as error:
        logger.warning("Listing retrieval unavailable (%s)", type(error).__name__)
        raise HTTPException(503, "Published listings are unavailable") from error

    now = datetime.now(MONTREAL)
    eligible = [listing for listing in listings if available(listing, now)]
    categories = sorted({listing.category for listing in eligible if listing.category})
    try:
        async with asyncio.timeout_at(deadline):
            criteria = await extract_criteria(request.query, now, categories)
    except (APIError, httpx.RequestError, ValueError, TimeoutError) as error:
        status = error.code if isinstance(error, APIError) and isinstance(error.code, int) else None
        logger.warning(
            "Gemini fallback category=%s exception=%s http_status=%s",
            gemini_failure_category(error), type(error).__name__, status,
        )
        return build_result(eligible, keyword_search(eligible, request.query, now), [], True)
    matched = rank_listings(eligible, criteria, now)
    return build_result(eligible, matched, criteria_chips(criteria), False)


def build_result(
    eligible: list[Listing], matched: list[Listing], chips: list[str], fallback: bool,
) -> AiResult:
    verified = {(listing.kind, listing.id): listing for listing in eligible}
    matches = []
    seen = set()
    for candidate in matched:
        actual = verified.get((candidate.kind, candidate.id))
        if actual is None or actual != candidate or actual.id in seen:
            continue
        seen.add(actual.id)
        matches.append(Match(listing=ListingReference(id=actual.id), explanation=explain(actual)))
        if len(matches) == 10:
            break
    return AiResult(criteria=chips, matches=matches, usedFallback=fallback)
