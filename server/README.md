# MTL NOW outing search

## Run locally

Use Python 3.11 or later. From the repository root, in PowerShell:

```powershell
cd server
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
$env:SUPABASE_URL = "https://YOUR-PROJECT.supabase.co"
$env:SUPABASE_PUBLISHABLE_KEY = "sb_publishable_..."
$env:GEMINI_API_KEY = ([pscredential]::new('Gemini', (Read-Host 'Gemini API key' -AsSecureString))).GetNetworkCredential().Password
.\.venv\Scripts\python.exe -m uvicorn main:app --reload
```

With the virtual environment active, the equivalent command is `uvicorn main:app --reload`. Get a Gemini Developer API key from [Google AI Studio](https://aistudio.google.com/apikey) and set it in the backend process environment. To load `server/.env.local` explicitly when running from `server/`, pass `--env-file .env.local` to Uvicorn. Keep the key out of Expo variables and committed files. An unset key enables server-side keyword search. Supabase requires a publishable key and both published-only RLS policies from the team migration. Set `GEMINI_MODEL` to override the default [`gemini-3.5-flash-lite`](https://aistudio.google.com/docs/models/gemini-3.5-flash-lite) with another Gemini Developer API model that supports structured output.

```powershell
Invoke-RestMethod http://localhost:8000/health
$body = @{ query = 'Find me a free indoor event tomorrow in Montréal' } | ConvertTo-Json -Compress
Invoke-RestMethod -Method Post http://localhost:8000/search -ContentType 'application/json; charset=utf-8' -Body $body | ConvertTo-Json -Depth 6
.\.venv\Scripts\python.exe -m unittest discover -s tests -v
```

The endpoint returns `criteria`, `matches: [{ listing: { id }, explanation }]`, and `usedFallback` as defined by the app's result shape. A live response with `usedFallback: false` confirms Gemini criteria extraction, even with zero matches. Missing credentials, quota or rate limits, provider errors, a timeout, and invalid output trigger keyword search with `usedFallback: true`. The automated suite mocks Gemini and Supabase. A manual `POST /search` with a valid Gemini key uses your API quota.

The mobile client hydrates each reference from its published feed. A backend feed failure returns HTTP 503. Gemini receives the query, Montreal local time, and category labels from the eligible public data. Supabase credentials stay in the backend.

On fallback, the server logs a fixed error category, the exception class, and
the provider HTTP status when available. The warning omits credentials, query
text, generated output, and the raw provider error.

## Test Gemini with the 16 shared demo listings

Run the following from the project root in the PowerShell terminal that has
`GEMINI_API_KEY`. Use Node.js 22.6+ for the TypeScript export and the Python
virtual environment from the setup above.

```powershell
node --experimental-strip-types server/export-demo.mjs
$env:US06_DEMO_LISTINGS_FILE = (Resolve-Path server/.demo-listings.json).Path
if (-not $env:GEMINI_API_KEY) { throw 'Set GEMINI_API_KEY in this terminal first.' }
Set-Location server
.\.venv\Scripts\python.exe -m uvicorn main:app --host 127.0.0.1 --port 8000
```

From a second terminal, send real Gemini requests through the backend:

```powershell
foreach ($query in 'jazz tonight', 'indoor activities', 'family-friendly activities', 'jazz') {
    $body = @{ query = $query } | ConvertTo-Json -Compress
    $result = Invoke-RestMethod -Method Post http://127.0.0.1:8000/search -ContentType 'application/json' -Body $body
    [pscustomobject]@{
        query = $query
        usedFallback = $result.usedFallback
        criteria = $result.criteria -join ', '
        listingIds = $result.matches | ForEach-Object { $_.listing.id }
    } | ConvertTo-Json -Depth 4
    if ($result.usedFallback -ne $false) { throw "Gemini did not complete: $query" }
}
```

`usedFallback: false` is the live Gemini success signal. The shared fixtures
have no start times, so `jazz tonight` can extract `Tonight` and correctly
return zero matches. Use `jazz` by itself to exercise a positive title match.
The demo backend reads the exported fixtures and skips Supabase. Stop Uvicorn,
run `Remove-Item Env:US06_DEMO_LISTINGS_FILE`, and restart to use Supabase
again. With a fixture configured and no Gemini key, the same endpoint uses
keyword fallback against the fixtures. The Python demo tests mock criteria
extraction or omit the key, so they make no Gemini requests.

## Expo Go

1. Use the team's Android Expo Go build compatible with SDK 58.
2. In the project root, set the following values in the ignored `.env.local` for live search:

   ```dotenv
   EXPO_PUBLIC_AI_URL=https://YOUR-SERVICE.onrender.com
   EXPO_PUBLIC_DEMO_MODE=false
   EXPO_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
   EXPO_PUBLIC_SUPABASE_KEY=sb_publishable_...
   ```

   Use the same Supabase project on the client and server so the listing IDs align. For local phone testing, start Uvicorn with `--host 0.0.0.0 --port 8000` and use your computer's LAN address, such as `http://192.168.1.20:8000`, for `EXPO_PUBLIC_AI_URL`. Join the same Wi-Fi network and open the backend's `/health` from the phone to verify reachability. Use a reachable HTTPS URL if LAN HTTP is blocked.
3. Run `npx expo start --go --clear` from the project root (`npx.cmd expo start --go --clear` in Windows PowerShell if script execution is disabled), then scan the QR code.
4. Once the navigation owner registers Ask AI, open it and submit a prompt. Turn off Uvicorn and repeat to exercise the basic-search notice.
5. To test without credentials, set `EXPO_PUBLIC_DEMO_MODE=true` and restart Expo. Try `jazz tonight`, `family`, or `accessible indoor activity for kids`. The shipped fixtures have audience and some fit attributes, with no prices or schedules. Basic results show the facts those fixtures actually contain. Date and budget terms in basic mobile search are unverified.

## Render deployment

Create a Python Web Service after connecting and authorizing the GitHub repository in Render. Select the branch that contains these changes and configure:

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Build Command | `pip install -r requirements.txt` |
| Start Command | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/health` |

Set `GEMINI_API_KEY`, `SUPABASE_URL` and `SUPABASE_PUBLISHABLE_KEY` in the Render environment, deploy, then verify both endpoints before setting `EXPO_PUBLIC_AI_URL` to the service base URL. Use [Render's FastAPI deployment guide](https://render.com/docs/deploy-fastapi) for account setup.

## Integration with the checked-in US-00 foundation

- Navigation owner: add `<NativeTabs.Trigger name="ask">` with `<NativeTabs.Trigger.Label>Ask AI</NativeTabs.Trigger.Label>` in `src/components/app-tabs.tsx`. Add `<TabTrigger name="ask" href="/ask" asChild><TabButton>Ask AI</TabButton></TabTrigger>` inside the tab list in `src/components/app-tabs.web.tsx`. Both are required for Ask AI to be selectable from the current navigators.
- Shared test owner: update the placeholder assertion in `tests/us-00.test.mjs` to run with demo mode enabled and expect `usedFallback: true` and `demo-02` for `jazz tonight`.
- Shared UI/feed owners: once the provider and card exist, use `useEvents()` for Ask AI's current listings and render each reference with `<EventCard event={listing} />`. This branch uses the current `loadLiveListings()` and the same themed card layout as Home.
- Data owners: the event schema exposes its start but no end time. Started events are excluded using the start timestamp. If end times are added, project `end_time` in the backend and shared feed and evaluate ongoing events by their verified end. The backend can match neighborhood text already present in `address`. A dedicated neighborhood field is needed for structured neighborhood coverage across all rows. Restaurant hours and listing descriptions are absent. Dated restaurant recommendations describe stored attributes without claiming availability. The backend derives allowed category values from published records because there is no checked-in category enum.
