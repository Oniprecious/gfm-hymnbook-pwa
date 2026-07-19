# G.F.M Hymn Book PWA

An installable English and Yoruba hymn book for iPhone, Android browsers, tablets and desktop. After the first complete online load, the application shell, both 1,048-entry catalogues, themes, search and reader remain available without a network connection.

Live application: <https://oniprecious.github.io/gfm-hymnbook-pwa/>

## Features

- 2,096 canonical hymn records copied deterministically from the private Android source
- English and Yoruba number, title and lyric search
- direct hymn-number opening, with optional browser voice recognition
- 36 worship themes, stable favourites and counterpart switching
- previous/next buttons, keyboard arrows and horizontal reader swipe
- light/dark appearance, adjustable text size and line spacing
- Web Share with clipboard/text-download fallback
- versioned settings and favourites export/import with strict validation
- last-opened hymn restoration
- safe-area, large-text, phone, tablet, landscape and desktop layouts
- installable standalone PWA with controlled updates and complete offline precaching

No hymn text is translated, invented, renumbered, globally replaced or silently corrected. See [DATA_INTEGRITY.md](DATA_INTEGRITY.md).

## Install on iPhone

1. Open <https://oniprecious.github.io/gfm-hymnbook-pwa/> in Safari.
2. Tap **Share**.
3. Tap **Add to Home Screen**.
4. Enable **Open as Web App** if shown.
5. Tap **Add**.

Open the installed icon once while online and wait for **Ready for offline worship** before testing airplane mode.

## Development

Requirements: Node.js 22 or later and pnpm 11.

```bash
pnpm install
pnpm validate:data
pnpm validate:manifest
pnpm typecheck
pnpm lint
pnpm test
pnpm build
pnpm test:e2e
```

For local development:

```bash
pnpm dev
```

The Vite base is `/gfm-hymnbook-pwa/`. Hash routes prevent GitHub Pages refresh failures on nested screens.

## Updating canonical data safely

The private Android repository is authoritative. With both repositories in their documented sibling locations:

```bash
pnpm android:sync
pnpm validate:data
pnpm test
pnpm build
```

To use another local Android checkout:

```bash
pnpm android:sync -- --android-root "C:\absolute\path\to\GFMHymnBook"
```

The sync script has a fixed allowlist: `hymns.json`, `themes.json`, and five approved images. It also regenerates install icons and `public/data/version.json`. Review the data hashes and commit only expected changes.

## Offline and update behaviour

Workbox precaches the application shell, canonical JSON, manifest, icons and brand images. The interface does not claim offline readiness until an active service worker and validated catalogue are both available. When a new deployment installs in the background, the current version continues running and an **Update now** prompt appears. The update activates only after user confirmation.

See [OFFLINE_TESTING.md](OFFLINE_TESTING.md) for the verification procedure.
The release-candidate test matrix is recorded in [QA_REPORT.md](QA_REPORT.md).

## Deployment

Pushes to `main` run `.github/workflows/deploy-pages.yml`. The workflow validates data and manifest metadata, type-checks, lints, runs unit tests, builds the PWA and deploys `dist/` with the official GitHub Pages actions. It uses the repository-provided Actions token; no personal access token is required.

## Android application

The Android application remains in a separate private repository and is not included here. Android users should install only an APK supplied through an owner-approved distribution channel. Android signing keys, APK build output and private project files are never part of this public repository.

## Browser limitations

- Speech recognition is progressive enhancement, varies by browser and may require network access.
- iOS controls install prompts, background updates and storage eviction.
- Export favourites/settings periodically if they are important.
- Audio is excluded until an authoritative hymn-to-tune mapping and redistribution licence are supplied.
- No licence to republish or modify the hymn texts is granted by this source repository.
