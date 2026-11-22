import type { Listing } from "./feed";

export interface AiResult {
  criteria: string[];
  matches: { listing: Listing; explanation: string }[];
  usedFallback: boolean;
}

export async function aiSearch(
  _query: string,
  _events: Listing[],
  _signal?: AbortSignal,
): Promise<AiResult> {
  return {
    criteria: [],
    matches: [],
    usedFallback: false,
  };
}
