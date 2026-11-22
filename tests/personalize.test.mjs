import assert from "node:assert/strict";
import { test } from "node:test";

import { sortForPrefs } from "../src/lib/personalize.ts";

const listing = (id, audience_tags = [], category) => ({
  id,
  title: id,
  kind: "event",
  audience_tags,
  is_indoor: null,
  kid_friendly: null,
  wheelchair_accessible: null,
  safety_notes: null,
  min_age: null,
  ...(category ? { category } : {}),
});
const ids = (items) => items.map((item) => item.id);

test("audience match ranks above no match", () => {
  const out = sortForPrefs([listing("a", ["Solo"]), listing("b", ["Date"])], { audience: "Date", interests: [] });
  assert.deepEqual(ids(out), ["b", "a"]);
});

test("interest match ranks above no match", () => {
  const out = sortForPrefs([listing("a", [], "Food"), listing("b", [], "Music")], { audience: null, interests: ["Music"] });
  assert.deepEqual(ids(out), ["b", "a"]);
});

test("audience counts more than interest", () => {
  const out = sortForPrefs(
    [listing("interest", [], "Music"), listing("audience", ["Family"], "Food"), listing("both", ["Family"], "Music")],
    { audience: "Family", interests: ["Music"] },
  );
  assert.deepEqual(ids(out), ["both", "audience", "interest"]);
});

test("ties keep input order and nothing is dropped", () => {
  const input = [listing("a", ["Solo"]), listing("b"), listing("c", ["Solo"]), listing("d")];
  const out = sortForPrefs(input, { audience: "Solo", interests: [] });
  assert.deepEqual(ids(out), ["a", "c", "b", "d"]);
  assert.equal(out.length, input.length);
});

test("empty prefs keep the same order and do not mutate the input", () => {
  const input = [listing("a", ["Date"]), listing("b", ["Solo"]), listing("c")];
  const out = sortForPrefs(input, { audience: null, interests: [] });
  assert.deepEqual(ids(out), ["a", "b", "c"]);
  assert.notEqual(out, input);
});
