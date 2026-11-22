
import type { Listing } from "./feed";
import type { Preferences } from "./personalize";

export function reasons(
  event: Listing,
  prefs?: Preferences,
): string[] {
  const result: string[] = [];

  // 1. Personalized audience reason
  if (
    prefs?.audience &&
    event.audience_tags.includes(prefs.audience)
  ) {
    result.push(
      `Matches your ${prefs.audience} preference`,
    );
  }

  // 2. Personalized interest reasons
  const listingText = `${event.title} ${event.kind}`.toLowerCase();

  const matchedInterests = new Set<string>();

  for (const interest of prefs?.interests ?? []) {
    const normalizedInterest = interest.trim().toLowerCase();

    if (
      normalizedInterest &&
      listingText.includes(normalizedInterest) &&
      !matchedInterests.has(normalizedInterest)
    ) {
      result.push(`Matches your ${interest.trim()} interest`);
      matchedInterests.add(normalizedInterest);
    }
  }

  // 3. Practical recommendation reasons
  if (event.is_indoor === true) {
    result.push("Indoor");
  }

  if (event.kid_friendly === true) {
    result.push("Kid-friendly");
  }

  if (event.wheelchair_accessible === true) {
    result.push("Accessible");
  }

  // 4. Return a maximum of three reasons
  return result.slice(0, 3);
}
