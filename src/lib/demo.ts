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
    category: null,
    description: null,
    start_time: null,
    end_time: null,
    venue: null,
    address: null,
    neighborhood: null,
    price: null,
    latitude: null,
    longitude: null,
    source_url: null,
    ...browse[id],
    ...details,
  };
}

// US-01: fictional browse details for the demo listings. Event times are relative to today (America/Toronto).
function at(dayOffset: number, time: string): string {
  const day = new Date(Date.now() + dayOffset * 86_400_000).toLocaleDateString("en-CA", {
    timeZone: "America/Toronto",
  });
  return new Date(`${day}T${time}:00-05:00`).toISOString();
}

type Browse = Pick<Listing, "category" | "description" | "neighborhood" | "price"> &
  Partial<Pick<Listing, "start_time" | "end_time" | "venue">>;

const event = (
  category: string, neighborhood: string, venue: string, price: number,
  day: number, start: string, end: string, description: string,
): Browse => ({
  category, neighborhood, venue, price, description,
  start_time: at(day, start), end_time: at(day, end),
});
const restaurant = (category: string, neighborhood: string, price: number, description: string): Browse =>
  ({ category, neighborhood, price, description });

const browse: Record<string, Partial<Browse>> = {
  "demo-01": event("Arts", "Plateau", "Atelier Indigo", 15, 0, "14:00", "16:00", "Hands-on painting workshop; all materials included."),
  "demo-02": event("Music", "Mile End", "Velvet Room", 20, 0, "20:00", "23:00", "Live jazz trio in an intimate bar."),
  "demo-03": event("Outdoors", "Lachine Canal", "Atwater Market entrance", 0, 1, "10:00", "12:00", "Guided photo walk along the canal."),
  "demo-04": event("Community", "Verdun", "Maison du Fleuve", 0, 1, "13:00", "15:00", "Bring a book, take a book."),
  "demo-05": event("Arts", "Old Montréal", "Place Jacques-Cartier", 10, 2, "11:00", "13:00", "Sketching tour of historic streets."),
  "demo-06": event("Family", "Parc La Fontaine", "Park bandstand", 0, 2, "15:00", "16:00", "Puppet show for kids and families."),
  "demo-07": event("Comedy", "Downtown", "The Basement", 18, 0, "21:30", "23:00", "Stand-up open mic night."),
  "demo-08": event("Film", "Saint-Henri", "Square Sir-George-Étienne-Cartier", 0, 3, "19:30", "21:30", "Free outdoor movie screening."),
  "demo-09": restaurant("Café", "Saint-Henri", 12, "Coffee and light lunch by the canal."),
  "demo-10": restaurant("Brunch", "Plateau", 22, "Weekend brunch with maple everything."),
  "demo-11": restaurant("Asian", "Chinatown", 16, "Hand-pulled noodles, quick and casual."),
  "demo-12": restaurant("French", "Little Italy", 45, "Small bistro with a garden terrace."),
  "demo-13": restaurant("Pizza", "Rosemont", 18, "Family pizzeria with kids' menu."),
  "demo-14": restaurant("Bakery", "Mile End", 8, "Fresh pastries and espresso."),
  "demo-15": restaurant("Mexican", "Plateau", 15, "Tacos in a courtyard, summer vibes."),
  "demo-16": restaurant("Asian", "Côte-des-Neiges", 14, "Dumplings made to order."),
};

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