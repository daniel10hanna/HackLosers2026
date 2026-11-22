// OWNER: Lamees (US-01). Card used by every list (feed, search, saved, Ask AI).
import { router } from "expo-router";
import { Pressable } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import type { Listing } from "@/lib/feed";
import { formatPrice, formatWhen } from "@/lib/listings";

export function ListingCard({ listing }: { listing: Listing }) {
  const when = formatWhen(listing);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Open ${listing.title}`}
      onPress={() => router.push({ pathname: "/listing/[id]", params: { id: listing.id } })}
    >
      <ThemedView type="backgroundElement" style={{ padding: 16, borderRadius: 12, gap: 4 }}>
        <ThemedText type="smallBold">{listing.title}</ThemedText>
        <ThemedText type="small">
          {listing.kind === "event" ? "Event" : "Restaurant"}
          {listing.category ? ` · ${listing.category}` : ""}
          {listing.neighborhood ? ` · ${listing.neighborhood}` : ""}
        </ThemedText>
        {when && <ThemedText type="small">{when}</ThemedText>}
        <ThemedText type="small">{formatPrice(listing)}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}