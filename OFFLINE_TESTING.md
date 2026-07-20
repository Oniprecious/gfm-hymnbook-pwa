# Offline verification

## User verification on iPhone

1. Open the live URL in Safari while online.
2. Wait until the Home screen says **Ready for offline worship**.
3. Install with Share → Add to Home Screen → Open as Web App (if shown) → Add.
4. Open English and Yoruba once and save at least one favourite.
5. Close the installed application completely.
6. Enable airplane mode.
7. Reopen G.F.M Hymns from the Home Screen.
8. Browse both catalogues, search by number/title/lyrics, open favourites, read hymns, move Previous/Next and switch languages.
9. Restore connectivity after testing.

On browsers that support on-device Web Speech, tap **Speak hymn number** once while online to install the English voice pack. After the interface confirms that offline voice is active, repeat the hymn-number command in airplane mode. The voice pack belongs to the browser or operating system and is separate from the PWA service-worker cache. Browsers without this experimental API keep typed-number opening as the offline fallback.

Do not treat a browser’s generic “offline” icon as proof. The application’s own readiness message is shown only after service-worker activation and successful canonical-data validation.

## Automated verification

```bash
pnpm build
pnpm test:e2e
```

The browser suite loads the production preview beneath `/gfm-hymnbook-pwa/`, verifies required assets, waits for offline readiness, disables network access, reloads, then searches and opens both languages. WebKit interaction is covered where supported; Playwright WebKit service workers are unavailable on some Windows runners, so the offline service-worker case runs in Chromium there.

## Update verification

Deploy a changed build while an older installed instance remains open. The old instance should continue working and show **A new version is ready**. Choose **Update now** to activate and reload. Choosing **Later** must not interrupt the current reader session.
