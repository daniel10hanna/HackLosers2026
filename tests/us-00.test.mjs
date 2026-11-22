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

test("ranking placeholder preserves the original listing order", () => {
  const originalOrder = demoListings.map((listing) => listing.id);
  const ranked = sortForPrefs(demoListings, {
    audience: "Family",
    interests: ["Art"],
  });

  assert.deepEqual(
    ranked.map((listing) => listing.id),
    originalOrder,
  );
});

test("match-reason placeholder returns an empty array", () => {
  assert.deepEqual(reasons(demoListings[0]), []);
});

test("AI search placeholder returns an empty result", async () => {
  assert.deepEqual(await aiSearch("jazz tonight", demoListings), {
    criteria: [],
    matches: [],
    usedFallback: false,
  });
});
