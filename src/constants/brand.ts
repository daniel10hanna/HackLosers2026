import { Platform } from "react-native";

import { useColorScheme } from "@/hooks/use-color-scheme";

// Base44 "Near & Now" look: cream paper, ink text, serif titles, red accent.
// Shared so other screens (cards, Search, detail) can switch to the same style.
export const BrandLight = {
  paper: "#F7F3EC",
  card: "#FFFFFF",
  ink: "#1E1B18",
  muted: "#7A736B",
  line: "#E6DFD3",
  accent: "#C8372D",
  accentText: "#FFFFFF",
  danger: "#B42318",
  success: "#2F6B4F",
};

export const BrandDark: typeof BrandLight = {
  paper: "#171513",
  card: "#211E1B",
  ink: "#F3EEE6",
  muted: "#A39B90",
  line: "#36312B",
  accent: "#E04A3F",
  accentText: "#FFFFFF",
  danger: "#FF8A80",
  success: "#7FC8A0",
};

export type BrandColors = typeof BrandLight;

/** Brand colours for the current Appearance setting (System / Light / Dark). */
export function useBrand(): BrandColors {
  return useColorScheme() === "dark" ? BrandDark : BrandLight;
}

export const SerifFont = Platform.select({ ios: "Georgia", android: "serif", default: "Georgia, serif" });
