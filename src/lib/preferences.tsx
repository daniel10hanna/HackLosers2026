import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { AudienceTag } from "./feed";
import type { Preferences } from "./personalize";

export const audiences: AudienceTag[] = ["Solo", "Date", "Friends", "Family", "Tourist"];
// Same categories as the old MTL NOW app. Replace with Daniel's list once Listing has a category.
export const interestOptions = ["Music", "Food", "Nightlife", "Arts", "Festivals", "Sports", "Community"];

const storageKey = "mtlnow.prefs.v1";

interface PreferencesState {
  prefs: Preferences;
  /** Saves the choices and marks onboarding as done. */
  setPrefs: (prefs: Preferences) => void;
  ready: boolean;
  onboarded: boolean;
  /** Marks onboarding as done without changing the choices ("Skip"). */
  skipOnboarding: () => void;
  /** Shows onboarding again so the user can change the choices. */
  reopenOnboarding: () => void;
}

const defaultPreferences: Preferences = { audience: null, interests: [] };

const fallback: PreferencesState = {
  prefs: defaultPreferences,
  setPrefs: () => {},
  ready: true,
  onboarded: false,
  skipOnboarding: () => {},
  reopenOnboarding: () => {},
};

const PreferencesContext = createContext<PreferencesState | null>(null);

function clean(value: unknown): { prefs: Preferences; onboarded: boolean } {
  const saved = (value ?? {}) as { prefs?: Partial<Preferences>; onboarded?: unknown };
  const audience = audiences.includes(saved.prefs?.audience as AudienceTag) ? (saved.prefs!.audience as AudienceTag) : null;
  const interests = Array.isArray(saved.prefs?.interests)
    ? saved.prefs!.interests.filter((item): item is string => typeof item === "string")
    : [];
  return { prefs: { audience, interests }, onboarded: saved.onboarded === true };
}

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences>(defaultPreferences);
  const [onboarded, setOnboarded] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active || !raw) return;
        const saved = clean(JSON.parse(raw));
        setPrefsState(saved.prefs);
        setOnboarded(saved.onboarded);
      })
      .catch(() => {})
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback((next: Preferences, done: boolean) => {
    setPrefsState(next);
    setOnboarded(done);
    AsyncStorage.setItem(storageKey, JSON.stringify({ prefs: next, onboarded: done })).catch(() => {});
  }, []);

  const value = useMemo<PreferencesState>(
    () => ({
      prefs,
      ready,
      onboarded,
      setPrefs: (next) => persist(next, true),
      skipOnboarding: () => persist(prefs, true),
      reopenOnboarding: () => setOnboarded(false),
    }),
    [prefs, ready, onboarded, persist],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

/** Safe to call anywhere: outside the provider it returns the defaults instead of throwing. */
export function usePreferences(): PreferencesState {
  return useContext(PreferencesContext) ?? fallback;
}
