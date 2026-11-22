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
  // US-01 browse fields. null = not specified (restaurants have no start/end time or venue).
  category: string | null;
  description: string | null;
  start_time: string | null;
  end_time: string | null;
  venue: string | null;
  address: string | null;
  neighborhood: string | null;
  price: number | null;
  latitude: number | null;
  longitude: number | null;
  source_url: string | null;
}

const fitFields =
  "audience_tags,is_indoor,kid_friendly,wheelchair_accessible,safety_notes,min_age";
const eventFields =
  "id,title,category,description,start_time,end_time,venue,address,neighborhood,price,latitude,longitude,source_url," +
  fitFields;
const restaurantFields =
  "id,title,category,description,address,neighborhood,price,latitude,longitude,source_url," +
  fitFields;

export async function loadLiveListings(): Promise<Listing[]> {
  const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
  const key = process.env.EXPO_PUBLIC_SUPABASE_KEY;

  if (!url || !key) {
    throw new Error("Add your Supabase URL and publishable key to .env.local.");
  }

  const supabase = createClient(url, key);

  const [events, restaurants] = await Promise.all([
    supabase.from("events").select(eventFields).eq("status", "published"),
    supabase.from("restaurants").select(restaurantFields).eq("published", true),
  ]);

  if (events.error) throw new Error(events.error.message);
  if (restaurants.error) throw new Error(restaurants.error.message);

  type EventRow = Omit<Listing, "kind">;
  type RestaurantRow = Omit<Listing, "kind" | "start_time" | "end_time" | "venue">;

  return [
    ...(events.data as unknown as EventRow[]).map((row) => ({ ...row, kind: "event" as const })),
    ...(restaurants.data as unknown as RestaurantRow[]).map((row) => ({
      ...row,
      kind: "restaurant" as const,
      start_time: null,
      end_time: null,
      venue: null,
    })),
  ];
}