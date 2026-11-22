import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StyleSheet, View } from "react-native";

import { AnimatedSplashOverlay } from "@/components/animated-icon";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { AppearanceProvider } from "@/lib/appearance";
import { AuthProvider } from "@/lib/auth";
import { ListingsProvider } from "@/lib/listings-provider";
import { PreferencesProvider, usePreferences } from "@/lib/preferences";
import OnboardingScreen from "./onboarding";

SplashScreen.preventAutoHideAsync();

// First launch (or after reopenOnboarding): show onboarding on top of the app.
// Rendering it as an overlay avoids navigating before the router has mounted.
function FirstLaunch() {
  const { ready, onboarded } = usePreferences();
  if (!ready || onboarded) return null;
  return (
    <View style={StyleSheet.absoluteFill}>
      <OnboardingScreen />
    </View>
  );
}

function ThemedApp() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <AuthProvider>
        <PreferencesProvider>
          <ListingsProvider>
            <AnimatedSplashOverlay />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="listing/[id]"
                options={{ title: "Listing" }}
              />
              <Stack.Screen
                name="onboarding"
                options={{ title: "Your outing" }}
              />
              <Stack.Screen name="ask" options={{ title: "Ask AI" }} />
            </Stack>
            <FirstLaunch />
          </ListingsProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AppearanceProvider>
      <ThemedApp />
    </AppearanceProvider>
  );
}
