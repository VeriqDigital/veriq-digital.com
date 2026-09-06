# Veriq

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

Mobile layout validation uses one bounded 390px Chromium render. It renders the
already validated primary HTML with scripts, frames, refresh navigation, and
active content removed. A maximum of 16 same-origin stylesheets and six images
may be fulfilled through the same DNS-revalidated, public-IP-pinned HTTP
transport used by the crawler; every other browser request is blocked. The
render measures material horizontal overflow, fixed-width containers,
overflowing images, clipped important content and actions, extremely small tap
targets on genuinely interactive controls, and very small text. Disabled,
decorative, inert, and otherwise non-actionable elements are excluded. A
provider timeout or browser failure reduces
evidence coverage rather than failing the whole audit.

PageSpeed uses a 36-second total provider budget. One fast retry is allowed for
transient network or upstream 5xx failures within that same budget; quota,
client-error, invalid-result, and timeout responses are not retried. Safe
provider logs classify the failure without recording the audited URL, API key,
or upstream response content.

Scoring methodology **v5**, centralized as `CURRENT_AUDIT_METHODOLOGY_VERSION`
in `lib/website-audit/methodology.ts`, reports automated website health across six categories:
SEO (22%), performance (20%), mobile experience (15%), accessibility (15%),
conversion foundations (12%), and technical health (16%). The stable internal
conversion category ID remains `conversion-ux`; existing saved results remain
readable and retain their original scores and methodology version. Reports using
another methodology show a legacy notice and a "Run a new audit" link. Their
overall and category scores use "Historical score" instead of current health bands;
the original summaries and findings remain readable. This includes saved v4
reports: their scores are not recomputed. Run a new audit to apply v5's rendered
evidence methodology. Scored results, the demo, and presentation use the same
current-version constant.

Checks use explicit weights and impact-adjusted deductions (confirmed 1,
likely 0.55, informational 0.1). Within each category, a `penaltyGroup` uses
only its largest deduction and largest scoring weight. Shared mobile overflow,
clipped content, and offscreen action findings therefore do not stack as
independent root failures. Findings retain their individual explanations.

The final score is the minimum of the weighted available-category average,
explicit/material constraints, the weakest available category's ceiling, and
the perfection constraint. The centralized weakest-category ceiling applies
even when no check declares an explicit overall cap:

| Weakest measured category | Overall ceiling |
| --- | --- |
| 90–100 | 100 |
| 80–89 | 92 |
| 70–79 | 86 |
| 60–69 | 79 |
| 50–59 | 72 |
| 0–49 | 66 |

`health-constraints.ts` also defines semantic overall ceilings: catastrophic
website failure 49; fundamental visibility/usability failure 69; major customer
experience defect 79; moderate material defect 93; incomplete perfection 99.
Confirmed independent material roots can tighten a ceiling by up to six points;
additional weak material categories with independent roots can tighten the
weak-category ceiling by up to ten points. These constraints are combined by
minimum, not added together. Severity alone never activates an explicit cap.

Missing a device-width viewport caps mobile at 59 and overall at 69. Measured
desktop-style rendering without that viewport, enormous overflow (160px of
horizontal scrolling, or 120px with a fixed-width element), clipped navigation,
and unreachable primary actions cap mobile at 49. Meaningful overflow (48px+),
clipped important content, serious tap problems (30%+ of controls below 20px in
both dimensions), and widespread tiny text (50%+ of sampled text below 12px)
receive major constraints. The existing 8px overflow tolerance, uncertain
off-canvas geometry, and decorative/image opportunities remain conservative.

Conversion foundations weights action detection 25, direct contact detection
25, rendered action geometry 35, and form labels 15 when forms are present.
A hidden or empty contact link and a newsletter/signup/search/login/account form
do not establish a direct contact route. Inquiry forms require relevant fields
(such as a message or phone field) or form-specific contact/quote/request intent;
an ambiguous email-only form stays unverified. Action paths require a meaningful
anchor destination (including phone/email links) or a native submit control
owned by a relevant inquiry form. These signals verify structure, not successful
submission. Bare buttons, click handlers, and interactive ARIA controls alone
reveal intent but cannot verify JavaScript behavior. When such uncertain controls
or forms are the only potential routes, path checks are unavailable and reduce
coverage; they neither pass nor trigger the combined missing-path cap.
Missing both customer paths without these uncertainty signals adds a shared-root check,
caps this category at 59, and declares a modest overall ceiling of 79; the
weakest-category rule can constrain it further. This absence finding is scoped
to the primary HTML and explains its relevance to business-oriented pages.
Form label findings share the accessibility root. Rendered actions must actually
be observed before their geometry can pass; absent observations are unavailable.
No forms are required on sites that provide other customer routes.

