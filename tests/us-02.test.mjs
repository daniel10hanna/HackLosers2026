
import assert from "node:assert/strict";
import { test } from "node:test";

import { demoListings } from "../src/lib/demo.ts";
import { getFitDetails } from "../src/lib/fit-details.ts";

// Helper function to retrieve a demo listing
function findListing(id) {
    const listing = demoListings.find((item) => item.id === id);
    assert.ok(listing, `Listing ${id} must exist`);
    return listing;
}

// Test 1: Audience tags
test("US-02: displays the correct audience tags", () => {
    const details = getFitDetails(findListing("demo-02"));

    assert.equal(details.audience, "Date, Friends");
});

// Test 2: Indoor and outdoor environments
test("US-02: correctly identifies indoor and outdoor listings", () => {
    const indoor = getFitDetails(findListing("demo-01"));
    const outdoor = getFitDetails(findListing("demo-03"));

    assert.equal(indoor.environment, "Indoor");
    assert.equal(outdoor.environment, "Outdoor");
});

// Test 3: Kid-friendly information
test("US-02: correctly displays kid-friendly information", () => {
    const friendly = getFitDetails(findListing("demo-01"));
    const notFriendly = getFitDetails(findListing("demo-02"));

    assert.equal(friendly.kidFriendly, "Yes");
    assert.equal(notFriendly.kidFriendly, "No");
});

// Test 4: Wheelchair accessibility
test("US-02: correctly displays wheelchair accessibility", () => {
    const accessible = getFitDetails(findListing("demo-01"));
    const notAccessible = getFitDetails(findListing("demo-07"));

    assert.equal(accessible.wheelchairAccessible, "Yes");
    assert.equal(notAccessible.wheelchairAccessible, "No");
});

// Test 5: Minimum age
test("US-02: correctly formats minimum age restrictions", () => {
    const details = getFitDetails(findListing("demo-02"));

    assert.equal(details.minimumAge, "18+");
});

// Test 6: Safety notes
test("US-02: displays the correct safety notes", () => {
    const details = getFitDetails(findListing("demo-03"));

    assert.equal(details.safety, "Some paths are uneven.");
});

// Test 7: Unknown information
test("US-02: displays Not specified for all nullable fields", () => {
    const details = getFitDetails(findListing("demo-05"));

    assert.equal(details.environment, "Not specified");
    assert.equal(details.kidFriendly, "Not specified");
    assert.equal(details.wheelchairAccessible, "Not specified");
    assert.equal(details.minimumAge, "Not specified");
    assert.equal(details.safety, "Not specified");
});

// Test 8: Restaurant compatibility
test("US-02: supports restaurant fit details", () => {
    const listing = findListing("demo-09");
    const details = getFitDetails(listing);

    assert.equal(listing.kind, "restaurant");
    assert.equal(details.audience, "Solo, Date");
    assert.equal(details.environment, "Indoor");
    assert.equal(details.wheelchairAccessible, "Yes");
    assert.equal(details.kidFriendly, "Not specified");
});
