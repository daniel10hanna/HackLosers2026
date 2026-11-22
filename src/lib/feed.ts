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
