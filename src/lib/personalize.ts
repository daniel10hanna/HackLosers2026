import type { AudienceTag, Listing } from "./feed";

export interface Preferences {
  audience: AudienceTag | null;
  interests: string[];
}

export function sortForPrefs(
  events: Listing[],
  _prefs: Preferences,
): Listing[] {
  return events;
}
