# Website Auth, Onboarding & Portal QA Matrix

This matrix is the release-oriented coverage contract for Website authentication, onboarding and authenticated portal surfaces.

Coverage labels:

- **E2E-local** — Playwright can run against the local Website + mock backend.
- **Unit/schema** — deterministic validation/contract coverage in Vitest.
- **E2E-real** — requires a seeded real backend/database and authenticated test identities.
- **Security** — must be a release-blocking auth/authorization regression.

## 1. Authentication pages

### `/[locale]/login`

Automated/local:

- Empty email + password shows client validation and makes no session cookie.
- Malformed email is rejected before server submission.
- Valid-format but invalid credentials show one generic error; no account-existence leakage.
- Remember-me starts unchecked and is keyboard operable.
- Password reveal preserves the current value.
- Successful Supabase login reaches the authenticated portal.
- A protected `next` deep link is preserved through login.
- Locale is preserved through auth redirects.
- Browser Back after logout cannot restore authenticated content.
- Stale Supabase cookies injected after logout are rejected.
- Account A -> logout -> Account B does not leak A's identity/cache.

Edge/security:

- `next=https://evil.example` must never become the post-auth destination.
- `next=//evil.example` must never become the post-auth destination.
- Encoded protocol-relative/external values must remain local-safe.
- Repeated invalid login attempts should surface rate limiting without changing error semantics.
- Disabled/restricted/rejected accounts must route to their server-authoritative state page.
- Expired/revoked refresh token must return to login without a redirect loop.

### `/[locale]/register`

Automated/local + unit/schema:

- Empty form shows required validation.
- Name is trimmed, min 2, max 100.
- Malformed email rejected.
- Password must contain upper/lower/numeric/special and be >= 8 chars.
- Confirmation must match.
- Terms mandatory.
- Privacy mandatory.
- Marketing optional.
- Locale must be one supported platform locale.
- Google OAuth starts configured provider flow.

E2E-real:

- New unique email creates Supabase identity and verification state.
- Existing verified account returns recoverable account-exists behavior.
- Existing unverified account exposes verification recovery path.
- Email delivery failure exposes retry/recovery without duplicate account creation.
- Rate-limited registration disables repeated submission until cooldown expires.
- Double click / rapid Enter produces one account only.

### `/[locale]/verify-email`

E2E-real:

- Valid verification link verifies once and advances to onboarding.
- Expired/invalid token shows recoverable state.
- Replayed token is idempotent/safe.
- Resend uses normalized email and enforces cooldown/rate limiting.
- Already verified account does not regress onboarding state.

### `/[locale]/forgot-password`

Automated/local:

- Malformed email rejected.
- Known and unknown valid emails show the same anti-enumeration success UI.
- Return-to-login navigation works.

E2E-real:

- Reset email created for a valid account.
- Rate-limited request still avoids account-existence leakage.

### `/[locale]/reset-password`

Automated/unit:

- Missing recovery session renders invalid-link state.
- Weak password rejected.
- Confirmation mismatch rejected.
- Safe `next` values remain local.

E2E-real:

- Valid recovery session updates password.
- Old password no longer authenticates.
- New password authenticates.
- Recovery session/token cannot be reused.
- Other active sessions are handled according to security policy.

### `/[locale]/account-restricted`

Security/E2E-real:

- Restricted user is routed here regardless of requested portal deep link.
- Restricted user cannot mutate portal resources by direct API/URL access.
- Unrestricted user cannot be trapped on this page after state restoration.

## 2. Onboarding routes

All onboarding routes are covered for unauthenticated redirect + `next` preservation in Playwright.

### `/onboarding/profile-type`

E2E-real:

- Allowed account/profile types render from backend-authoritative state.
- Selecting a type persists exactly once.
- Back/refresh preserves persisted selection.
- Invalid/stale account type is rejected.
- Completed user cannot restart onboarding by direct URL.

### `/onboarding/role`

E2E-real:

