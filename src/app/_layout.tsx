import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StyleSheet, useColorScheme, View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { PreferencesProvider, usePreferences } from '@/lib/preferences';
import OnboardingScreen from './onboarding';

SplashScreen.preventAutoHideAsync();

// First launch (or after reopenOnboarding): show onboarding on top of the tabs.
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

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PreferencesProvider>
        <AnimatedSplashOverlay />
        <AppTabs />
        <FirstLaunch />
      </PreferencesProvider>
    </ThemeProvider>
  );
}
