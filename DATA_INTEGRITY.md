# Catalogue integrity

The public catalogue is a byte-for-byte copy of the strict UTF-8 assets generated and accepted by the private Android project. `scripts/sync-android-assets.mjs` copies the files; it never rewrites hymn fields.

Current validated state:

- catalogue SHA-256: `69ad9ac5b2104c4bc884a8fcbde26f8479f01836e4ef78b9b0047204064644ef`
- 2,096 total records
- 1,048 English and 1,048 Yoruba records
- 1,898 available records
- 184 legacy records marked for authoritative-edition review
- 14 explicit unavailable records
- 36 themes, including the temporary Theme 30 label pending verification

Explicit unavailable IDs:

```text
en:0062 en:0275 en:0276 en:0277 en:0278 en:0600
yo:0157 yo:0287 yo:0303 yo:0545 yo:0586 yo:0600 yo:0821 yo:0878
```

English 600, Yoruba 303 and Yoruba 600 are required documented placeholders. Yoruba 304–316, hymn 952 theme alignment, suspected OCR characters, duplicate lyrics and other review flags remain unchanged. The application presents missing/review notices without hiding, filling or correcting these records.

`scripts/catalogue-validator.mjs` fails on incorrect counts, ranges, stable IDs, languages, theme coverage, counterpart mappings, required fields, undocumented empty lyrics, changed missing-record inventory, malformed review flags, undocumented exact duplicates or lost Yoruba Unicode.

The full catalogue is not copied into localStorage. Only stable favourite IDs and small reader preferences are persisted.