- Valid role choices render for current account type.
- Unsupported role cannot be forced by URL/request tampering.
- Selection persists through refresh/back.
- User cannot skip required prior step.

### `/onboarding/profile`

Unit/schema coverage:

Common fields:

- Phone must be E.164 (`+` + 8..15 digits; no leading zero country code).
- Country required.
- Preferred locale restricted to supported locales.
- Contact preference restricted to platform/public-contact values.
- Optional region/city obey max lengths.

Project owner:

- Existing company UUID required.
- Interests required.
- Visibility limited to public/private.

Worker:

- Profession, skills, availability, languages and bio required.
- Experience accepts 0..80 whole years only.

Company:

- Select/claim requires a company UUID.
- Create requires name, type, email, phone, category, region, address, size and timezone.
- Create requires registration number/compliance identifier.
- Website must be a URL when present.
- Company email/phone validated when present.
- Company identifiers: valid 2-character country, valid kind, non-empty raw value, max 12.

Subcontractor/service provider:

- Existing-company association enforced for account types that may not create during onboarding.
- Required trade/category/background/capability/service-region fields validated.
- Experience limited to 0..80.

E2E-real:

- UI displays the correct conditional fields for each persona.
- Organization select/search returns real companies only.
- Company-create conditional fields cannot be bypassed client-side.
- Validation errors focus/announce the affected control.
- Double submit is idempotent.
- Version/concurrency conflict shows recoverable feedback.

### `/onboarding/documents`

Unit/schema:

- Supported document type only.
- Identity and license require expiry date.
- Certificate does not require expiry.
- Expiry uses ISO date format.
- Issuing country exactly 2 characters.
- Owner name required.

E2E-real:

- Allowed MIME/type and size accepted.
- Oversized file rejected before/at upload boundary.
- Unsupported executable/script file rejected.
- Zero-byte/corrupt upload rejected.
- Duplicate upload handled deterministically.
- Upload can be removed/replaced.
- Signed preview/download URL is scoped and expires.
- A user cannot reference another user's asset ID.

### `/onboarding/review`

E2E-real:

- Summary reflects persisted server values from all previous steps.
- Missing required prior data blocks submission.
- Submit is single-shot/idempotent.
- Successful submit advances to pending/review state.
- API failure leaves data intact and retryable.
- Concurrent/stale version returns conflict instead of overwriting.

### `/onboarding/pending`

E2E-real:

- Pending account cannot enter portal mutation routes.
- Refresh keeps pending state.
- Approval advances to portal without stale cached pending UI.
- Rejection advances to rejected route.

### `/onboarding/rejected`

E2E-real:

- Rejection reason/feedback is shown when provided.
- Allowed correction/resubmission action is available only when backend allows it.
- Direct portal access remains blocked until state changes.

## 3. Portal shell & global behavior

Automated/local/security:

- Every top-level portal list route requires authentication.
- Create/detail/edit routes require authentication.
- Every Operations subpage requires authentication.
- Requested deep link is preserved as a local `next` value.
- Portal desktop/mobile navigation renders.
- Account menu identity matches current Supabase identity.
- Logout clears auth cookies and private cached identity.
- Locale switch preserves portal semantics.
- RTL route renders RTL shell.
- Auth-sensitive pages use private/no-store cache headers.

E2E-real:

- RBAC/module entitlements hide unauthorized navigation AND deny direct URLs/APIs.
- Workspace switching changes scope and invalidates old workspace cache.
- Browser Back after workspace switch cannot restore unauthorized prior workspace data.
- 401 -> login, 403 -> forbidden/restricted UX, 409 -> conflict UX, 429 -> retry UX, 5xx -> recoverable module error.

## 4. Portal pages and forms

### Dashboard

- Metrics reflect current backend scope/date range.
- No synthetic/fabricated trends.
- Zero-data state is distinct from API error.
- Global date range changes all date-aware metrics consistently.

### Profile

Forms/components: profile editor, collections editor, documents manager, verification submit.

Cases:

