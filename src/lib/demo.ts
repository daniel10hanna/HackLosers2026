import type { Listing } from "./feed";

type DemoDetails = Partial<
  Omit<Listing, "id" | "title" | "kind" | "audience_tags">
>;

function demoListing(
  id: string,
  title: string,
  kind: Listing["kind"],
  audience_tags: Listing["audience_tags"],
  details: DemoDetails = {},
): Listing {
  return {
    id,
    title,
    kind,
    audience_tags,
    is_indoor: null,
    kid_friendly: null,
    wheelchair_accessible: null,
    safety_notes: null,
    min_age: null,
    ...details,
  };
}

export const demoListings: Listing[] = [
  demoListing(
    "demo-01",
    "Indoor Art Workshop",
    "event",
    ["Family", "Friends"],
    {
      is_indoor: true,
      kid_friendly: true,
      wheelchair_accessible: true,
    },
  ),
  demoListing("demo-02", "Evening Jazz Set", "event", ["Date", "Friends"], {
    is_indoor: true,
    kid_friendly: false,
    min_age: 18,
  }),
  demoListing("demo-03", "Riverside Photo Walk", "event", ["Solo", "Tourist"], {
    is_indoor: false,
    safety_notes: "Some paths are uneven.",
  }),
  demoListing(
    "demo-04",
    "Neighbourhood Book Swap",
    "event",
    ["Solo", "Family"],
    {
      is_indoor: true,
    },
  ),
  demoListing("demo-05", "Old Port Sketch Tour", "event", ["Solo", "Tourist"]),
  demoListing("demo-06", "Park Puppet Show", "event", ["Family", "Tourist"], {
    is_indoor: false,
    kid_friendly: true,
  }),
  demoListing(
    "demo-07",
    "Basement Comedy Night",
    "event",
    ["Date", "Friends"],
    {
      is_indoor: true,
      wheelchair_accessible: false,
      safety_notes: "Venue entrance is down a flight of stairs.",
    },
  ),
  demoListing("demo-08", "Outdoor Film Night", "event", ["Date", "Friends"], {
    is_indoor: false,
  }),
  demoListing("demo-09", "Canal Café", "restaurant", ["Solo", "Date"], {
    is_indoor: true,
    wheelchair_accessible: true,
  }),
  demoListing("demo-10", "Maple Brunch", "restaurant", ["Family", "Tourist"], {
    is_indoor: true,
    kid_friendly: true,
  }),
  demoListing("demo-11", "Market Noodle Bar", "restaurant", [
    "Solo",
    "Friends",
  ]),
  demoListing("demo-12", "Little Garden Bistro", "restaurant", [
    "Date",
    "Tourist",
  ]),
  demoListing(
    "demo-13",
    "Neighbourhood Pizza",
    "restaurant",
    ["Family", "Friends"],
    {
      kid_friendly: true,
    },
  ),
  demoListing("demo-14", "Bakery and Coffee Counter", "restaurant", [
    "Solo",
    "Tourist",
  ]),
  demoListing(
    "demo-15",
    "Courtyard Tacos",
    "restaurant",
    ["Friends", "Tourist"],
    {
      is_indoor: false,
    },
  ),
  demoListing("demo-16", "Corner Dumpling House", "restaurant", [
    "Family",
    "Friends",
  ]),
];
