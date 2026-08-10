# Buildink Public Website

Standalone multilingual public, authentication, onboarding, and user-portal foundation for Buildink. The application lives beside the existing admin application and does not share its runtime or navigation.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`; the locale middleware redirects to Italian at `/it`. Supported prefixes are `/it`, `/en`, and `/ar`. Arabic uses a document-level RTL layout.

For production, copy `.env.example` to the hosting environment and provide a unique `BUILDINK_DEMO_SESSION_SECRET` containing at least 32 characters. The development fallback is intentionally rejected in production.

## Demo accounts

All completed demo accounts use `Buildink@123`:

| Profile type     | Email                      |
| ---------------- | -------------------------- |
| Individual       | `individual@buildink.demo` |
| Worker           | `worker@buildink.demo`     |
| Contractor       | `owner@buildink.demo`      |
| Supplier Contact | `supplier@buildink.demo`   |
| Service Provider | `provider@buildink.demo`   |

The reset-password demonstration token is `demo-reset-token`.

## Architecture

- `src/app/[locale]/(public)` contains the public shell and launch placeholder.
- `src/app/[locale]/(auth)` contains login, registration, recovery, and the four onboarding steps.
- `src/app/[locale]/(portal)` contains the protected profile-aware dashboard and validated future-route placeholders.
- `src/features` owns domain behavior and API-shaped repositories; route files remain thin.
- `src/shared` contains stable profile-type, session, response, dashboard, and onboarding contracts.
- `src/messages` contains complete first-pass English, Italian, and Arabic UI messages.

Sessions are HMAC-signed, HttpOnly demo cookies. Onboarding saves only non-sensitive profile draft data and file metadata to browser storage; selected file contents are never persisted. The mock repositories expose async contracts intended to be replaced by real identity and marketplace API adapters.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run test:e2e
npm run build
```

The PWA foundation includes a manifest, brand icons, and `/offline`. Service-worker caching, real install/update UX, public marketplace routes, production identity, uploads, analytics, monitoring, and deployment configuration are intentionally deferred.
