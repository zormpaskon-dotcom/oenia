# Oenia — Legal + Production Readiness Audit

**Date**: 2026-09-15
**Scope**: read-only codebase investigation. No code, content, or database changes were made in this stage.
**Method**: 4 parallel codebase-research passes covering (1) personal data / auth / third-party services, (2) cookies-tracking / existing legal pages, (3) user-generated content / image sourcing, (4) production QA / security. Every factual claim below is cited `file:line`. Anything not confirmable from the code is explicitly marked **NOT FOUND IN CODE** or **NEEDS CONFIRMATION** — nothing here is invented, including company/legal details, which are absent from the codebase and must come from you or a lawyer (see the two closing sections).

---

## Update 2026-09-15 — the 6 Critical items are implemented

All 6 Critical findings from Stage 9 below have been fixed at the code/architecture level (no legal text finalized, no new features, no redesign). Full implementation report — changed files, the one schema migration, security implications, verification results, and the now-narrowed OWNER INPUT REQUIRED / LAWYER REVIEW REQUIRED lists — was delivered in chat and is not duplicated here. The High/Medium/Low priority items and the original OWNER INPUT REQUIRED / LAWYER REVIEW REQUIRED sections below remain as they were found — **most of the OWNER INPUT REQUIRED / LAWYER REVIEW REQUIRED items still stand**, since this round fixed code/data-architecture problems, not the actual legal text or business-identity gaps.

---

## STAGE 1 — Codebase legal audit

### 1A. Personal data inventory

Central model: `User` (`prisma/schema.prisma:257-278`) — `id`, `email` (unique), `password` (bcrypt hash), `name`, `slug`, `avatar`, `bio`, `city`, `role`, `isPublicProfile` (default true), `newsletterOptIn` (default false), `createdAt`/`updatedAt`.

| Flow | Fields collected | Where stored | Purpose | Third party? |
|---|---|---|---|---|
| **Registration** (`components/AuthCard.tsx:55-83`, action `app/login/actions.ts:42-86`) | name, email, password (+ honeypot `website`, not stored) | `User` row (`app/login/actions.ts:74`), password hashed `bcrypt.hash(password,10)` (`:73`) | Create account, auto-login | None |
| **Login** (`components/AuthCard.tsx:40-53`, action `app/login/actions.ts:11-40`) | email, password | Verified against `User` (`lib/auth.ts:16-28`) | Authentication | None |
| **Profile/settings** (`components/SettingsForm.tsx`, action `app/profil/actions.ts:10-41`) | name, city, newsletterOptIn, isPublicProfile, optional new password | Updates own `User` row | Account management | None |
| **Reviews** (`components/ReviewForm.tsx`, action `lib/actions/reviews.ts:9-49`) | rating (1–5), free-text note | `Review` (unique per userId+wineId) | Public display on wine page + own profile; recomputes `Wine.avgRating` | None |
| **Cellar** (`components/CellarButtons.tsx`, action `lib/actions/cellar.ts:8-31`) | wineId, status (want/tried) | `CellarEntry` | Personal collection, drives `/diavatirio` region-passport progress | None |
| **Winery/producer submission** (`components/WinerySubmitForm.tsx`, action `app/gia-oinopoieia/actions.ts:21-86`) | name, region, founded year, description, website, **email, phone**, visitor/organic flags, optional cover photo (+ honeypot `company`) | **Directly on the public `Winery` record**, `status: PENDING` (`app/gia-oinopoieia/actions.ts:67-83`) — no login required, not linked to any `User` account | Winery onboarding for admin review/publish | Vercel Blob (image file only) |
| **Contact form** | — | — | — | **NOT FOUND IN CODE** — only a static `mailto:hello@oenia.gr` link (`components/Footer.tsx:51`) |
| **Rate-limit records** (`lib/rate-limit.ts:17-27`) | **client IP address**, stored as literal string key (e.g. `"signup:203.0.113.5"`, schema comment `prisma/schema.prisma:414`) | `RateLimitHit` table | Abuse throttling | None — but see retention note in Stage 3 |

