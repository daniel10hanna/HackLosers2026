import type { AudienceTag, Listing } from "./feed";

export interface Preferences {
  audience: AudienceTag | null;
  interests: string[];
}

// Listing has no category yet. Once Daniel adds it to feed.ts,
// interest matching starts working with no change here.
function categoryOf(listing: Listing): string | undefined {
  return (listing as Listing & { category?: string | null }).category ?? undefined;
}

export function scoreForPrefs(listing: Listing, prefs: Preferences): number {
  const audience = prefs.audience && listing.audience_tags?.includes(prefs.audience) ? 2 : 0;
  const category = categoryOf(listing);
  const interest = category && prefs.interests.includes(category) ? 1 : 0;
  return audience + interest;
}

// Best fit first. Never drops a listing; ties keep the original order (sort is stable).
export function sortForPrefs(events: Listing[], prefs: Preferences): Listing[] {
  return [...events].sort((a, b) => scoreForPrefs(b, prefs) - scoreForPrefs(a, prefs));
}
