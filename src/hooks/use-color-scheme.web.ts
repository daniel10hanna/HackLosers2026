import { useSyncExternalStore } from "react";

import { useAppearance } from "@/lib/appearance";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
const subscribe = () => () => {};
export function useColorScheme(): "light" | "dark" {
  const hasHydrated = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  const colorScheme = useAppearance().scheme;

  if (hasHydrated) {
    return colorScheme;
  }

  return "light";
}