**Notable finding**: the winery-submission form collects a real person's (the submitter's) email and phone number and writes them straight onto the `Winery` model — the same record rendered publicly on the winery's page and included in `sitemap.ts`. There is no separate private "submitter contact" field. Whether that email/phone is meant to be public-facing business contact info or the private submitter's personal data is not decidable from the code — **flagged for your decision under STAGE 3 and OWNER INPUT below.**

### 1B. Authentication

- **Provider**: NextAuth (Auth.js) v5 beta, Credentials-only (`lib/auth.ts:11-29`, `package.json:23`). No OAuth/social login found anywhere.
- **Session**: JWT strategy (`lib/auth.ts:9`), no `Session`/`Account` Prisma models — confirms no DB-session adapter.
- **Session cookie**: no custom cookie config exists in `lib/auth.ts`/`lib/auth.config.ts` — NextAuth v5 library defaults apply (name, httpOnly/secure/sameSite). Exact flag values are **NEEDS CONFIRMATION** against the installed library version if precision is required for the policy text.
- **Password hashing**: `bcryptjs`, `bcrypt.hash(password, 10)` at signup (`app/login/actions.ts:73`) and password change (`app/profil/actions.ts:35`); verified via `bcrypt.compare` (`lib/auth.ts:24`).
- **Password reset**: **NOT FOUND IN CODE.** No forgot-password route/flow anywhere.
- **Email verification**: **NOT FOUND IN CODE.** Signup creates + logs in immediately, no verification step.
- **Account deletion**: **NOT FOUND IN CODE.** No `prisma.user.delete` call anywhere in the codebase (confirmed by listing every `prisma.user.*` call site). The Prisma schema does cascade-delete `Review`/`CellarEntry` if a `User` row were ever deleted directly at the database level (`prisma/schema.prisma:291,312`), but no application code path triggers this. **This directly contradicts the existing Terms of Use text, which states a user can request account deletion "at any time" (`app/oroi-xrisis/page.tsx:28-34`) — the product cannot currently fulfill that promise.**

### 1C. Third-party services — full inventory (confirmed in code only)

| Service | Confirmed | Data involved |
|---|---|---|
| Hosting | Vercel (build tooling, `.vercel/` dir present) | infra only |
| Database | Supabase-hosted Postgres, via connection-pooler host (`prisma/schema.prisma:9-13`, `.env` host suffix `pooler.supabase.com`) | all app data |
| Auth | Self-hosted NextAuth, Credentials only | email + password hash, stays in own DB |
| Image/CDN | Vercel Blob (`lib/upload.ts:16-32`, `@vercel/blob`) | winery-submission photos, article cover images |
| Maps | Leaflet + OpenStreetMap tiles (`components/WineMap.tsx`), no geocoding API — lat/lng are static DB fields | winery name/region/coords rendered in map popups; browser fetches OSM tile images directly (3rd-party request, no key) |
| Email sending | **NOT FOUND IN CODE** | despite a `newsletterOptIn` field + UI toggle existing, there is no email-sending mechanism anywhere to act on it |
| Analytics/tracking | **NOT FOUND IN CODE** | none — despite cookie-banner copy and privacy-policy copy both describing "cookies μέτρησης επισκεψιμότητας" (traffic measurement) that don't exist in the code (see Stage 4) |
| Social login | **NOT FOUND IN CODE** | — |
| Error monitoring (Sentry etc.) | **NOT FOUND IN CODE** | — |
| Any other outbound API call | **NOT FOUND IN CODE** | grep for `fetch(` across the whole app found zero external calls beyond what's listed above |

---

## STAGE 2 — Existing legal pages audit