- Required identity/contact fields.
- Valid locale/timezone/contact preference.
- Skills/languages/categories/service regions add/remove without duplicates.
- Profile image/document ownership authorization.
- Optimistic/version conflict behavior.
- Unsaved changes/navigation safety.
- Visibility/public-contact consent.

### Verification

- Empty document state.
- Submit disabled when required evidence missing.
- Duplicate/replayed submission idempotent.
- Pending/approved/rejected states immutable according to policy.
- Direct asset IDs cannot cross users/workspaces.

### Workspace

Forms: workspace profile editor, company create/claim/select.

- Required company fields.
- Invalid VAT/registration/contact/location fields.
- Create vs claim vs select conditional requirements.
- Version conflict.
- Unauthorized workspace edit denied.

### Members

Forms: invite member, member role/status actions.

- Email required/normalized.
- Duplicate active invitation.
- Existing member invitation.
- Self-invite policy.
- Invalid role/capability tampering.
- Resend/revoke idempotency.
- Last-owner/admin protection.

### Projects

Forms: create/edit project; project lifecycle; packages; criteria; media.

Unit/schema automated:

- Title 3..250, description 10..20000.
- Category/city UUIDs.
- Latitude/longitude provided together and within valid bounds.
- End date cannot precede start date.
- Money is integer minor-unit decimal string.
- Currency exactly 3 characters when present.
- Non-compliance scored criteria total 100.
- Max 20 tags, 40 packages, 20 criteria, 30 media items.

E2E-real:

- Draft vs publish.
- Edit/version conflict.
- Unauthorized owner/company mutation denied.
- Lifecycle transition policy.
- Reload proves persistence from API, not local state.

### Opportunities

Unit/schema automated:

- Supported kind only.
- Title/description limits.
- Duration 1..3650.
- Workers needed 1..500.
- Valid UUID references.
- Minor-unit budgets.
- Max 10 attachments.

E2E-real:

- Conditional fields by opportunity kind.
- Publish/draft lifecycle.
- Budget min/max business rule.
- Unauthorized edit denied.

### Offers / Bid Board

Forms: bid/offer submit, lifecycle/action menu.

- Required amount/currency/terms.
- Deadline closed -> submit blocked server-side.
- Duplicate submit/double click.
- Withdraw/revise policy.
- Version conflict.
- Bidder cannot submit on own restricted object if policy forbids it.
- Hidden competitor data never returned.

### Applications

- Required target/opportunity linkage.
- Duplicate application policy.
- Withdraw/reapply policy.
- Attachment ownership.
- Closed opportunity blocks application.

### Tenders

Unit/schema automated:

- Title/description/deadline requirements.
- External official notice requires valid source URL.
- Currency length.
- Scored criteria total 100.
- Max 20 tags, 30 media, 40 lots, 20 criteria.

E2E-real:

- Draft/publish/edit/version conflict.
- Inquiry/submission deadlines.
- Invite-only visibility authorization.
- Lot/criteria persistence.
- Lifecycle transitions and collaboration permissions.

### Workforce

Forms: worker records, availability calendar.

- Date overlap/conflicting availability.
- Invalid past/future policy bounds.
- Duplicate skill/certification records.
- Unauthorized company access.
- Timezone boundary/day rollover.

### Operations

Pages/subpages: overview, attendance, check-in, exceptions, crews, tasks, production, labour, materials, equipment, costs, profit-control, forecasts, SAL, daily reports, compliance, payroll, alerts.

Forms/components: create panel, attendance check-in, import dialog, evidence upload, approvals, payroll approvals, alert rules.

Critical E2E-real cases:

- Workspace/project scope required.
- Date/time timezone correctness.
- Double check-in prevented.
- Check-out before check-in rejected.
- Duplicate import/idempotency.
- Invalid CSV rows reported without partial silent corruption.
- Evidence file authorization.
- Approval/rejection role enforcement.
- Payroll approval cannot be replayed.
- Concurrent updates return conflict.

