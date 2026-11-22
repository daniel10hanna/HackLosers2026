// OWNER: Tanzia. Saved tab: the listings you hearted.
import { FlatList, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ListingCard } from "@/components/listing-card";
import { SerifFont, useBrand } from "@/constants/brand";
import { BottomTabInset } from "@/constants/theme";
import { favoriteKey, useFavorites } from "@/lib/favorites";

export default function SavedScreen() {
  const brand = useBrand();
  const { favorites, ready } = useFavorites();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: brand.paper }} edges={["top", "left", "right"]}>
      <FlatList
        data={favorites}
        keyExtractor={favoriteKey}
        renderItem={({ item }) => <ListingCard listing={item} />}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ marginBottom: 8 }}>
            <Text style={[styles.eyebrow, { color: brand.muted }]}>YOUR LIST</Text>
            <Text style={[styles.title, { color: brand.ink }]}>Saved</Text>
            {favorites.length > 0 && (
              <Text style={{ color: brand.muted }}>
                {favorites.length} {favorites.length === 1 ? "place" : "places"} saved
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          ready ? (
            <View style={[styles.empty, { borderColor: brand.line, backgroundColor: brand.card }]}>
              <Text style={{ fontSize: 32, color: brand.accent }}>♡</Text>
              <Text style={[styles.emptyTitle, { color: brand.ink }]}>Nothing saved yet</Text>
              <Text style={{ color: brand.muted, textAlign: "center" }}>
                Tap the heart on any event or restaurant to keep it here.
              </Text>
            </View>
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 20, paddingBottom: BottomTabInset + 24, gap: 12 },
  eyebrow: { fontSize: 12, letterSpacing: 2, marginTop: 8 },
  title: { fontFamily: SerifFont, fontSize: 36 },
  empty: { alignItems: "center", gap: 8, padding: 28, borderRadius: 16, borderWidth: 1, marginTop: 12 },
  emptyTitle: { fontFamily: SerifFont, fontSize: 22 },
});
