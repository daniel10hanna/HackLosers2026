import assert from "node:assert/strict";
import { test } from "node:test";
import type { Listing } from "../src/lib/feed.ts";
import { formatPrice, matchesSearch, sortForBrowse } from "../src/lib/listings.ts";

function listing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "l1", title: "Jazz Night", kind: "event", audience_tags: [],
    is_indoor: null, kid_friendly: null, wheelchair_accessible: null, safety_notes: null, min_age: null,
    category: "Music", description: null, start_time: null, end_time: null, venue: null, address: null,
    neighborhood: "Plateau", price: null, latitude: null, longitude: null, source_url: null,
    ...overrides,
  };
}
const now = new Date("2026-11-22T00:00:00Z");

test("search matches title, category and neighborhood, ignoring case", () => {
  assert.equal(matchesSearch(listing(), "jazz"), true);
  assert.equal(matchesSearch(listing(), "MUSIC"), true);
  assert.equal(matchesSearch(listing(), "plateau"), true);
  assert.equal(matchesSearch(listing(), "pizza"), false);
  assert.equal(matchesSearch(listing(), "   "), true);
});

test("browse hides ended events and lists upcoming events soonest first, then restaurants A-Z", () => {
  const ended = listing({ id: "ended", start_time: "2026-11-21T18:00:00Z", end_time: "2026-11-21T20:00:00Z" });
  const later = listing({ id: "later", start_time: "2026-11-23T18:00:00Z" });
  const sooner = listing({ id: "sooner", start_time: "2026-11-22T18:00:00Z" });
  const zeta = listing({ id: "zeta", kind: "restaurant", title: "Zeta" });
  const alpha = listing({ id: "alpha", kind: "restaurant", title: "Alpha" });
  assert.deepEqual(sortForBrowse([zeta, later, ended, alpha, sooner], now).map((l) => l.id),
    ["sooner", "later", "alpha", "zeta"]);
});

test("price labels never guess", () => {
  assert.equal(formatPrice(listing({ price: null })), "Price not specified");
  assert.equal(formatPrice(listing({ price: 0 })), "Free");
  assert.equal(formatPrice(listing({ price: 20 })), "$20");
  assert.equal(formatPrice(listing({ kind: "restaurant", price: 15 })), "~$15 per person");
});