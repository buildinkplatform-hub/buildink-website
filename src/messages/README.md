# Translation catalogs

Each supported locale has its own folder (`en`, `it`, and `ar`). Translations
are split into `shared` catalogs and page catalogs under `pages`.

When adding a page:

1. Add the page JSON file to every locale using the same nested message keys.
2. Import the new file in each locale's `index.ts`.
3. Pass the imported catalog to `mergeMessages`.

The merge helper rejects duplicate leaf keys, and the translation coverage test
ensures every locale exposes the same final set of keys.
