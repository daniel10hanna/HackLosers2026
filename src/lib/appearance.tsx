import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { Appearance, useColorScheme as useSystemScheme } from "react-native";

export type AppearanceMode = "system" | "light" | "dark";
export const appearanceModes: { value: AppearanceMode; label: string }[] = [
  { value: "system", label: "System" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const storageKey = "mtlnow.appearance.v1";

interface AppearanceState {
  /** What the user picked. */
  mode: AppearanceMode;
  setMode: (mode: AppearanceMode) => void;
  /** What the app actually shows right now. */
  scheme: "light" | "dark";
}

const AppearanceContext = createContext<AppearanceState | null>(null);

function applyNative(mode: AppearanceMode) {
  // Also switches native parts (tab bar, keyboard, alerts). No-op where unsupported (web).
  try {
    Appearance.setColorScheme?.(mode === "system" ? "auto" : mode);
  } catch {}
}

export function AppearanceProvider({ children }: { children: ReactNode }) {
  const system = useSystemScheme();
  const [mode, setModeState] = useState<AppearanceMode>("system");

  useEffect(() => {
    AsyncStorage.getItem(storageKey)
      .then((saved) => {
        if (saved === "light" || saved === "dark" || saved === "system") {
          setModeState(saved);
          applyNative(saved);
        }
      })
      .catch(() => {});
  }, []);

  const value = useMemo<AppearanceState>(
    () => ({
      mode,
      scheme: mode === "system" ? (system === "dark" ? "dark" : "light") : mode,
      setMode: (next) => {
        setModeState(next);
        applyNative(next);
        AsyncStorage.setItem(storageKey, next).catch(() => {});
      },
    }),
    [mode, system],
  );

  return <AppearanceContext.Provider value={value}>{children}</AppearanceContext.Provider>;
}

export function useAppearance(): AppearanceState {
  const system = useSystemScheme();
  return (
    useContext(AppearanceContext) ?? {
      mode: "system",
      setMode: () => {},
      scheme: system === "dark" ? "dark" : "light",
    }
  );
}
