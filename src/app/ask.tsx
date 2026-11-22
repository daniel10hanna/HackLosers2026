import { RecommendationChips } from "@/components/recommendation-chips";
import { usePreferences } from "@/lib/preferences";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, TextInput, View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { BottomTabInset, MaxContentWidth, Spacing } from "@/constants/theme";
import { useTheme } from "@/hooks/use-theme";
import { aiSearch, type AiResult } from "@/lib/ai";
import { demoListings } from "@/lib/demo";
import { loadLiveListings, type Listing } from "@/lib/feed";

const examples = [
  "Free activities tonight",
  "Romantic date under $30",
  "Family-friendly weekend plans",
];
const demoMode = process.env.EXPO_PUBLIC_DEMO_MODE === "true" || (
  !process.env.EXPO_PUBLIC_AI_URL &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL &&
  !process.env.EXPO_PUBLIC_SUPABASE_KEY
);

export default function AskScreen() {
  const { prefs } = usePreferences();
  const theme = useTheme();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AiResult | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  const cachedListings = useRef<Listing[] | null>(null);

  useEffect(() => () => active.current?.abort(), []);

  function edit(text: string) {
    active.current?.abort();
    active.current = null;
    setLoading(false);
    setError(false);
    setResult(null);
    setQuery(text);
  }

  async function search() {
    if (!query.trim() || active.current) return;
    const request = new AbortController();
    active.current = request;
    setLoading(true);
    setResult(null);
    setError(false);
    Keyboard.dismiss();
    try {
      let listings = demoMode ? demoListings : cachedListings.current;
      if (!demoMode) {
        try {
          listings = await loadLiveListings();
          if (!request.signal.aborted) cachedListings.current = listings;
        } catch {
          if (!listings) throw new Error("Live feed unavailable");
        }
      }
      if (!listings || request.signal.aborted) return;
      const response = await aiSearch(query.trim(), listings, request.signal);
      if (!request.signal.aborted) setResult(response);
    } catch {
      if (!request.signal.aborted) setError(true);
    } finally {
      if (active.current === request) {
        active.current = null;
        setLoading(false);
      }
    }
  }

  const disabled = loading || !query.trim();
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={["top", "left", "right"]}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scroll}>
          <View style={styles.content}>
            <View>
              <ThemedText accessibilityRole="header" type="title">Ask AI</ThemedText>
              <ThemedText themeColor="textSecondary">Tell us what you&apos;re in the mood for.</ThemedText>
            </View>
            <TextInput
              accessibilityLabel="Describe your outing"
              placeholder="Describe your perfect Montréal outing..."
              placeholderTextColor={theme.textSecondary}
              value={query}
              onChangeText={edit}
              multiline
              maxLength={500}
              style={[styles.input, { color: theme.text, backgroundColor: theme.backgroundElement }]}
            />
            <View style={styles.chips}>
              {examples.map((example) => (
                <Pressable key={example} accessibilityRole="button" onPress={() => edit(example)}>
                  <ThemedView type="backgroundElement" style={styles.chip}>
                    <ThemedText type="small">{example}</ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityState={{ disabled, busy: loading }}
              disabled={disabled}
              onPress={search}
              style={({ pressed }) => [styles.button, { opacity: disabled ? 0.6 : pressed ? 0.8 : 1 }]}
            >
              {loading && <ActivityIndicator color="#fff" />}
              <ThemedText type="smallBold" style={styles.buttonText}>
                {loading ? "Searching…" : "Search outings"}
              </ThemedText>
            </Pressable>
            <View accessibilityLiveRegion="polite" style={styles.results}>
              {error && <ThemedText>Couldn’t load listings. Check your connection and try again.</ThemedText>}
              {result?.usedFallback && <ThemedText type="smallBold">Basic search used</ThemedText>}
              {!!result?.criteria.length && (
                <View style={styles.chips}>
                  {result.criteria.map((chip, index) => (
                    <ThemedView key={`${chip}-${index}`} type="backgroundSelected" style={styles.chip}>
                      <ThemedText type="small">{chip}</ThemedText>
                    </ThemedView>
                  ))}
                </View>
              )}
              {result && !result.matches.length && (
                <ThemedText>No matching activities found. Try changing your search.</ThemedText>
              )}
              {result?.matches.map(({ listing, explanation }) => (
                <View key={`${listing.kind}-${listing.id}`} style={styles.match}>
                  <ThemedView type="backgroundElement" style={styles.card}>
                    <ThemedText type="small" themeColor="textSecondary">
                      {listing.kind === "event" ? "Event" : "Restaurant"}
                    </ThemedText>
                    <ThemedText type="smallBold">{listing.title}</ThemedText>
                    <RecommendationChips
                      listing={listing}
                      prefs={prefs}
                    />
                  </ThemedView>
                  <ThemedText type="small" themeColor="textSecondary">{explanation}</ThemedText>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  scroll: { padding: Spacing.four, paddingBottom: BottomTabInset + Spacing.four },
  content: { width: "100%", maxWidth: MaxContentWidth, alignSelf: "center", gap: Spacing.three },
  input: { minHeight: 120, borderRadius: 18, padding: Spacing.three, fontSize: 17, textAlignVertical: "top" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: Spacing.two },
  chip: { minHeight: 44, justifyContent: "center", paddingHorizontal: 12, borderRadius: 22 },
  button: {
    minHeight: 50, borderRadius: 14, backgroundColor: "#5741B1", alignItems: "center",
    justifyContent: "center", flexDirection: "row", gap: Spacing.two,
  },
  buttonText: { color: "#fff" },
  results: { gap: Spacing.three },
  match: { gap: Spacing.one },
  card: { padding: Spacing.three, borderRadius: 14, gap: Spacing.one },
});
