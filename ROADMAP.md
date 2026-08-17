# flySpot Roadmap (v2)

Supersedes the original roadmap. Steps 0–2 (env truth, crash-proof server,
tests + CI), Step 4 (data architecture: waterways in Mongo, compression +
caching, real `riverId`/`riverGroup` FK on catches), and Step 5's core
(client `res.ok` handling, token-expiry auto-logout) are **done**.
Carried over from v1: deployment (old Step 3, deferred) and the general
UX-polish bucket (old Step 6), now broken into concrete steps below.

Steps are roughly ordered: bugs first, then the map/UX work, then features,
then deployment last (some features depend on it).

---

## Step 1 — Bug fixes & hardening (small, do first)

Known real bugs found in the audit:

- **Catch date off-by-one (UTC bug).** `LogCatch.jsx` defaults the date to
  `new Date().toISOString().split('T')[0]` — that's the **UTC** date, so any
  catch logged after ~5pm Pacific defaults to *tomorrow*. Worse, the date-only
  string ("2026-08-16") is stored as UTC midnight, and
  `new Date(c.caughtAt).toLocaleDateString()` in `RiverPanel.jsx` renders that
  as the **previous day** in Pacific time. Log a catch today, see yesterday's
  date on it.
- **Pokedex has no error handling.** `Promise.all([getAllSpecies(),
  getMyCatches()])` has no `.catch` — since `getMyCatches` requires auth, an
  expired session leaves the Pokédex stuck on "LOADING..." forever (and an
  unhandled promise rejection in the console).
- **LogCatch species fetch has no error handling.** `getAllSpecies().then(setSpecies)`
  — same pattern, no `.catch`; a failure silently shows "NO RESULTS".
- **No React error boundary.** Any uncaught render error still unmounts the
  whole tree to a dark-blue screen (this bit us twice already). Add a
  top-level `<ErrorBoundary>` with a "something broke — reload" screen.
- **Dead code: the entire `/api/rivers` stack.** `routes/rivers.js`,
  `riverController.js`, and `models/River.js` (notes/bookmarks keyed by osmId)
  are never called by the client — and the endpoints are unauthenticated.
  Either delete them or rework into the per-user bookmarks feature (Step 6).
  The stale `URL STRUCTURE` comment at the top of `app.js` goes with it.
