# G.F.M Hymn Book Android-to-PWA Migration Plan

## Scope and source authority

The private Android repository at `C:\Users\ONI\AndroidStudioProjects\GFMHymnBook` remains the canonical source. The public PWA receives only the two validated catalogue assets, approved brand images, and web-specific source/documentation. Android source, Gradle files, APKs, signing material, legacy exports, device reports, and unrelated projects are never copied or published.

Detected canonical data:

- 2,096 records: 1,048 English and 1,048 Yoruba
- 1,898 `AVAILABLE`, 184 `NEEDS_REVIEW`, and 14 `MISSING_TEXT`
- stable ranges `en:0001`–`en:1048` and `yo:0001`–`yo:1048`
- 36 themes, including temporary Theme 30 label
- source catalogue SHA-256: `69ad9ac5b2104c4bc884a8fcbde26f8479f01836e4ef78b9b0047204064644ef`

No hymn text will be translated, corrected, renumbered, reordered, invented, or globally rewritten. English 600, Yoruba 303, Yoruba 600, and every other documented empty record remain explicit unavailable entries.

## Architecture

- React + TypeScript + Vite, deployed as static assets beneath `/gfm-hymnbook-pwa/`
- React Router using hash routes so every screen refreshes safely beneath the GitHub Pages repository subpath
- `vite-plugin-pwa`/Workbox for versioned application-shell, catalogue, theme, image, icon, and navigation caching
- canonical JSON fetched once into an in-memory repository; the full catalogue is never stored in localStorage
- versioned localStorage schema for favourites and small reader preferences only
- Vitest for repository, parser, persistence, and import/export tests
- Playwright for responsive, accessibility-oriented interaction, subpath, persistence, and offline smoke coverage
- GitHub Actions Pages artifact deployment from `main`

## Screen mapping

| Android surface | PWA route/surface | Web and iPhone adaptation |
|---|---|---|
| SplashActivity | initial branded splash | short first-session transition; skipped for reduced motion and subsequent navigation |
| HomeActivity | `/` | safe-area toolbar, responsive language cards, navigation sheet, last-hymn continuation, cache status |
| EnglishActivity (`en`) | `/catalogue/en` | searchable virtual-friendly catalogue; number/title/lyric search and direct-number control |
| EnglishActivity (`yo`) | `/catalogue/yo` | same shared catalogue component with Yoruba language hint |
| FavouriteActivity | `/favourites` | stable-ID collection spanning both languages |
| ThemeActivity | `/themes` | 36-theme browser followed by language choice |
| themed EnglishActivity | `/themes/:themeId/:language` | theme-ID query without parallel-array assumptions |
| PageActivity | `/hymn/:stableId` | reader, previous/next, horizontal swipe, counterpart switch, share, favourite, typography controls |
| AboutActivity | `/about` | application/data status, integrity notes, install help, offline and browser limitations |
| navigation drawer | modal navigation sheet | focus-trapped accessible dialog with Home, Themes, Favourites, Appearance, Settings/About, Share |

## Feature mapping

| Android feature | PWA implementation/fallback |
|---|---|
| immutable catalogue repository | validated fetched JSON cached in memory and by Workbox |
| stable favourites | versioned localStorage set of stable IDs |
| legacy Android favourite migration | not applicable across platforms; PWA provides validated JSON export/import |
| search normalization | Unicode NFKC, locale-safe lowercase, punctuation-to-space matching without changing stored text |
| voice hymn number | progressive `SpeechRecognition`/`webkitSpeechRecognition`; hidden when unsupported; typed number always available |
| Android Share intent | Web Share API; clipboard/download fallback when unavailable |
| system day/night | system default plus explicit light/dark preference |
| reader font and line spacing | bounded persisted controls using CSS custom properties |
| process/activity restoration | route URL plus persisted last-opened stable ID |
| exit confirmation | omitted: browsers and iOS do not permit reliable programmatic app exit |
| Rate action | omitted until a real store/review destination exists |
| Android APK installation | documented separately; iPhone installation uses Safari Add to Home Screen |
| unavailable counterpart | retain current hymn and show a clear non-destructive notice |

## Data synchronization and validation

`scripts/sync-android-assets.mjs` copies only:

- `app/src/main/assets/hymns.json` → `public/data/hymns.json`
- `app/src/main/assets/themes.json` → `public/data/themes.json`
- approved files from `app/src/main/res/drawable-nodpi` → `public/images/`

The script resolves the Android root from an explicit CLI option/environment variable or the documented sibling default, rejects unexpected paths, copies a fixed allowlist, and runs the same structural validator used in tests. `scripts/validate-data.mjs` verifies counts, stable IDs, number coverage, language codes, counterpart existence, theme mappings, unavailable records, review flags, required fields, duplicate IDs, exact-duplicate review flags, and preservation of Yoruba Unicode.

## Persistence schema

Storage key `gfm-pwa:state:v1` contains only:

- favourite stable IDs
- appearance choice
- reader font size and line spacing
- preferred catalogue language
- last-opened hymn
- dismissed service-worker update identifier

Exported settings use an explicit schema/version and checksum-free JSON payload. Import rejects unknown versions, malformed values, invalid stable IDs, out-of-range preferences, and unexpected properties before replacing state.

## Offline and update lifecycle

The service worker precaches the built shell and approved static assets, while runtime caching explicitly covers both canonical data files. The UI reports “Ready offline” only after service-worker control is active and both data requests have succeeded from the installed application. Navigation falls back to the application shell under the repository subpath. A waiting service worker prompts the user to refresh; updates are never applied silently during active reading.

## Deployment and verification

- Vite base: `/gfm-hymnbook-pwa/`
- GitHub Pages workflow permissions: `contents: read`, `pages: write`, `id-token: write`
- build artifact uploaded with the official Pages actions and deployed from `main`
- local gates: sync/validation, TypeScript, ESLint, Vitest, production build, manifest checks, Playwright responsive/subpath/persistence/offline tests
- deployment gates: green Pages workflow, HTTPS 200 response, manifest/icon/data/service-worker asset checks, route refresh, first-load readiness, offline relaunch and both-language workflows

## Known platform limitations

- iOS Safari voice recognition availability varies and is not offline-capable.
- PWA storage can be evicted by the operating system; export/import provides a recovery path for favourites and settings.
- Browser share/clipboard capabilities vary, so a text-download fallback remains available.
- Background updates and install prompts are controlled by Safari; installation instructions are provided in-app.
- Audio is not included without authoritative hymn-to-tune mapping and redistribution permission.