Three pages exist, all three **explicitly self-marked as placeholder, not legally valid**, all linked from the footer (`components/Footer.tsx:17-26`) on every page.

| Page | Covers today | Explicitly missing / placeholder | Needs owner data | Needs lawyer |
|---|---|---|---|---|
| **Privacy Policy** `app/politiki-aporritou/page.tsx` (43 lines) | Data collected (account, UGC, "βασικά cookies" + conditionally "μέτρησης" cookies), how it's used (not sold to 3rd parties), user rights (access/correction/deletion "from profile settings") | Explicit placeholder banner (`:12-15`, red text). **No controller identity at all** — no company name/address/tax ID/DPO. Describes an analytics-consent flow that doesn't exist in code (see Stage 4). Rights section says deletion is possible "from profile settings" — **not true**, no such feature exists (Stage 1B). | Yes — controller identity, contact | Yes |
| **Terms of Use** `app/oroi-xrisis/page.tsx` (73 lines) | Acceptance, account (18+, credential security, **claims** account deletion on request), UGC license (links to moderation policy), winery listings disclaimer, "not a wine seller" disclaimer, changes-to-terms clause | Explicit placeholder banner (`:14-17`) which **itself states** company name/tax ID/address are "entirely missing at present." Account-deletion promise not backed by code. | Yes — company name, ΑΦΜ, έδρα | Yes |
| **Moderation Policy** `app/politiki-moderation/page.tsx` (63 lines) | Review reporting criteria (spam/abuse/fake accounts, honest-negative reviews not removed), winery-submission review process, sponsored-content disclosure rules | Explicit placeholder banner (`:13-16`), narrower scope ("describes current system, not a binding policy") | Less — mostly describes real behavior already | Yes, before being called binding |
| **Cookie Policy** | — | **NOT FOUND IN CODE.** No dedicated page exists; the privacy policy's one paragraph on cookies doesn't enumerate specific cookies/storage keys or durations. | — | Yes |

**Point-of-collection notice** — checked every data-collecting form directly (not just the footer):
- Signup/login form (`components/AuthCard.tsx`): **no link to any legal page, no notice.**
- Review form (`components/ReviewForm.tsx`): **no link, no notice.**
- Winery-submission form (`components/WinerySubmitForm.tsx` / `app/gia-oinopoieia/page.tsx`), which collects the submitter's **email and phone**: **no link, no notice.** This is the sharpest gap — real personal contact data collected with zero in-context privacy disclosure.
- Cookie banner: links to the privacy policy only.

`robots.ts`/`sitemap.ts` both correctly include the three existing legal pages as public/crawlable.

---

## STAGE 3 — GDPR requirements checklist

Built from the real data flow above, not from a generic template. Items I cannot decide for you are marked **NEEDS LEGAL DECISION** or **NEEDS OWNER INPUT** rather than answered.

