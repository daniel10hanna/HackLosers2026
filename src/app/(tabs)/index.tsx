import { useMemo, useState } from "react";
import { Button, FlatList, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListingCard } from "@/components/listing-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { matchesSearch, sortForBrowse } from "@/lib/listings";
import { useListings } from "@/lib/listings-provider";

export default function HomeScreen() {
  const { listings, mode, setMode, loading, error, refresh } = useListings();
  const [query, setQuery] = useState("");
  const theme = useTheme();
  const results = useMemo(
    () => sortForBrowse(listings).filter((listing) => matchesSearch(listing, query)),
    [listings, query],
  );

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "left", "right"]}>
        <FlatList
          data={results}
          keyExtractor={(listing) => `${listing.kind}-${listing.id}`}
          renderItem={({ item }) => <ListingCard listing={item} />}
          contentContainerStyle={{ padding: 24, paddingBottom: BottomTabInset + 24, gap: 12 }}
          keyboardShouldPersistTaps="handled"
          refreshing={loading}
          onRefresh={refresh}
          ListHeaderComponent={
            <View style={{ gap: 12 }}>
              <ThemedText type="title">MTL NOW</ThemedText>
              <Button
                title={mode === "demo" ? "Switch to Live" : "Switch to Demo"}
                onPress={() => setMode(mode === "demo" ? "live" : "demo")}
                disabled={loading}
              />
              <TextInput
                accessibilityLabel="Search listings"
                placeholder="Search Montréal"
                placeholderTextColor={theme.textSecondary}
                value={query}
                onChangeText={setQuery}
                returnKeyType="search"
                style={{ color: theme.text, backgroundColor: theme.backgroundElement, borderRadius: 12, padding: 12, fontSize: 16 }}
              />
              {error ? (
                <ThemedText>Live feed error: {error}</ThemedText>
              ) : (
                <ThemedText type="small">
                  {mode === "demo" ? "Demo" : "Live"} · {results.length} listings
                </ThemedText>
              )}
            </View>
          }
          ListEmptyComponent={
            loading ? undefined : <ThemedText>{query ? `Nothing matches "${query}".` : "No listings yet."}</ThemedText>
          }
        />
      </SafeAreaView>
    </ThemedView>
  );
}