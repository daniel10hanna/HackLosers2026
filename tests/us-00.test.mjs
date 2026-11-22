
import assert from "node:assert/strict";
import { test } from "node:test";

import { aiSearch } from "../src/lib/ai.ts";
import { demoListings } from "../src/lib/demo.ts";
import { passes } from "../src/lib/filters.ts";
import { sortForPrefs } from "../src/lib/personalize.ts";
import { reasons } from "../src/lib/reasons.ts";

test("demo feed has 16 unique listings and includes both listing types", () => {
  assert.equal(demoListings.length, 16);
  assert.equal(new Set(demoListings.map((listing) => listing.id)).size, 16);
  assert.ok(demoListings.some((listing) => listing.kind === "event"));
  assert.ok(demoListings.some((listing) => listing.kind === "restaurant"));
});

test("filter placeholder lets every demo listing through", () => {
  assert.ok(demoListings.every((listing) => passes(listing, { indoor: true })));
});

test("ranking puts Family listings first and keeps every listing (US-03)", () => {
  const ranked = sortForPrefs(demoListings, {
    audience: "Family",
    interests: ["Art"],
  });
  const family = demoListings.filter((listing) => listing.audience_tags.includes("Family"));

  assert.equal(ranked.length, demoListings.length);
  assert.deepEqual(
    ranked.slice(0, family.length).map((listing) => listing.id),
    family.map((listing) => listing.id),
  );
});

test("recommendation reasons reflect listing information", () => {
  assert.deepEqual(reasons(demoListings[0]), [
    "Indoor",
    "Kid-friendly",
    "Accessible",
  ]);
});

test("AI search placeholder returns an empty result", async () => {
  assert.deepEqual(await aiSearch("jazz tonight", demoListings), {
    criteria: [],
    matches: [],
    usedFallback: false,
  });
});
