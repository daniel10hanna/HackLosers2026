import type { Listing } from "./feed";

export interface Constraints {
  indoor?: boolean;
  kidFriendly?: boolean;
  wheelchairAccessible?: boolean;
}

export function passes(_event: Listing, _constraints: Constraints): boolean {
  return true;
}
