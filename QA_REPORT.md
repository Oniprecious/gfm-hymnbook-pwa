# Release-candidate QA report

Tested on 19 July 2026 from the production build served beneath the final GitHub Pages subpath, `/gfm-hymnbook-pwa/`.

## Automated checks

- `pnpm check`: passed catalogue validation, manifest validation, TypeScript, ESLint, 10 unit tests and the production build
- `pnpm test:e2e`: 19 passed, 1 platform-limited skip
- production service worker: 23 precache entries covering 5.589 MB
- critical accessibility violations: none in the tested home screen
- browser console warnings/errors during visual QA: none
- horizontal overflow at 390 x 844, 768 x 1024 and 1440 x 900: none

## Browser and viewport matrix

| Project | Emulation | Result |
| --- | --- | --- |
| Chromium phone | Pixel 7 / system Google Chrome | 5 passed |
| Chromium tablet | iPad Pro 11 viewport / system Google Chrome | 5 passed |
| Chromium desktop | Desktop Chrome | 5 passed |
| WebKit iPhone | iPhone 13 | 4 passed, 1 skipped |

The WebKit skip is limited to automated service-worker offline emulation on Windows, where Playwright WebKit does not expose service workers. iPhone-sized WebKit still passed asset/install metadata, accessibility, bilingual search and opening, persistence, previous/next navigation, and counterpart switching. The equivalent offline reload test passed on all three Chromium projects and remains covered by the manual iPhone procedure in `OFFLINE_TESTING.md`.

## Behaviour covered

- GitHub Pages repository-subpath loading and install metadata
- English and Yoruba number, title and lyric search
- direct hymn opening
- stable favourites, typography settings and last-opened hymn after reload
- previous/next navigation and stable counterpart switching
- offline reload, search and reading in both catalogues after readiness
- phone, tablet and desktop home, drawer, catalogue and reader layouts

## Source integrity

- 2,096 records: 1,048 English and 1,048 Yoruba
- 36 themes
- 1,898 available, 184 review-pending and 14 explicitly unavailable records
- PWA `hymns.json` SHA-256: `69ad9ac5b2104c4bc884a8fcbde26f8479f01836e4ef78b9b0047204064644ef`
- PWA `themes.json` SHA-256: `3aa9e4caa5d805c08f4b4b50a5303d914563ac58ce837ec1b2e953e7482b46a8`
- both hashes exactly match the private Android canonical assets

The private Android project also passed `gradlew validateCatalog testDebugUnitTest` using the local Android SDK. No Android source file was modified or copied into this public repository.
