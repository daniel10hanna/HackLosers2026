# US-00 Shared Contract

Events and restaurants share these fields:

| Field                 | Type                                             |
| --------------------- | ------------------------------------------------ |
| audience_tags         | Array of Solo, Date, Friends, Family, or Tourist |
| is_indoor             | boolean or null                                  |
| kid_friendly          | boolean or null                                  |
| wheelchair_accessible | boolean or null                                  |
| safety_notes          | string or null                                   |
| min_age               | integer or null                                  |

For nullable fields, `null` means “Not specified.” Show that label in
listing details. An unknown value does not satisfy a selected filter.

## Shared interfaces

- `passes(event, constraints)` returns a boolean. The placeholder returns `true`.
- `sortForPrefs(events, prefs)` returns listings. The placeholder preserves their order.
- `reasons(event, prefs?)` returns an array of strings. The placeholder returns `[]`.
- `usePreferences()` returns `{ prefs, setPrefs, ready, onboarded }`.
- `aiSearch(query, events, signal)` returns an `AiResult` from published listings.

## Placeholder routes

- `/onboarding` for outing preferences.
- `/ask` for natural-language search.
