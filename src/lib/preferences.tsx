import type { Preferences } from "./personalize";

interface PreferencesState {
  prefs: Preferences;
  setPrefs: (prefs: Preferences) => void;
  ready: boolean;
  onboarded: boolean;
}

const defaultPreferences: Preferences = {
  audience: null,
  interests: [],
};

export function usePreferences(): PreferencesState {
  return {
    prefs: defaultPreferences,
    setPrefs: () => {},
    ready: true,
    onboarded: false,
  };
}
