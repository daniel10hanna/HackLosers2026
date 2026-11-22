// OWNER: Lamees (US-01). Shares the loaded listings between the feed and the detail screen.
import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";
import { demoListings } from "./demo";
import { loadLiveListings, type Listing } from "./feed";

type Mode = "demo" | "live";
interface ListingsState {
  listings: Listing[];
  mode: Mode;
  setMode: (mode: Mode) => void;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const ListingsContext = createContext<ListingsState | null>(null);

export function ListingsProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<Mode>("demo");
  const [live, setLive] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLive(await loadLiveListings());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load live listings.");
    } finally {
      setLoading(false);
    }
  }, []);

  const setMode = useCallback((next: Mode) => {
    setModeState(next);
    setError(null);
    if (next === "live") void load();
  }, [load]);

  const refresh = useCallback(async () => {
    if (mode === "live") await load();
  }, [mode, load]);

  const value = useMemo(
    () => ({ listings: mode === "demo" ? demoListings : live, mode, setMode, loading, error, refresh }),
    [mode, live, setMode, loading, error, refresh],
  );
  return <ListingsContext.Provider value={value}>{children}</ListingsContext.Provider>;
}

export function useListings(): ListingsState {
  const value = useContext(ListingsContext);
  if (!value) throw new Error("useListings must be used inside <ListingsProvider>.");
  return value;
}