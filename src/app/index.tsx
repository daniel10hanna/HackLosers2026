import { useState } from "react";
import { Button, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset } from "@/constants/theme";
import { demoListings } from "@/lib/demo";
import { loadLiveListings, type Listing } from "@/lib/feed";

export default function HomeScreen() {
  const [mode, setMode] = useState<"demo" | "live">("demo");
  const [liveListings, setLiveListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        err instanceof Error ? err.message : "Could not load live listings.",
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
                <ThemedView
                  key={`${listing.kind}-${listing.id}`}
                  type="backgroundElement"
                  style={{ padding: 16, borderRadius: 12 }}
                >
                  <ThemedText type="smallBold">{listing.title}</ThemedText>
                  <ThemedText type="small">
                    {listing.kind === "event" ? "Event" : "Restaurant"}
                    {" · "}
                    {listing.audience_tags.join(", ")}
                  </ThemedText>
                </ThemedView>
              ))}
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
