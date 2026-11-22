import { RecommendationChips } from "@/components/recommendation-chips";
import { usePreferences } from "@/lib/preferences";
import { useState } from "react";
import {
  Button,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { FitDetails } from "@/components/fit-details";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset } from "@/constants/theme";
import { demoListings } from "@/lib/demo";
import { loadLiveListings, type Listing } from "@/lib/feed";

export default function HomeScreen() {
  const { prefs } = usePreferences();
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // US-02: Track the currently selected listing
  const [selectedListing, setSelectedListing] =
    useState<Listing | null>(null);

  const listings = mode === "demo" ? demoListings : liveListings;

  async function switchMode() {
    if (mode === "live") {
      setMode("demo");
      setError(null);
      return;
    }

    setMode("live");
    setLoading(true);
    setError(null);

    try {
      setLiveListings(await loadLiveListings());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Could not load live listings.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingBottom: BottomTabInset + 24,
            gap: 12,
          }}
        >
          <ThemedText type="title">MTL NOW</ThemedText>

          <Button
            title={mode === "demo" ? "Switch to Live" : "Switch to Demo"}
            onPress={switchMode}
            disabled={loading}
          />

          {loading ? (
            <ThemedText>Loading live listings…</ThemedText>
          ) : error ? (
            <ThemedText>Live feed error: {error}</ThemedText>
          ) : (
            <>
              <ThemedText>
                {mode === "demo" ? "Demo" : "Live"} listings ({listings.length})
              </ThemedText>

              {listings.map((listing) => (
                <Pressable
                  key={`${listing.kind}-${listing.id}`}
                  onPress={() => setSelectedListing(listing)}
                  accessibilityRole="button"
                  accessibilityLabel={`View details for ${listing.title}`}
                >
                  <ThemedView
                    type="backgroundElement"
                    style={{ padding: 16, borderRadius: 12 }}
                  >
                    <ThemedText type="smallBold">
                      {listing.title}
                    </ThemedText>

                    <ThemedText type="small">
                      {listing.kind === "event" ? "Event" : "Restaurant"}
                      {" · "}
                      {listing.audience_tags.join(", ")}
                    </ThemedText>

                    {/* US-05: Recommendation reasons */}
                    <RecommendationChips
                      listing={listing}
                      prefs={prefs}
                    />

                    <ThemedText type="small">
                      View details →
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </>
          )}
        </ScrollView>

        {/* US-02: Listing details modal */}
        <Modal
          visible={selectedListing !== null}
          animationType="slide"
          onRequestClose={() => setSelectedListing(null)}
        >
          <ThemedView style={{ flex: 1 }}>
            <SafeAreaView style={{ flex: 1 }}>
              <ScrollView
                contentContainerStyle={{
                  padding: 24,
                  gap: 16,
                }}
              >
                <Button
                  title="Back to listings"
                  onPress={() => setSelectedListing(null)}
                />

                {selectedListing && (
                  <>
                    <ThemedText type="title">
                      {selectedListing.title}
                    </ThemedText>

                    <ThemedText>
                      {selectedListing.kind === "event"
                        ? "Event"
                        : "Restaurant"}
                    </ThemedText>

                    <FitDetails listing={selectedListing} />
                  </>
                )}
              </ScrollView>
            </SafeAreaView>
          </ThemedView>
        </Modal>
      </SafeAreaView>
    </ThemedView>
  );
}
