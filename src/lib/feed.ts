import { createClient } from "@supabase/supabase-js";
export type AudienceTag = "Solo" | "Date" | "Friends" | "Family" | "Tourist";

export interface Listing {
  id: string;
  title: string;
  kind: "event" | "restaurant";
  audience_tags: AudienceTag[];
  is_indoor: boolean | null;
  kid_friendly: boolean | null;
  wheelchair_accessible: boolean | null;
  safety_notes: string | null;
  min_age: number | null;
}

const listingFields =
  "id,title,audience_tags,is_indoor,kid_friendly,wheelchair_accessible,safety_notes,min_age";

export async function loadLiveListings(): Promise<Listing[]> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error("Add your Supabase URL and publishable key to .env.local.");
  }

  const supabase = createClient(url, key);

  const [events, restaurants] = await Promise.all([
    supabase.from("events").select(listingFields).eq("status", "published"),
    supabase.from("restaurants").select(listingFields).eq("published", true),
  ]);

  if (events.error) throw new Error(events.error.message);
  if (restaurants.error) throw new Error(restaurants.error.message);

  return [
    ...events.data.map((row) => ({ ...row, kind: "event" as const })),
    ...restaurants.data.map((row) => ({ ...row, kind: "restaurant" as const })),
  ];
}