| Requirement | Status |
|---|---|
| **Identity of controller** | **NEEDS OWNER INPUT** — completely absent from the codebase (confirmed absent, not just unwritten — both placeholder pages say so themselves). |
| **Purposes of processing** | Derivable from the data flows in Stage 1A (account = auth/personalization, reviews = public UGC, cellar = personal tracking, winery submission = producer onboarding). Should be written up explicitly in the final privacy policy. |
| **Legal bases** (per processing activity) | **NEEDS LEGAL DECISION.** Candidates exist (contract/ToU for account creation, consent or legitimate interest for reviews, legitimate interest or consent for winery-submission contact data) but the actual selection is a legal judgment call, not something to pick unilaterally in code. |
| **Categories of personal data** | Account (name, email, password hash, city, bio, avatar), UGC (ratings + free text tied to identity), preference data (cellar want/tried status — reveals taste, not special-category but still worth noting), IP addresses (rate-limit table), winery-submitter contact (email, phone — stored on a **public** record, see flag above). |
| **Recipients / processors** | Vercel (hosting), Supabase (DB), Vercel Blob (images) — all confirmed in code (Stage 1C). Whether formal Data Processing Agreements are in place with these providers is **NEEDS OWNER INPUT** (check each provider's standard DPA terms). |
| **Retention periods** | **NOT DEFINED anywhere in code.** No scheduled deletion for accounts, reviews, cellar entries, or `RateLimitHit` IP records (that table is only opportunistically pruned when the *same* key is checked again — `lib/rate-limit.ts:20` — not a real retention policy). **NEEDS LEGAL DECISION / OWNER INPUT.** |
| **User rights** (access/rectification/erasure/restriction/portability/objection) | Rectification: partially supported (name/city/password via settings). **Erasure: not implemented at all** (Stage 1B) despite being promised in the Terms. Access/portability/restriction/objection: no dedicated mechanism found — would currently have to be handled manually (e.g., admin DB query) if a user asked. |
| **Withdrawal of consent** | Currently low-stakes because nothing is actually gated by the cookie-banner consent (Stage 4) — but the *mechanism* for withdrawal (changing your choice later) doesn't exist either; the banner only shows once. |
| **Account deletion** | **NOT IMPLEMENTED** — see Stage 1B. This is the single clearest gap between what's promised (Terms of Use) and what the code can do. |
| **Review/UGC content and erasure** | A user cannot delete their own review (only an admin can, via `deleteReviewAction`, `app/admin/actions.ts:40-61`). If a user's only path to erasure is a non-existent account-deletion feature, their GDPR erasure right currently has no self-service execution path at all. |
| **Security** | Passwords are bcrypt-hashed (reasonable). No raw-SQL injection surface found. IP addresses are retained with no defined purge — a data-minimization point to fix even though it's a small table. |
| **International transfers** | **NEEDS OWNER INPUT** — cannot determine from code which region Supabase/Vercel are provisioned in; that determines whether an international-transfer mechanism (SCCs etc.) is even relevant. |
| **Contact method for privacy requests** | **NEEDS OWNER INPUT** — no dedicated privacy/DPO contact exists anywhere; only a generic `hello@oenia.gr` mailto in the footer, not designated for privacy requests. |
| **Complaint / supervisory authority info** | Not present in the privacy policy. Greek policies should reference the Hellenic DPA (ΑΠΔΠΧ) and the right to lodge a complaint — currently absent, **needs lawyer-drafted text**. |
| **Privacy info at point of collection** | **Confirmed absent at every single data-collection point** (Stage 2) — this is the most concrete, actionable item on this whole list, and it's exactly the point you raised yourself: a footer link is not sufficient, notice needs to be at the point of collection, especially on the winery-submission form which collects a third party's contact details. |

---

## STAGE 4 — Cookie / consent audit (current behavior only, nothing changed)

**No analytics, advertising, or tracking script of any kind exists anywhere in the codebase** (exhaustively grepped for every common provider name — none found, none in `package.json`).

Full storage inventory:

| Item | Type | Set by | Runs before any consent action? |
|---|---|---|---|
| `oenia-theme` | `localStorage` | `app/layout.tsx:61-63` (inline script, before hydration) + `components/ThemeProvider.tsx` | **Yes**, unconditionally |
| `oenia-locale` | `localStorage` | `components/LanguageProvider.tsx` | **Yes**, unconditionally |
| `oenia_entrance_seen` | `sessionStorage` | `components/EntranceScreen.tsx` | **Yes**, unconditionally |
| `oenia_age_ok` | `sessionStorage` | `components/AgeGate.tsx` | **Yes**, unconditionally |
| `oenia_cookie_choice` | `localStorage` | `components/CookieBanner.tsx` | N/A — this is the consent record itself |
| NextAuth session cookie | HTTP cookie | `lib/auth.ts` | No — only set on active login/signup |

**Does the accept/reject choice in the banner actually do anything?** No. Traced exhaustively: `oenia_cookie_choice`'s stored value (`"essential"` vs `"all"`) is read in exactly one place — to decide whether to show the banner again — and is **never read anywhere else in the codebase** to gate any script or feature. Since there is no tracking script to gate in the first place, both banner buttons currently produce identical runtime behavior.

**Categorization**:
1. Technically necessary: NextAuth session cookie only.
2. Analytics: none exist.
3. Functional: theme, language, entrance-screen flag, age-gate flag, the cookie-choice record itself.
4. Marketing/advertising: none exist.
5. Unknown/needs confirmation: the age-gate's own copy (`components/AgeGate.tsx:38`) says the choice is "saved on this device," but it's actually `sessionStorage` (cleared at end of browser session) — a copy/mechanism mismatch worth reconciling either way.

**Direct answer to your ΑΠΔΠΧ-framed questions**:
- Loads non-essential trackers before consent? No trackers exist to load — moot today, but the banner's copy already claims a consent-gated analytics mechanism that isn't real.
- Real reject option? The button exists and stores a distinct value, but "accept" and "reject" are behaviorally identical since nothing is gated.
- Granular choices? No — binary essential/all only, and it's inert either way.
- Stores the choice? Yes (`localStorage`).
- Allows withdrawal? No — no UI to change the choice after the fact.
- Blocks non-essential trackers pre-consent? N/A, none exist to block.

**Practical implication**: today's implementation isn't creating a live compliance violation (nothing is actually being tracked), but the policy text and banner copy currently describe a consent system that isn't implemented, which is its own problem, and the mechanism itself is not built in a way that would correctly gate a future analytics addition — if analytics is added later without revisiting this, it would very likely load before consent.

---

## STAGE 5 — User-generated content audit

- **Moderation flow**: winery submissions (`ContentStatus`: PENDING → PUBLISHED/REJECTED, `app/admin/actions.ts:15-30`) and flagged reviews (`isFlagged` boolean → admin queue) both go through `app/admin/page.tsx`, gated by `requireAdmin()` (role check, not just login).
- **Report/flag**: `reportReviewAction` (`lib/actions/reviews.ts:51-65`) — logged-in users only, can't flag own review, sets a boolean (not a count/threshold). No rate limit, no de-dupe. After flagging, purely a manual admin queue — no auto-hide, no notification to the author.
- **Delete/edit**: Review edit = yes (upsert on resubmission). **Review delete by its own author = NOT FOUND IN CODE** — only an admin can delete a review. Cellar entries: fully user-controlled (add/change/remove own only). **Account delete = NOT FOUND IN CODE** (repeats the Stage 1B/3 finding).
- **Ownership**: `Review`/`CellarEntry` both FK to `User` with cascade-delete at the DB level (never triggered by app code today). Author name is displayed publicly on each review.
- **Terms coverage of UGC**: covered in `app/oroi-xrisis/page.tsx` (license grant, user responsible for accuracy, links to moderation policy) — but see placeholder caveat in Stage 2.
- **Abuse/spam protections**: rate-limited — winery submission (3/hour/IP), login (10/15min/IP), signup (5/hour/IP). **Not rate-limited**: review submission, review reporting, settings/password change, cellar changes. Honeypot fields exist on signup and winery-submission forms; **not** on the review form.
- **Admin audit trail**: **NOT FOUND IN CODE.** No table or field records *which* admin approved/rejected/deleted anything, or when beyond the generic `updatedAt` timestamp. Zero accountability trail for moderation actions today.

---

## STAGE 6 — Image / copyright risk inventory (not a legal conclusion — a risk map)

| Category | Where it lives | What the code shows |
|---|---|---|
| Wine label photos | `wine.labelImage`, rendered via `components/WinePhoto.tsx` | Populated only by one-off `prisma/upload-*.ts` scripts (bulk-seeded wines mostly have none → gradient placeholder). Of 26 upload scripts checked: **14 explicitly document winery permission in a comment** (Alpha Estate, Biblia Chora, Gaia, Gavalas, Kamara, Kikones, Ktima Titou, Mesimvria, Mikra Thira, Monsieur Nicolas, Muses, Pavlidis, Sclavos, Semeli, Troupis), **12 document only "downloaded from the official product page" with no permission statement** (Bairaktaris, Katogi Averoff, Porto Carras, Sigalas, Manousakis, Venetsanos, Oenops ×2, Domaine Florian, Douloufakis, Porto Carras 1990-2012). |
| Winery hero/vineyard/people photos | `lib/winery-images.ts`, ~62 winery entries | Almost entirely **hotlinked live** from each winery's own domain — the file's own header says images were "verified" (right winery, right photo, live URL) but **no comment claims permission was obtained**. One winery (`mikro-ktima-titou`) had its hotlink break in production (referer protection) and was migrated to Oenia's own Blob storage — the only such case. |
| Winery cover/logo via DB fields | 3 scripts | **`prisma/seed-sclavos.ts:49-50` is a specific flag**: its header comment claims "explicit permission from the winery," but the actual image URLs point to an unrelated third-party reseller CDN (`4ty.gr`), not the winery's own site — the permission claim and the image source don't clearly line up. |
| Region hero photos | `region.heroImage` | **Confirmed never populated** by any script — 100% of regions fall back to the local static placeholder. No risk today; flagging only because the field/fallback exists. |
| Article cover images | Admin upload flow (`app/admin/arthra/actions.ts`) | Site's own controlled Vercel Blob upload, type/size validated server-side. Origin of what an admin chooses to upload isn't visible to the code. |
| Homepage images (`public/home/*.jpg`) | Local static, 6 files | 2 of 6 (`hero.jpg`, `greece-band.jpg`) have a git-history commit message stating they were replaced with a real photo "the user supplied from their own computer" — no formal license note, but provenance is at least traceable. **4 of 6 (`explore-wines/wineries/regions/grapes.jpg`) have never been replaced since their original placeholder commit and have no documented source anywhere — origin genuinely indeterminate from the code.** |
| Producer-uploaded images | Winery-submission form | Site's own Vercel Blob upload flow, validated server-side — no third-party sourcing question here, the producer supplies it directly. |

Per your instruction, I'm not concluding anything legally from this — just mapping what's confirmed-with-permission, confirmed-without-permission-statement, and genuinely undetermined.

---

## STAGE 7 — Production QA

- **Metadata**: per-page `title`/`description` present on all detail and list pages (`generateMetadata`/static `metadata` confirmed on krasia/oinopoieia/perioches/poikilies/tairiasma/arthra). **Open Graph and Twitter card metadata: NOT FOUND anywhere in the codebase** — real gap for social sharing previews. **No favicon file exists anywhere** (`app/`/`public/` checked). `JsonLd` structured data present on wine/winery/article pages, **absent on region/variety/food-pairing pages** despite those having full `generateMetadata`.
- **`sitemap.ts`/`robots.ts`**: both correctly built from `SITE_URL` (`lib/site.ts`) and DB-published content only; auth-gated routes correctly excluded. **Whether `NEXT_PUBLIC_SITE_URL` is actually set correctly in the live Vercel production environment can't be confirmed from tracked code** (env files are gitignored) — if it's unset or wrong there, the sitemap/robots/canonical URLs would silently point at `localhost`.
- **Accessibility**: form labels are correctly paired (`htmlFor`/`id`) on all three main forms. Meaningful `alt` text on wine/winery/region name-bearing images; a handful of hero/cover images use `alt=""` where the content (e.g. "this is a photo of Winery X") arguably isn't purely decorative.
- **Loading/error/empty states**: root-level `error.tsx`/`not-found.tsx`/`global-error.tsx` exist. **No `loading.tsx` anywhere in the route tree.** No nested error/not-found for dynamic segments — they all fall back to root. Zero-result empty states ARE implemented on the list pages (oinopoieia/krasia/arthra).
- **Hydration risk**: no `Math.random()`, no unguarded `typeof window` checks (`PronounceButton.tsx` guards correctly), theme/age-gate/entrance all use the correct `useEffect`-deferred pattern. One low-risk spot: `new Date().getFullYear()` inside `WinerySubmitForm.tsx`'s render — only mismatches across an actual midnight-Dec-31 boundary.
- **Broken links**: sanity pass found no dangling internal `href`s among static route prefixes; dynamic (slug-based) links weren't individually resolved against live data.
- **Pre-existing gaps unrelated to the recent visual polish pass**: everything in this stage — none of it was introduced by the typography/spacing work from the last two sessions, which touched only CSS and a handful of `className` additions.

---

## STAGE 8 — Security sanity check

- **Exposed secrets**: `.env`/`.env.local` correctly gitignored and never committed (verified via git history, not just current `.gitignore`). `.env.example` contains only placeholders. No live-looking secret found anywhere in tracked files.
- **Client-exposed env vars**: only `NEXT_PUBLIC_SITE_URL` is exposed via `NEXT_PUBLIC_`, and that's appropriate (it's just the public site URL). No server secret accidentally exposed to the client.
- **API routes**: only `app/api/auth/[...nextauth]/route.ts` exists, a plain NextAuth re-export — nothing custom to audit there.
- **Server-action authorization** — checked every mutating action: login/signup (public by design, rate-limited), settings/cellar/review actions (all correctly scoped to `session.user.id`), admin actions (`approveWineryAction`, `rejectWineryAction`, `deleteReviewAction`, article CRUD) all go through a `requireAdmin()` helper that checks the **role**, not just login state — this part is done correctly.
- **Admin route gating — flagged for your awareness, not changed**: `middleware.ts` protects `/admin/*` by checking only that a session exists, **not** that the user is an admin. Every admin page that exists today happens to independently re-implement its own role check (`app/admin/page.tsx`, `app/admin/arthra/page.tsx`, `app/admin/arthra/[id]/page.tsx`), so nothing is exploitable *right now* — but this is structurally fragile: a new admin page added later without copying that boilerplate would be reachable by any logged-in non-admin user. **I did not change this, per your instruction to flag rather than alter security architecture.**
- **File uploads**: server-side validated (type allow-list, 5MB cap, filename sanitized) for both winery-submission and article-cover uploads — not just client-side hints.
- **Injection risk**: no raw SQL (`$queryRaw`/`$executeRaw`) anywhere — all access goes through Prisma's query builder. The one `dangerouslySetInnerHTML` use (`JsonLd.tsx`) is a standard, safely-escaped JSON-LD embed pattern.
- **Rate limiting gaps**: login/signup/winery-submission are rate-limited; **review submission, review reporting, and settings/password-change are not**. Given settings includes password changes, this is worth a look even though it requires an existing session.
- **Input validation gaps**: review `note` field has no server-side length cap (or client `maxLength`) — unbounded text can be written to the DB via a normal authenticated request.

