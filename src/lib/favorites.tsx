// OWNER: Tanzia. Favourites saved on the phone.
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Listing } from "./feed";

const storageKey = "mtlnow.favorites.v1";

/** Events and restaurants can share an id, so the kind is part of the key. */
export const favoriteKey = (listing: Pick<Listing, "id" | "kind">) => `${listing.kind}-${listing.id}`;

interface FavoritesState {
  /** Saved listings, most recently saved first. A copy is kept so they still show if the feed changes. */
  favorites: Listing[];
  ready: boolean;
  isFavorite: (listing: Pick<Listing, "id" | "kind">) => boolean;
  toggle: (listing: Listing) => void;
  /** Saved copy of a listing by id, for screens that can't find it in the current feed. */
  find: (id: string) => Listing | undefined;
}

const fallback: FavoritesState = {
  favorites: [],
  ready: true,
  isFavorite: () => false,
  toggle: () => {},
  find: () => undefined,
};

const FavoritesContext = createContext<FavoritesState | null>(null);

function isListing(value: unknown): value is Listing {
  const item = value as Partial<Listing> | null;
  return !!item && typeof item.id === "string" && typeof item.title === "string" && (item.kind === "event" || item.kind === "restaurant");
}

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(storageKey)
      .then((raw) => {
        if (!active || !raw) return;
        const saved = JSON.parse(raw);
        if (Array.isArray(saved)) setFavorites(saved.filter(isListing));
      })
      .catch(() => {})
      .finally(() => active && setReady(true));
    return () => {
      active = false;
    };
  }, []);

  const toggle = useCallback((listing: Listing) => {
    setFavorites((current) => {
      const key = favoriteKey(listing);
      const next = current.some((item) => favoriteKey(item) === key)
        ? current.filter((item) => favoriteKey(item) !== key)
        : [listing, ...current];
      AsyncStorage.setItem(storageKey, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<FavoritesState>(() => {
    const keys = new Set(favorites.map(favoriteKey));
    return {
      favorites,
      ready,
      toggle,
      isFavorite: (listing) => keys.has(favoriteKey(listing)),
      find: (id) => favorites.find((item) => item.id === id),
    };
  }, [favorites, ready, toggle]);

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

/** Safe anywhere: outside the provider it returns an empty list instead of throwing. */
export function useFavorites(): FavoritesState {
  return useContext(FavoritesContext) ?? fallback;
}
