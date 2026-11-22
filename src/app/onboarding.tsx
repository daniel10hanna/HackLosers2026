import { router } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useTheme } from "@/hooks/use-theme";
import type { AudienceTag } from "@/lib/feed";
import { audiences, interestOptions, usePreferences } from "@/lib/preferences";

function Chip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[
        styles.chip,
        { borderColor: theme.textSecondary, backgroundColor: selected ? theme.text : "transparent" },
      ]}
    >
      <ThemedText type="smallBold" style={{ color: selected ? theme.background : theme.text }}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function leave() {
  // Opened as a route: go back. Shown on first launch by the root layout: it closes by itself.
  if (router.canGoBack()) router.back();
}

export default function OnboardingScreen() {
  const { ready } = usePreferences();
  // Wait for saved choices so the form starts pre-selected with them.
  if (!ready) return <ThemedView style={{ flex: 1 }} />;
  return <OnboardingForm />;
}

function OnboardingForm() {
  const theme = useTheme();
  const { prefs, setPrefs, skipOnboarding } = usePreferences();
  const [audience, setAudience] = useState<AudienceTag | null>(prefs.audience);
  const [interests, setInterests] = useState<string[]>(prefs.interests);

  const toggleInterest = (item: string) =>
    setInterests((current) => (current.includes(item) ? current.filter((x) => x !== item) : [...current, item]));

  return (
    <ThemedView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="title" accessibilityRole="header">
            Plan your outing
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {"Tell us who you're going with and what you like. We'll put the best fits first."}
          </ThemedText>

          <ThemedText type="subtitle">Who are you going with?</ThemedText>
          <View style={styles.chips}>
            {audiences.map((item) => (
              <Chip
                key={item}
                label={item}
                selected={audience === item}
                onPress={() => setAudience(audience === item ? null : item)}
              />
            ))}
          </View>

          <ThemedText type="subtitle">What are you into?</ThemedText>
          <View style={styles.chips}>
            {interestOptions.map((item) => (
              <Chip key={item} label={item} selected={interests.includes(item)} onPress={() => toggleInterest(item)} />
            ))}
          </View>

          <Pressable
            accessibilityRole="button"
            disabled={!audience}
            onPress={() => {
              setPrefs({ audience, interests });
              leave();
            }}
            style={[styles.primary, { backgroundColor: theme.text, opacity: audience ? 1 : 0.4 }]}
          >
            <ThemedText type="smallBold" style={{ color: theme.background }}>
              Start exploring
            </ThemedText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              skipOnboarding();
              leave();
            }}
            style={styles.skip}
          >
            <ThemedText type="small" themeColor="textSecondary">
              Skip for now
            </ThemedText>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 24, gap: 16 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  primary: { marginTop: 8, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  skip: { alignItems: "center", paddingVertical: 8 },
});
