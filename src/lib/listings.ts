// OWNER: Lamees (US-01). Pure helpers for browsing listings.
import type { Listing } from "./feed";

/** Case-insensitive match on title, category, venue, neighborhood and description. Empty query matches all. */
export function matchesSearch(listing: Listing, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return [listing.title, listing.category, listing.venue, listing.neighborhood, listing.description]
    .some((field) => field?.toLowerCase().includes(q));
}

/** Hide events that already ended; upcoming events first (soonest first), then restaurants A–Z. */
export function sortForBrowse(listings: Listing[], now: Date = new Date()): Listing[] {
  const ended = (l: Listing) => {
    const end = l.end_time ?? l.start_time;
    return l.kind === "event" && end !== null && Date.parse(end) < now.getTime();
  };
  const time = (l: Listing) => (l.start_time ? Date.parse(l.start_time) : Number.POSITIVE_INFINITY);
  return listings
    .filter((l) => !ended(l))
    .sort((a, b) =>
      a.kind !== b.kind ? (a.kind === "event" ? -1 : 1)
      : a.kind === "event" ? time(a) - time(b)
      : a.title.localeCompare(b.title));
}

export function formatPrice(listing: Listing): string {
  if (listing.price === null) return "Price not specified";
  if (listing.price === 0) return "Free";
  return listing.kind === "restaurant" ? `~$${listing.price} per person` : `$${listing.price}`;
}

export function formatWhen(listing: Listing): string | null {
  if (!listing.start_time) return null;
  return new Date(listing.start_time).toLocaleString("en-CA", {
    timeZone: "America/Toronto", weekday: "short", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });
}