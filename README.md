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
BLOB_READ_WRITE_TOKEN=
GOOGLE_PAGESPEED_API_KEY=
```

- `RESEND_API_KEY` authorizes transactional email delivery.
- `EMAIL_FROM` is the verified sender used for owner notifications and replies.
- `BUSINESS_OWNER_EMAIL` receives every valid lead submission.
- `BLOB_READ_WRITE_TOKEN` stores audit state, results, and explicit report-email
  requests in a private Vercel Blob store. It is required in production.
- `GOOGLE_PAGESPEED_API_KEY` enables mobile Lighthouse performance,
  accessibility, and SEO measurements through the official PageSpeed Insights
  API. Audits still complete without it, but provider-dependent checks are
  marked unavailable and excluded from scoring.

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

The direct crawler reads the submitted HTML page, `robots.txt`, a same-origin
sitemap, at most two safe same-origin HTML pages, and at most eight sampled
first-party links. It skips query-string and sensitive application paths for
optional crawling, respects crawl rules, limits redirects and response sizes,
and never loads third-party page assets or executes browser JavaScript. Google
PageSpeed Insights is the only external audit provider and receives the already
validated final public URL.

Scoring methodology v1 uses explicit check weights inside six canonical
categories and explicit category weights for the overall score. Scores are
normalized to finite integers from 0–100 at the result boundary. An unavailable
check or provider is removed from its denominator; it is never silently scored
as zero. Conversion/UX findings are deliberately conservative, source-based
recommendations rather than a visual critique. Automated accessibility checks
do not certify WCAG or legal compliance.

Known limitations: the crawler analyzes server-returned HTML rather than a
fully rendered browser, PageSpeed runs mobile only, rate limiting is best-effort
per runtime instance, compression is not scored because crawler requests use
identity encoding, and the v1 job is request-bound rather than queue-backed.
Report URLs are unguessable share links, not authenticated private documents;
they are marked `noindex` and analytics record only the route template. A
durable queue and distributed rate limiter can replace those isolated
boundaries later without changing the public result format. Automated retention
cleanup is deferred in v1; configure an appropriate private Blob lifecycle or
add a scheduled purge for audit results and report-request receipts before a
high-volume rollout.
