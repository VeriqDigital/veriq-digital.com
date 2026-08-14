# Veriq Digital

The Veriq marketing site, built with Next.js, React, TypeScript, Tailwind CSS,
Resend, and Zod.

## Included

- Responsive homepage, services, work, about, and contact pages
- Config-driven metadata, navigation, contact details, and social sharing metadata
- Project case-study routes generated from `data/projects.ts`
- Contact modal and full-page lead forms
- Lead notification and customer auto-reply API route
- Real, shareable website audits with bounded first-party crawling and mobile
  PageSpeed Insights data
- Vercel Analytics and Speed Insights

## Configuration

Update the site-wide details in `config/site.ts` and the homepage content in the
files under `data/`.

Copy `.env.example` to `.env.local` and set these required values locally or in
the deployment provider:

```bash
RESEND_API_KEY=
EMAIL_FROM=
BUSINESS_OWNER_EMAIL=
BLOB_STORE_ID=
GOOGLE_PAGESPEED_API_KEY=
WEBSITE_AUDIT_ENABLED=false
WEBSITE_AUDIT_DISCOVERY_ENABLED=false
NEXT_PUBLIC_WEBSITE_AUDIT_DISCOVERY_ENABLED=false
WEBSITE_AUDIT_RETENTION_DAYS=30
WEBSITE_AUDIT_DAILY_RUN_LIMIT=100
WEBSITE_AUDIT_DAILY_EMAIL_LIMIT=100
WEBSITE_AUDIT_HASH_SECRET=
CRON_SECRET=
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

- `RESEND_API_KEY` authorizes transactional email delivery.
- `EMAIL_FROM` is the verified sender used for owner notifications and replies.
- `BUSINESS_OWNER_EMAIL` receives every valid lead submission.
- `BLOB_STORE_ID` selects the attached private Vercel Blob store. In Vercel
  Functions, `@vercel/blob` uses the request-scoped Vercel OIDC credential; do
  not add a long-lived `VERCEL_OIDC_TOKEN` to production configuration.
- `BLOB_READ_WRITE_TOKEN` remains an optional fallback for local or non-Vercel
  runtimes because the installed Blob SDK supports it. Production accepts
  either the OIDC store configuration or this fallback, and remains disabled
  when neither is present.
- `GOOGLE_PAGESPEED_API_KEY` enables mobile Lighthouse performance,
  accessibility, and SEO measurements through the official PageSpeed Insights
  API and is required before production launch.

LeadHome mirroring is optional. To enable it, set both `LEADHOME_URL` and
`LEADHOME_SOURCE_TOKEN`. Leaving both unset keeps Resend intake working; setting
only one is treated as an invalid configuration so a partial integration cannot
silently drop data.

## Development

Use Node.js 22.13 or newer, then install exactly from the lockfile:

```bash
npm ci
npm run dev
```

## Verification

Run the same checks used by CI before requesting review:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm audit --omit=dev
```

The production audit intentionally omits development-only tooling. GitHub
Actions also runs a clean install followed by lint, typecheck, tests, build,
and a high-severity production dependency audit.

## Website audit architecture

The audit engine runs in a bounded Node.js request and persists state/results
behind opaque report IDs. Production uses private Vercel Blob; local development
uses `.next/website-audits`. User-supplied URLs are independently validated on
the server, every DNS answer must be public, and each request connects to the
validated IP while preserving TLS hostname verification. Redirects repeat the
same validation and may not use custom ports or private/internal destinations.

The direct crawler reads the submitted HTML page first, then `robots.txt`, a
same-origin sitemap, at most two safe same-origin HTML pages, and at most eight
sampled first-party links. Robots rules therefore do not prevent the
user-requested primary fetch; they govern only optional same-origin page and link
crawling. The crawler skips query-string and sensitive application paths for
optional crawling, respects those rules, limits redirects and response sizes,
and never loads third-party page assets or executes browser JavaScript. Google
PageSpeed Insights is the only external audit provider and receives the already
validated final public URL.

Scoring methodology v2 uses explicit check weights inside six canonical
categories and explicit category weights for the overall score. Missing checks
reduce evidence coverage and pull partial results toward a conservative prior;
they are never silently zero or perfect. Partial/sparse categories cannot score
90+, severe findings impose centralized ceilings, and the source-only
Conversion/UX category has a conservative ceiling. Automated accessibility
checks do not certify WCAG or legal compliance.

Known limitations: the crawler analyzes server-returned HTML rather than a
fully rendered browser, PageSpeed runs mobile only, compression is not scored
because crawler requests use identity encoding, and execution remains
request-bound rather than queue-backed. `ReportView` owns starting, polling, and
recovering jobs; optimistic Blob ETags preserve atomic claims and stale runs are
re-queued once before failing safely.

### Production launch controls

Production is fail-closed. `WEBSITE_AUDIT_ENABLED=true` is honored only when
private Blob storage, PageSpeed, Resend, Redis, hashing, retention, quota, and
cron settings are valid. Creation, execution, and report-email routes use an
atomic Redis fixed-window limiter; the process-local map remains supplemental
burst protection. Audit execution and report email also have independent global
24-hour quotas. If Redis is unavailable, a quota cannot be verified, or any
required configuration is absent, the affected route returns `503` with a
`Retry-After` header and performs no outbound audit or email work.

Use these launch values as a deliberate starting point and tune them against
observed traffic and provider budgets:

```bash
WEBSITE_AUDIT_ENABLED=true
WEBSITE_AUDIT_RETENTION_DAYS=30
WEBSITE_AUDIT_DAILY_RUN_LIMIT=100
WEBSITE_AUDIT_DAILY_EMAIL_LIMIT=100
WEBSITE_AUDIT_HASH_SECRET=<32+ random characters>
CRON_SECRET=<16+ random characters>
UPSTASH_REDIS_REST_URL=<server-only Redis REST URL>
UPSTASH_REDIS_REST_TOKEN=<server-only standard token>
BLOB_STORE_ID=<attached private Blob store ID>
GOOGLE_PAGESPEED_API_KEY=<quota-restricted API key>
RESEND_API_KEY=<transactional email key>
EMAIL_FROM=<verified sender>
```

Vercel supplies the OIDC credential to Functions at request time. For local
development, use `vercel env pull` or configure the optional
`BLOB_READ_WRITE_TOKEN` fallback; never commit either credential.

`vercel.json` runs the authenticated retention purge daily. Audit state,
results, and pseudonymous delivery receipts become unreadable at the configured
retention boundary and Blob objects are deleted by the purge. Report delivery
stores only a keyed recipient hash, status, timestamp, audit ID, and provider
message ID; raw name and email values exist only during the Resend request.

Keep both discovery flags false until the production smoke checklist passes:

```bash
WEBSITE_AUDIT_DISCOVERY_ENABLED=false
NEXT_PUBLIC_WEBSITE_AUDIT_DISCOVERY_ENABLED=false
```

With those flags false, the route remains out of navigation and the sitemap,
and is disallowed/noindexed. After launch verification, set both to `true` in
the same production build. The server-side feature gate remains authoritative.

Report URLs are unguessable share links, not authenticated private documents;
they remain `noindex`, and analytics record only the route template. A durable
queue can replace the request-bound execution boundary later without changing
the public result format.