### Catalogue

- Create/edit required fields and type-specific fields.
- Money/currency boundaries where applicable.
- Draft/publish lifecycle.
- Unauthorized ownership mutation denied.

### Equipment

Unit/schema automated:

- Name min 2.
- Listing type enum.
- Condition enum.
- Manufacture year 1900..2100.
- Currency length 3.
- Rates/prices are integer minor-unit strings.

E2E-real:

- Rent/sale conditional pricing.
- Enquiry submission validation.
- Availability changes persist.
- Owner cannot enquire on own listing if policy disallows it.
- Unauthorized edit denied.

### Engagements

- Detail access scoped to participants/workspace.
- Invalid transition rejected.
- Completion/review flow idempotent.
- Cross-account access denied.

### Messages

- Empty message rejected.
- Max-length enforcement.
- Attachment ownership/type/size.
- Conversation participant authorization.
- Duplicate send/retry idempotency.
- Realtime echo does not duplicate the sent message.

### Saved

Forms: saved item, saved search, alert settings.

- Duplicate item save is idempotent.
- Invalid entity type/id rejected.
- Saved-search name/query limits.
- Alert frequency enum.
- Email/push/in-app combinations.
- Timezone validation.
- Delete/update authorization.

### Notifications

- Mark-one/read-all idempotency.
- Unread count stays consistent with list.
- Unauthorized notification ID denied.
- Malicious action URL cannot create open redirect/XSS.

### Settings

- Locale/timezone/preferences validation.
- Failed save preserves prior server state.
- Workspace/account-scoped settings do not bleed between scopes.

### Support

Forms: ticket/contact request, thread/reply, attachments.

- Subject/message required and length bounded.
- Unsupported/oversized attachment rejected.
- Duplicate submission prevented.
- User can only access own/authorized support threads.
- Closed ticket reply policy enforced.

## 5. Cross-cutting form edge cases

Apply to every mutation form where relevant:

1. Empty required fields.
2. Leading/trailing whitespace.
3. Minimum/maximum length exactly at boundary and +/-1.
4. Unicode names/text, RTL input and emoji where allowed.
5. SQL/HTML/script-like text remains data, never executable markup.
6. Duplicate click / Enter while request pending.
7. Browser refresh after successful mutation proves server persistence.
8. Network timeout/offline/retry.
9. 400 validation response maps to fields.
10. 401 clears/requires auth appropriately.
11. 403 never exposes hidden data/actions.
12. 404 deleted/stale record UX.
13. 409 optimistic concurrency UX.
14. 413 upload-size UX.
15. 422 domain-rule UX.
16. 429 rate-limit countdown/retry.
17. 500/503 recoverable error without false success.
18. Mutation followed by query invalidation updates all affected cards/lists.
19. Workspace switch during/after mutation cannot write to stale scope.
20. Locale switch does not lose persisted server data.
21. Mobile keyboard/viewport does not hide submit/error controls.
22. Keyboard-only form completion and focus order.
23. Error messages associated with controls and announced to assistive tech.
24. No secret/token/PII values written to console, URL, localStorage or analytics unexpectedly.

## 6. Release commands

Fast validation:

```bash
cd website
npm run format:check
npm run lint
npm run typecheck
npm test
```

Targeted local Playwright coverage:

```bash
npm run test:e2e -- \
  tests/e2e/foundation.spec.ts \
  tests/e2e/auth-boundaries.spec.ts \
  tests/e2e/auth-session-switching.spec.ts \
  tests/e2e/auth-forms-edge-cases.spec.ts \
  tests/e2e/onboarding.spec.ts \
  tests/e2e/onboarding-boundaries.spec.ts \
  tests/e2e/portal-route-boundaries.spec.ts \
  --project=chromium
```

Full local Website E2E:

```bash
npm run test:e2e -- --project=chromium
```

Seeded real-backend/staging certification must run the **E2E-real** cases above with real test data and isolated disposable accounts/workspaces before release.
