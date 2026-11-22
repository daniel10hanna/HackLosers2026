import type { Listing } from "./feed";

export interface AiResult {
  criteria: string[];
  matches: { listing: Listing; explanation: string }[];
  usedFallback: boolean;
}

const LIMIT = 10;
const TIMEOUT_MS = 8500;
const normalize = (text: string) =>
  text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function words(text: string) {
  return normalize(text).match(/[a-z0-9]+/g) ?? [];
}

function eligibleListings(events: Listing[]) {
  return events.filter((listing) => {
    // The shared feed selects published rows but omits these optional details.
    const details = listing as Listing & {
      status?: string; published?: boolean; start_time?: string | null; end_time?: string | null;
    };
    if (listing.kind === "restaurant") return details.published !== false;
    if (details.status !== undefined && details.status !== "published") return false;
    const end = Date.parse(details.end_time ?? details.start_time ?? "");
    return Number.isNaN(end) || end > Date.now();
  });
}

function keywordSearch(query: string, events: Listing[]): AiResult {
  const normalized = normalize(query);
  const audience = /\b(family|families|kids|children)\b/.test(normalized) ? "Family"
    : /\b(date|romantic)\b/.test(normalized) ? "Date"
    : /\b(solo|friends|tourist)\b/.exec(normalized)?.[0];
  const indoor = /\bindoors?\b/.test(normalized);
  const outdoor = /\boutdoors?\b/.test(normalized);
  const accessible = /\b(wheelchair|accessible)\b/.test(normalized);
  const kids = /\b(kids|children|kid-friendly)\b/.test(normalized);
  const dining = /\b(restaurants?|dining|dinner|lunch|brunch|cafes?)\b/.test(normalized);
  const event = /\bevents?\b/.test(normalized);
  const stop = new Set(words(
    "find me show want something to do a an for the in with my i montreal tonight tomorrow this weekend today " +
    "free under less than activities activity plans fun good and of some friendly looking please event events " +
    "restaurant restaurants dining dinner lunch indoor indoors outdoor outdoors wheelchair accessible kids children " +
    "kid family families date romantic solo friends tourist",
  ));
  const terms = [...new Set(words(query).filter((word) => !stop.has(word) && !/^\d+$/.test(word)))];
  const hasFilter = audience || indoor || outdoor || accessible || kids || dining || event;
  const matches = events.flatMap((listing) => {
    const tags = listing.audience_tags;
    if (audience && !tags.some((tag) => normalize(tag) === normalize(audience))) return [];
    if (indoor && listing.is_indoor !== true) return [];
    if (outdoor && listing.is_indoor !== false) return [];
    if (accessible && listing.wheelchair_accessible !== true) return [];
    if (kids && listing.kid_friendly !== true) return [];
    if (dining && !event && listing.kind !== "restaurant") return [];
    if (event && !dining && listing.kind !== "event") return [];

    // Local listings have no price or schedule, so those terms cannot produce a match on their own.
    const titleWords = new Set(words(listing.title));
    const score = terms.filter((term) => titleWords.has(term)).length;
    if (terms.length ? !score : !hasFilter) return [];
    const facts = [listing.kind === "event" ? "Event" : "Restaurant"];
    if (listing.is_indoor !== null) facts.push(listing.is_indoor ? "Indoor" : "Outdoor");
    if (kids) facts.push("Kid-friendly");
    if (accessible) facts.push("Wheelchair accessible");
    if (tags.length) facts.push(tags.join(", "));
    return [{ listing, explanation: facts.join(" · "), score }];
  });
  matches.sort((a, b) => b.score - a.score);
  return {
    criteria: [],
    matches: matches.slice(0, LIMIT).map(({ listing, explanation }) => ({ listing, explanation })),
    usedFallback: true,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseResponse(value: unknown, events: Listing[]): AiResult {
  if (!isObject(value) || typeof value.usedFallback !== "boolean" ||
      !Array.isArray(value.criteria) || !value.criteria.every((chip) => typeof chip === "string") ||
      !Array.isArray(value.matches) || value.matches.length > LIMIT) {
    throw new Error("Invalid search response");
  }

  const allowed = new Map(events.map((event) => [event.id, event]));
  const seen = new Set<string>();
  const matches: AiResult["matches"] = [];
  for (const match of value.matches) {
    if (!isObject(match) || !isObject(match.listing) ||
        typeof match.listing.id !== "string" || typeof match.explanation !== "string" ||
        !match.explanation.trim()) {
      throw new Error("Invalid search match");
    }
    const listing = allowed.get(match.listing.id);
    if (listing && !seen.has(listing.id)) {
      seen.add(listing.id);
      matches.push({ listing, explanation: match.explanation });
    }
  }
  return { criteria: value.criteria, matches, usedFallback: value.usedFallback };
}

function checkAborted(signal?: AbortSignal) {
  if (signal?.aborted) {
    const error = new Error("Search cancelled");
    error.name = "AbortError";
    throw error;
  }
}

export async function aiSearch(
  query: string,
  events: Listing[],
  signal?: AbortSignal,
): Promise<AiResult> {
  checkAborted(signal);
  const allowed = eligibleListings(events);
  const url = process.env.EXPO_PUBLIC_AI_URL?.trim().replace(/\/+$/, "");
  if (!url || process.env.EXPO_PUBLIC_DEMO_MODE === "true") return keywordSearch(query, allowed);

  const controller = new AbortController();
  const abort = () => controller.abort();
  signal?.addEventListener("abort", abort);
  const timeout = setTimeout(abort, TIMEOUT_MS);
  try {
    const response = await fetch(`${url}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("Search service unavailable");
    const result = parseResponse(await response.json(), allowed);
    checkAborted(controller.signal);
    return result;
  } catch {
    checkAborted(signal);
    return keywordSearch(query, eligibleListings(allowed));
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
