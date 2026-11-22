# MTL NOW – QA checklist (US-17)

Run this on **two phones** (one iPhone, one Android) with Expo Go, after the 07:00 merges and before the 09:30 freeze.

- **Demo mode:** no `.env.local` (or `EXPO_PUBLIC_DEMO_MODE=true`). Uses the 16 demo listings.
- **Live mode:** `.env.local` with `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_KEY`, `EXPO_PUBLIC_AI_URL` (ask Daniel / Youssef).
- Restart `npx expo start` after changing `.env.local`.
- Mark each cell ✅ pass, ❌ fail (+ issue #), or – (feature not on main yet).

## Results

| # | Flow | Owner | iOS demo | iOS live | Android demo | Android live |
|---|------|-------|---------|---------|-------------|-------------|
| 1 | Onboarding | Tanzia | | | | |
| 2 | Search + filters | Lamees | | | | |
| 3 | Reason chips on cards | Matvei | | | | |
| 4 | Listing detail (fit info) | Matvei | | | | |
| 5 | Ask AI | Youssef | | | | |
| 6 | Real Montréal data | Daniel | – | | – | |
| 7 | Chillz | Daniel | | | | |
| 8 | Map | Daniel | | | | |
| 9 | Favourites / Saved | Daniel | | | | |
| 10 | Profile / sign-in | Daniel | – | | – | |

## Steps

### 1. Onboarding (US-03)
- [ ] Fresh install (delete Expo Go app data or reinstall): "Plan your outing" appears on launch.
- [ ] "Start exploring" is disabled until an audience is picked.
- [ ] Pick **Family** + **Music** → Start exploring → onboarding closes.
- [ ] Fully close Expo Go and reopen → goes straight to the app (choice saved).
- [ ] Reopen onboarding (from Search, once linked) → Family + Music are pre-selected.
- [ ] Fresh install → "Skip for now" → onboarding does not come back after restart.

### 2. Search + filters (US-04)
- [ ] Chips **Indoor**, **Kid-friendly**, **Accessible** are visible.
- [ ] Each chip narrows the list; two chips together narrow it further (AND).
- [ ] Works for both events and restaurants.
- [ ] A listing with "Not specified" for that field disappears when the chip is on.
- [ ] Turn on chips until nothing matches → empty state names the active chips and suggests turning one off.
- [ ] With audience Family saved: Family listings appear first.

### 3. Reason chips (US-05)
- [ ] Each card shows 0–3 reasons (e.g. "Good for families", "Indoor").
- [ ] Audience/interest reasons come before practical ones.
- [ ] No reason appears for a field that is "Not specified".

### 4. Listing detail (US-02)
- [ ] Tap a card → detail opens (events **and** restaurants).
- [ ] Sections "Who it's for", "Access", "Safety" are present.
- [ ] Missing values say "Not specified" – nothing guessed.

### 5. Ask AI (US-06)
- [ ] Screen shows the text box, example prompts, and "Ask AI" header.
- [ ] Tap an example → results appear, each with a one-line explanation.
- [ ] Nonsense query (e.g. "underwater skydiving") → "No matching activities found."
- [ ] Demo mode → results come from demo listings and "Basic search used" shows.
- [ ] Live mode, first query of the day may be slow (server waking) → after ~8 s shows "Basic search used", second query uses AI.
- [ ] Tap a result (event **and** restaurant) → detail opens, not a blank page.
- [ ] Airplane mode → error/fallback message, no crash.

### 6. Real data (US-07) – live only
- [ ] 40+ listings load; several are this weekend.
- [ ] Places and venues are real Montréal ones; source link opens.

### 7–10. Chillz, Map, Favourites, Profile
- [ ] Chillz: create an outing with an event + a restaurant → total cost/time shows; edit and delete work.
- [ ] Map: pins appear in Montréal; tapping a pin opens the listing.
- [ ] Favourites: save a listing → appears in Saved → still there after restart → unsave works.
- [ ] Profile: sign up / sign in / sign out with a test email (live only).

### Everywhere
- [ ] Dark and light mode both readable.
- [ ] No red error screen, no yellow warning box during any flow.
- [ ] Pull to refresh (if present) doesn't duplicate listings.

## Filing bugs

For each ❌: open a GitHub issue titled `[QA] <flow>: <what's wrong>`, with phone + mode, steps, a screenshot, and assign the file owner from the table above. Re-test after the fix and change the cell to ✅.
