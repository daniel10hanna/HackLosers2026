import { useAppearance } from '@/lib/appearance';

/** The colour scheme the app shows: the user's Appearance choice, or the phone's setting for "System". */
export function useColorScheme(): 'light' | 'dark' {
  return useAppearance().scheme;
}