---

# STAGE 9 — Deliverable

## A. Critical — before public launch

1. **No privacy notice at any point of data collection** — especially the winery-submission form, which collects a real person's email and phone with zero disclosure, and stores it on a public record.
2. **Privacy Policy, Terms of Use are self-marked, unreviewed placeholders** with no controller identity (name/address/contact) anywhere.
3. **Terms of Use promises account deletion "at any time" — no such feature exists in the code.** A live legal promise the product cannot fulfill; also blocks any real GDPR erasure request today.
4. **Cookie banner and privacy-policy copy describe a consent-gated analytics mechanism that doesn't exist** — the accept/reject choice is inert either way. Needs to be reconciled (fix the copy, or build the gating) before any tracking is ever added.
5. **Winery-submission form stores the submitter's personal email/phone directly on the public Winery record** — needs an explicit decision (Stage 3 / owner input) on whether that's intended, and a notice either way.
6. **`/admin/*` is only login-gated at the middleware level, not role-gated** — safe today only because every existing page re-implements its own check; flagged, not changed, per your instruction.

## B. High priority — before launch

- No password-reset / forgot-password flow.
- No email verification on signup.
- No defined retention period for accounts, reviews, cellar entries, or IP-based rate-limit records.
- No rate limiting on review submission, review reporting, or settings/password change.
- No length/content cap on the review "note" free-text field.
- No dedicated cookie policy page; existing privacy-policy cookie section doesn't enumerate actual items/durations.
- ~62 winery photos are hotlinked with no documented permission; 12 of 26 wine-label upload scripts document no permission (vs. 14 that do); Sclavos winery's claimed-permission comment doesn't match its actual (third-party CDN) image source.
- No favicon; no Open Graph/Twitter card metadata anywhere on the site.
- No audit trail (who/when) for admin moderation decisions.