Unavailable checks are excluded from health-score denominators and reduce
evidence coverage. Partial evidence uses completed checks without a prior or a
fabricated failure; its confidence remains separately visible. Only complete
evidence with no findings permits 100. High scores mean **strong automated
foundations**, not excellent visual design. The report does not grade branding,
copy quality, visual hierarchy, persuasion, or end-to-end customer journeys.
Automated accessibility checks do not certify WCAG or legal compliance.

Rendered mobile checks measure a **security-restricted reconstruction**, not a
normal visit to the live website. Scripts, inline handlers, and embedded
documents are removed; stylesheets and images use bounded, same-origin, SSRF-safe
requests. Those security and resource restrictions remain in force.

The provider assesses **render fidelity separately from measured geometry**.
It records numeric resource outcomes, count/byte ceilings, removed executable
scripts/handlers, and source-content completeness without retaining resource URLs.
High fidelity means no detected CSS loss or significant dynamic uncertainty.
Small CSS loss is moderate; losing at least 25% of requested CSS, hitting a
stylesheet count/byte ceiling, or a script-heavy shell (at least eight removed
executable scripts and inline handlers combined, without meaningful source content)
is low. CSS loss combined with dynamic
uncertainty or total-byte exhaustion is also low. Source completeness requires
at least 200 text characters, a heading, and paragraph/list/form content after
non-content markup is removed. It is a heuristic, not a guarantee about hydration.
Complete source with fewer than eight removed executable scripts/handlers may
remain high; eight or more makes it moderate even with intact CSS. This threshold
retains the existing eight-script boundary and includes inline behavior: substantial
client code can still initialize responsive classes, navigation, or transforms
after server rendering. It is a dependency-count proxy, not a measurement of code
complexity. Complete SSR is never low solely for using JavaScript. Inert JSON
scripts are excluded. Removed embedded documents remain diagnostic and do not
independently lower global fidelity or strip unrelated geometry caps.
Missing decorative images alone do not make fidelity low. Image-only total-byte
exhaustion is at most moderate.

Width/scroll, clipping, image overflow, touch targets, text size, customer action
geometry, and rendered image-space checks use this fidelity. High-fidelity
findings retain their existing penalties and material caps without requiring
PageSpeed. Moderate evidence has at most 0.7 confidence and likely impact; hard
render-derived caps are removed. Low-fidelity checks are unavailable, with useful
measurements retained as potential informational findings. This lowers coverage
and leaves the remaining reliable checks to determine scores; it fabricates
neither success nor failure. One report notice explains the reconstruction limit.
Missing source image width/height attributes remain an informational opportunity
even at low fidelity (0.65 confidence for this partially evaluated check). Rendered
reservation is then unverified, and its measurements cannot imply layout instability
or apply caps. Adequate rendered evidence may still strengthen that source finding.

A PageSpeed width or tap-target score below 50 can support the corresponding
low-fidelity rendered finding at 0.5 confidence and likely impact. Missing source
viewport metadata plus desktop-width rendering can similarly support a likely
width issue. These signals cannot establish the synthetic defect's magnitude,
specific clipped controls, or catastrophic render caps. Independent source and
PageSpeed checks retain their own existing penalties/caps. A healthy or missing
PageSpeed width result cannot corroborate synthetic overflow. Overall weights,
weakest-category constraints, and semantic score caps are unchanged.

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
burst protection. Audit creation allows five requests per client per 15-minute
fixed window, and rate-limit responses include the remaining wait in
`Retry-After`. Audit execution and report email also have independent global
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

The rendered-mobile provider bundles the Chrome 143 serverless binary and uses
the existing 60-second Node.js audit route; it requires no additional Vercel
environment variable. Local or non-Vercel runtimes can set
`WEBSITE_AUDIT_CHROME_PATH` when Chrome or Edge is not installed in a standard
location. Allocate normal browser-capable function memory (at least 512 MB;
more is preferable for cold starts).

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
