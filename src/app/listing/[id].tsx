// OWNER: Lamees (US-01) creates it; Matvei (US-02) adds the fit sections below the basics.
import { Stack, useLocalSearchParams } from "expo-router";
import { Linking, ScrollView } from "react-native";

import { FitDetails } from "@/components/fit-details";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { formatPrice, formatWhen } from "@/lib/listings";
import { useListings } from "@/lib/listings-provider";

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { listings } = useListings();
  const listing = listings.find((item) => item.id === id);

  if (!listing) {
    return (
      <ThemedView style={{ flex: 1, padding: 24 }}>
        <Stack.Screen options={{ title: "Not found" }} />
        <ThemedText>This listing is no longer available.</ThemedText>
      </ThemedView>
    );
  }

  const when = formatWhen(listing);
  const place = [listing.venue, listing.address, listing.neighborhood].filter(Boolean).join(", ");

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack.Screen options={{ title: listing.title }} />
      <ScrollView contentContainerStyle={{ padding: 24, gap: 8 }}>
        <ThemedText type="subtitle">{listing.title}</ThemedText>
        <ThemedText type="small">
          {listing.kind === "event" ? "Event" : "Restaurant"}
          {listing.category ? ` · ${listing.category}` : ""}
        </ThemedText>
        {when && <ThemedText>{when}</ThemedText>}
        <ThemedText>{place || "Location not specified"}</ThemedText>
        <ThemedText>{formatPrice(listing)}</ThemedText>
        {listing.description && <ThemedText>{listing.description}</ThemedText>}
        {listing.source_url && (
          <ThemedText type="linkPrimary" onPress={() => void Linking.openURL(listing.source_url!)}>
            Open original source
          </ThemedText>
        )}
                <FitDetails listing={listing} />
      </ScrollView>
    </ThemedView>
  );
}