## C. Medium priority — before or shortly after launch

- No `loading.tsx` anywhere in the route tree.
- A handful of content-bearing images (region hero, winery cover) use `alt=""`.
- 4 of 6 homepage images have no documented source/license anywhere in the repo.
- No structured data (JsonLd) on region/variety/food-pairing pages (present elsewhere).
- Can't confirm `NEXT_PUBLIC_SITE_URL` is correctly set in production from code alone — worth a manual check.
- Newsletter opt-in toggle exists with no email system behind it at all — misleading as-is.
- No self-service review deletion for the review's own author (admin-only today).
- Review-report action has no rate limit / de-dupe (low severity).

## D. Low priority — non-blocking

- NextAuth session-cookie flags rely on library defaults, never explicitly reviewed/set.
- `new Date().getFullYear()` in a client-render path (year-boundary edge case only).
- No credit/attribution note for stock-origin homepage images even where rights are fine.
- `logoImage` field is essentially dead (2 wineries only, inconsistent template support).

---

## OWNER INPUT REQUIRED

- Real controller identity for the legal pages: legal name (or your own name if there's no registered company yet), address, ΑΦΜ if applicable, and a designated contact for privacy requests.
- Retention-period decisions: accounts, reviews, cellar entries, rate-limit IP logs, winery-submitter contact data.
- Decision on whether the winery-submission form's email/phone should stay on the public Winery record, move to a private-only field, or get an explicit "this will be public" notice.
- Confirmation of which Supabase/Vercel region your database/app actually run in (needed to answer the international-transfer question).
- Decision on the newsletter opt-in toggle: build the email system, or remove the toggle for now.
- Image rights reconciliation: for the ~12 wine-label scripts and ~62 winery photos with no documented permission, decide per-winery whether to pursue permission, replace, or remove before treating the site as a real public launch — you've already run a manual outreach process for some wineries outside the codebase, so this is partly a matter of cross-referencing what you already have against what's flagged here.

## LAWYER REVIEW REQUIRED

- Final text of Privacy Policy, Terms of Use, and a new Cookie Policy (all three current pages are explicit placeholders).
- Legal-basis selection for each processing activity in the Stage 3 table.
- Whether the current live data flows (public winery-submitter contact info, undefined retention, no account-deletion path) create any exposure today, and what interim mitigation is advisable while the technical fixes are built.
- Required ΑΠΔΠΧ-facing content: controller identity, purposes, legal bases, rights, complaint-authority reference, retention statement.
- Cookie-consent mechanism design, specifically before any analytics/tracking is ever added — today's banner is inert, but it needs to actually work (real reject, real gating, easy withdrawal) the moment that changes.
- Copyright exposure from hotlinked/downloaded product and winery photography, and what "safe harbor," if any, applies to editorial/informational use.
