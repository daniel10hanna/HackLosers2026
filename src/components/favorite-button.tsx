// OWNER: Tanzia. Heart button to save / unsave a listing.
import { Pressable, StyleSheet, Text } from "react-native";

import { useBrand } from "@/constants/brand";
import type { Listing } from "@/lib/feed";
import { useFavorites } from "@/lib/favorites";

export function FavoriteButton({ listing, size = 22 }: { listing: Listing; size?: number }) {
  const { isFavorite, toggle } = useFavorites();
  const brand = useBrand();
  const saved = isFavorite(listing);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? `Remove ${listing.title} from Saved` : `Save ${listing.title}`}
      accessibilityState={{ selected: saved }}
      hitSlop={10}
      onPress={() => toggle(listing)}
      style={({ pressed }) => [styles.button, pressed && { opacity: 0.6 }]}
    >
      <Text style={{ fontSize: size, lineHeight: size + 4, color: saved ? brand.accent : brand.muted }}>{saved ? "♥" : "♡"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { padding: 4, alignItems: "center", justifyContent: "center" },
});
