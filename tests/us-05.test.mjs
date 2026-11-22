
import assert from "node:assert/strict";
import { test } from "node:test";

import { demoListings } from "../src/lib/demo.ts";
import { reasons } from "../src/lib/reasons.ts";

function findListing(id) {
    const listing = demoListings.find((item) => item.id === id);
    assert.ok(listing);
    return listing;
}

// Test 1: Personalized audience match
test("US-05: generates a matching audience reason", () => {
    const listing = findListing("demo-02");

    const result = reasons(listing, {
        audience: "Friends",
        interests: [],
    });

    assert.ok(result.includes("Matches your Friends preference"));
});

// Test 2: Non-matching audience
test("US-05: does not generate an incorrect audience reason", () => {
    const listing = findListing("demo-02");

    const result = reasons(listing, {
        audience: "Family",
        interests: [],
    });

    assert.ok(!result.includes("Matches your Family preference"));
});

// Test 3: Practical reasons
test("US-05: generates practical reasons without preferences", () => {
    const listing = findListing("demo-01");

    assert.deepEqual(reasons(listing), [
        "Indoor",
        "Kid-friendly",
        "Accessible",
    ]);
});

// Test 4: Null information
test("US-05: ignores unknown listing information", () => {
    const listing = findListing("demo-05");

    assert.deepEqual(reasons(listing), []);
});

// Test 5: False values
test("US-05: does not generate positive reasons for false values", () => {
    const listing = findListing("demo-07");

    assert.deepEqual(reasons(listing), ["Indoor"]);
});

// Test 6: Maximum three reasons
test("US-05: returns a maximum of three reasons", () => {
    const listing = findListing("demo-01");

    const result = reasons(listing, {
        audience: "Family",
        interests: [],
    });

    assert.equal(result.length, 3);
});

// Test 7: Personalized reason prioritization
test("US-05: prioritizes personalized reasons", () => {
    const listing = findListing("demo-01");

    assert.deepEqual(
        reasons(listing, {
            audience: "Family",
            interests: [],
        }),
        [
            "Matches your Family preference",
            "Indoor",
            "Kid-friendly",
        ],
    );
});

// Test 8: Interest matching
test("US-05: generates a reason for a matching interest", () => {
    const listing = findListing("demo-02");

    const result = reasons(listing, {
        audience: null,
        interests: ["Jazz"],
    });

    assert.ok(result.includes("Matches your Jazz interest"));
});

// Test 9: Restaurant support
test("US-05: supports restaurant recommendations", () => {
    const listing = findListing("demo-09");

    assert.deepEqual(reasons(listing), [
        "Indoor",
        "Accessible",
    ]);
});

// Test 10: Deterministic results
test("US-05: generates consistent recommendation reasons", () => {
    const listing = findListing("demo-01");

    const prefs = {
        audience: "Family",
        interests: ["Art"],
    };

    assert.deepEqual(
        reasons(listing, prefs),
        reasons(listing, prefs),
    );
});
