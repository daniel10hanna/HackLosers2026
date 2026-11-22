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

test("AI search falls back to a matching demo listing", async () => {
  const previousDemoMode = process.env.EXPO_PUBLIC_DEMO_MODE;
  process.env.EXPO_PUBLIC_DEMO_MODE = "true";

  try {
    const result = await aiSearch("jazz tonight", demoListings);
    assert.equal(result.usedFallback, true);
    assert.deepEqual(
      result.matches.map(({ listing }) => listing.title),
      ["Evening Jazz Set"],
    );
  } finally {
    if (previousDemoMode === undefined) {
      delete process.env.EXPO_PUBLIC_DEMO_MODE;
    } else {
      process.env.EXPO_PUBLIC_DEMO_MODE = previousDemoMode;
    }
  }
});
