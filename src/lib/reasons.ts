
import type { Listing } from "./feed";
import type { Preferences } from "./personalize";

export function reasons(
  listing: Listing,
  prefs?: Preferences,
): string[] {
  const result: string[] = [];

  // Personalized audience match
  if (
    prefs?.audience &&
    listing.audience_tags?.includes(prefs.audience)
  ) {
    result.push(`Matches your ${prefs.audience} preference`);
  }

  // Personalized interest matches
  const listingText = [
    listing.title,
    listing.kind,
    listing.category,
    listing.description,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

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

  // Practical recommendation reasons
  if (listing.price === 0) {
    result.push("Free");
  }

  if (listing.is_indoor === true) {
    result.push("Indoor");
  }

  if (listing.kid_friendly === true) {
    result.push("Kid-friendly");
  }

  if (listing.wheelchair_accessible === true) {
    result.push("Accessible");
  }

  // Maximum of three reasons, personalized reasons first
  return result.slice(0, 3);
}