- **Unused `caught` field on the Species model.** Global boolean that can't
  represent per-user state (that's what Catch is for). Remove.
- **No validation on catch numbers.** Negative/absurd weight and length are
  accepted. Add min/max validation in the schema or controller.
- **Seed scripts still have the Windows crash pattern.** `seedFishData.js` and
  `parseRegulations.js` end with unawaited `mongoose.disconnect()` (and
  `parseRegulations` uses `process.exit(1)`) — same libuv assertion risk we
  fixed in `seedWaterways.js`. Apply the same fix (await disconnect,
  `process.exitCode`, consume response bodies on error paths).
- **CI runs on deprecated Node 20.** Bump `ci.yml` to Node 22 (or 24, to
  match the dev machine).
- **Tests only cover auth.** Add supertest coverage for `/api/waterways`,
  `/api/catches` (log + fetch by riverGroup), and `/api/fish/species`.

Done when: dates display correctly evening-and-morning, every fetch in the
client has a failure path, a thrown render error shows a recovery screen
instead of a blank map, dead code is gone, CI is green on a supported Node.

## Step 2 — Map interaction fixes

- **Hover highlight lag.** On every distinct hover, `MapView.jsx` scans all
  ~11.9k features in JS to build an ID array, then hands MapLibre a giant
  `['in', 'id', [...]]` literal filter. Replace with a direct filter on the
  shared group key — `['==', ['get', 'riverGroup'], groupKey]` — which
  eliminates the JS scan and the big filter entirely (MapLibre evaluates it
  natively per-feature). Same change for the selected layer (pass the
  riverGroup down instead of `selectedIds`). Consider `feature-state` if
  filter swaps still feel slow after that.
- **RiverPanel covers the stats bar and map zoom controls.** When the panel
  slides in (300px, right side), move the NavigationControl to top-left (or
  shift it left when a river is selected) and let the stats bar wrap or
  compress instead of sitting under the panel.
- **River name labels on zoom.** Add a MapLibre `symbol` layer over the
  waterways source (`text-field: ['get', 'name']`, `symbol-placement: 'line'`)
  with a `minzoom` (~10–11) so names fade in once you're close enough. Filter
  to named features only.

Done when: hovering feels instant while panning fast, nothing important is
hidden when the panel is open, and zooming into a river shows its name along
the line.

## Step 3 — River search

- Search box (top bar) to find a river by name. All waterway data is already
  loaded client-side, so this can be a pure client-side index: build a
  `Map<riverGroup, {name, bbox}>` once after load, filter as the user types,
  and on selection `map.fitBounds()` to the group's combined bbox + select it.
- Server `/api/waterways/search?q=` endpoint is only needed later if the
  client ever stops loading the full dataset (e.g. vector tiles). Don't build
  it before it's needed.

Done when: typing "cow" surfaces Cowichan River, choosing it flies the map
there and opens its panel.

## Step 4 — Regulations, completed

Currently nothing displays. Complete the pipeline:

- **Verify the data actually matches.** `parseRegulations.js` matches PDF
  names against `RiverSpecies.riverName` (BC gazetted names), but the client
  queries by the **OSM** river name. Audit how many regulations actually
  resolve for rivers that exist on the map; re-key matching to OSM
  names/riverGroups where they differ. Re-run the seed and confirm via
  `/api/regulations/<name>` for a handful of known rivers.
- **Structured closures, not just rule strings.** Parse closure date ranges
  out of the rule text into fields (`closedFrom`/`closedTo`, or a list of
  `{start, end, description}`) so the app can *reason* about them, not just
  display them.
- **Closed-river indicator on the map.** If today falls inside a closure
  window, render that river differently (e.g. red/desaturated line + a
  "CLOSED" tag in RiverPanel). Requires a small join: client asks the server
  for currently-closed riverGroups (`/api/regulations/closed-today`) and adds
  a map filter/layer for them.

Done when: a river with special rules shows them in the panel, and a river
closed today is visibly different on the map before you even click it.

## Step 5 — Fish run timing (seasonality)

"When can I actually catch pinks here?"

- Add a `runTiming` structure per species (per river where data exists, with
  a species-level default): e.g. pink salmon `{ from: 'Aug', to: 'Nov' }`.
  Start with a hand-curated table for the major species (data source:
  BC/DFO run-timing charts) rather than trying to scrape it.
- Display in RiverPanel's species cards ("PINK SALMON · AUG–NOV") and in the
  Pokédex detail.
- Stretch: "in season now" badge, and tint species cards by whether the run
  is active this month.

Done when: clicking a salmon river in September makes it obvious which runs
are on.

## Step 6 — Fish finder (species → nearest water)

- "Where's the closest place I can catch X?": pick a species, use browser
  geolocation, find the nearest waterway whose `RiverSpecies` list contains
  that species.
- Nearest-water lookup can be client-side to start (species list is small,
  waterway bboxes are loaded); a proper server version would use a MongoDB
  `2dsphere` index on Waterway geometry + `$near` — good excuse to learn
  geospatial queries, and the index is cheap since the data's already there.
- Combine with Step 5: rank results by "has an active run right now."

Done when: "Coho, near me" flies the map to a real, plausible river.

## Step 7 — Catch management & gamification depth

- **Edit/delete a catch.** There are no update/delete endpoints — a mistyped
  catch is permanent. Add `PATCH /api/catches/:id` and `DELETE /api/catches/:id`
  (owner-checked), plus UI on the catch cards.
- **Per-user river bookmarks/notes** — resurrect the dead River-model idea
  properly: authenticated, keyed to `userId` + `riverGroup`.
- **Stats page**: catches per species/month/river, biggest fish, first-catch
  dates. The Pokédex completion meter already exists; give it somewhere to go.
- Catch photos (needs object storage — pairs naturally with deployment).

## Step 8 — UI overhaul

Broad visual pass, folded in from the old Step 6:

- Rework the panel/topbar layout (see Step 2 overlaps), mobile layout,
  touch targets.
- Address the pixel-font legibility issues (tiny 6–7px sizes clip and strain;
  the species-search input glitch was part of this).
- Consistent loading/empty/error states across panels.
- Decide what the map *looks* like at each zoom (line weights, label
  density, legend behavior) rather than one-off tweaks.

## Step 9 — Deployment (carried over) + forgot password

- MongoDB Atlas is already live; deploy the API (Render/Fly/Railway free
  tier) + static client build; set `CLIENT_ORIGIN`, `NODE_ENV=production`.
- `app.set('trust proxy', 1)` before deploying — express-rate-limit
  misidentifies client IPs behind a proxy without it.
- Add the live URL + badge to the README.
- **Forgot password** (parked until here on purpose — reset emails need a
  real domain): `POST /api/auth/forgot-password` issuing a hashed,
  short-lived token, emailed via a transactional provider (Resend/SES);
  `POST /api/auth/reset-password/:token`; rate-limit both; identical
  responses whether or not the email exists.

## Backlog / ideas (unscoped)

- Tide data for tidal channels (they're already tagged in the data).
- Weather-based "good fishing day" indicator (weather fetch already exists).
- Map pins where you caught fish (Catch already stores the river; could store
  the clicked segment's midpoint too).
- Export my catches (CSV/JSON).
- PWA/offline mode — IndexedDB caching already covers the heavy data.
- Vector tiles for waterways (only if payload/perf measurements justify it —
  current gzipped payload is ~880 KB, cached for 24h, which is fine).
