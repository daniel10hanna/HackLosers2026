
import type { Listing } from "./feed";

export function formatBoolean(value: boolean | null): string {
    if (value === null) {
        return "Not specified";
    }

    return value ? "Yes" : "No";
}

export function getFitDetails(listing: Listing) {
    return {
        audience:
            listing.audience_tags.length > 0
                ? listing.audience_tags.join(", ")
                : "Not specified",

        environment:
            listing.is_indoor === null
                ? "Not specified"
                : listing.is_indoor
                    ? "Indoor"
                    : "Outdoor",

        kidFriendly: formatBoolean(listing.kid_friendly),

        wheelchairAccessible: formatBoolean(
            listing.wheelchair_accessible,
        ),

        minimumAge:
            listing.min_age === null
                ? "Not specified"
                : `${listing.min_age}+`,

        safety:
            listing.safety_notes?.trim() || "Not specified",
    };
}
