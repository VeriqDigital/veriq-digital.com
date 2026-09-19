# Targeted resource batch — September 19, 2026

Review-ready implementation; no merge, deployment, audit run, or lead submission.
The only new editorial URL is `/resources/one-time-website-pricing-vs-monthly-plans`.

## Page intent and integration

| Page | Responsibility | Commercial next step |
| --- | --- | --- |
| `/des-moines-web-design` | Local transactional design/development | Existing service page, unchanged |
| `/small-business-web-design` | Broader small-business service | Existing service page, unchanged |
| `/website-redesign` | Transactional redesign | Existing service page, unchanged |
| `/pricing` | Actual Veriq offer and starting points | Existing pricing page, unchanged |
| `/resources/website-looks-bad-on-mobile` | Diagnose layout, content, interaction, and loading problems; choose a proportionate intervention | Contextual redesign link; optional audit CTA only under existing server discovery rules, otherwise redesign fallback |
| `/resources/how-much-does-a-small-business-website-cost` | Budget for scope and a first year of operation | Small-business service; contextual pricing link |
| `/resources/how-to-choose-a-web-designer-in-des-moines` | Evaluate providers, evidence, and proposal commitments | Des Moines service |
| `/resources/one-time-website-pricing-vs-monthly-plans` | Compare payment arrangements and continuing obligations | View website pricing |

The registry drives the blog hub, static routes, sitemap, metadata, related guides,
and TOCs. Original publication dates are retained on the three refreshed guides;
their fixed modification date is 2026-09-19. The new guide uses 2026-09-19 as its
publication date; if release is delayed, align that new publication date with the
actual release. Other article dates are unchanged.

`ResourceNextStep` keeps article rendering on the server. Only the optional audit
anchor uses the existing client tracking component, with the fixed
`website_audit_opened` event and `resource_next_step` placement. No input, URL,
personal data, new analytics platform, or feature-flag change was introduced.

## Sources and claim decisions

Primary pages checked during this batch:

- [Google responsive design basics](https://web.dev/articles/responsive-web-design-basics): flexible layout, sizing, and content-led breakpoints; cited beside the mobile explanation.
- [Google layout-shift guidance](https://web.dev/articles/optimize-cls): common shift causes and reserved space; cited beside the loading discussion.
- [WordPress.com domain credit](https://wordpress.com/support/domains/register-a-free-domain/) and [domain renewal](https://wordpress.com/support/domains/renew-a-domain/): eligible first-year credit versus later renewal; credit documentation linked in the cost guide. No current platform price is asserted.
- [Google helpful-content guidance](https://developers.google.com/search/docs/fundamentals/creating-helpful-content): useful, substantive information for readers, descriptive titles, accurate authorship and update dates.
- [Google crawlable-link guidance](https://developers.google.com/search/docs/crawling-indexing/links-crawlable): real anchors, descriptive contextual text, relevant internal discovery.

The old [Clutch budget guide](https://clutch.co/resources/how-to-create-a-budget-for-a-new-website)
was reviewed but does not establish comparable small-business scopes. Broad
numerical market bands were removed instead of presented as reliable averages.
The four useful scope distinctions remain.

Veriq business claims were checked against `app/pricing/page.tsx`, `PRODUCT.md`,
and the three service pages. Essential starts at $1,000 (1–3 core pages depending
on scope), Growth at $2,500, and specialized work receives a custom quote.
Payment structure, ongoing support, access, and handoff remain proposal-specific.
There is no invented monthly product, installment schedule, deposit, support fee,
ownership guarantee, client result, or ranking promise. No new owner policy
confirmation is required for the copy as written.

## Hypothetical budget assumptions

Both examples are explicitly illustrative US-dollar exercises, not market
averages, actual quotes, or Veriq offers. Amounts and totals are computed in their
article modules and tested against independent expected values.

- **Cost guide:** five-page service website, owner-supplied copy/brand/images,
  contact form, responsive and functional checks, basic on-page setup, launch.
  $4,000 project + $20 annual domain + 12 × ($25 hosting + $8 one email account
  + $50 maintenance/minor updates + $10 optional scheduling software) = **$5,136**.
  Operating subtotal: **$1,136**. Maintenance assumes monthly form/link checks
  and minor text edits; scheduling is linked rather than custom-integrated.
  Rates stay unchanged for 12 months after launch. Tax, new content/assets,
  migration, ecommerce, custom integrations, advertising/SEO campaigns, major
  changes, contingency, and owner time are excluded.
- **Payment guide:** equivalent five-page build scope, finished owner content,
  responsive layouts, inquiry form, basic on-page setup, testing and launch.
  Project $3,600 + $35/month hosting = **$4,020 at 12 months**, **$4,860 at 36**.
  Managed $300 setup + $200/month = **$2,700 at 12 months**, **$7,500 at 36**.
  Managed includes technical maintenance and up to one hour of minor edits per
  month, with no rollover; project totals omit owner labor and separately hired
  maintenance/edits. This difference is prominent, with no cheapest-winner claim.
  Full project fee is owed; managed assumes a 12-month minimum then monthly.
  Billing starts at the comparison period's beginning, rates stay unchanged,
  service continues throughout, with no cancellation, buyout, transfer, or extra
  work modeled. Domain/email, tax, content/assets, premium software, commerce,
  advertising/SEO campaigns, and future redesigns are excluded from both totals.

## Verification and artifacts

Use the repository commands (Windows uses `.cmd` because this shell blocks
PowerShell npm/npx shims):

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd test
npm.cmd run build
npm.cmd run test:browser-smoke
npm.cmd run start -- --hostname 127.0.0.1 --port 3100
npm.cmd run test:resources-browser
npm.cmd audit --omit=dev --audit-level=high
git diff --check
```

The focused resource tests cover registry uniqueness, related slugs, TOC IDs and
order, routes, canonical metadata, dates, blog/sitemap discovery, schema, unchanged
article rendering, CTA labels, audit-visible/hidden/production-disabled fallback,
and rendered budget arithmetic. Browser checks use the local production build
at 320, 430, 768, 1024, and 1440px for all four articles. They block external
requests and API mutations and check metadata, TOC navigation, keyboard scrolling,
visible focus, page overflow, CTA targets, and an unaffected guide.

Final results: lint passed with the one existing warning below; typecheck passed;
`npm.cmd test` passed all 225 tests (8 new resource tests); production build passed
and generated 46 pages; existing browser smoke passed all 6 tests; resource browser
smoke passed all 20 article/viewport combinations with zero page-wide overflow;
`git diff --check` passed. Generated HTML contained the intended H1, configured
`https://www.veriqdigital.com` canonical, title/description, article dates, and
parseable existing structured data. Rendered budget values match all computed
totals. Independent and coordinating editorial/technical reviews found no
remaining content or integration blocker.

Visual inspection covered hero, tables, CTA, and illustration screenshots at all
five widths. The final pass corrected contrast in the dark article CTA prompt,
used the existing accessible cyan text token on light article surfaces, and added
space between tables and following paragraphs. The unchanged global floating
booking widget can overlap a few lines at some scroll positions; scrolling clears
the content. Real-device on-screen keyboard behavior was not tested; the articles
contain no new forms. Both audit visibility states were covered with local component
fixtures, without changing runtime configuration or starting an audit.

Screenshots and browser results are under ignored `.next/content-review/` (hero,
table, and CTA per article/width, plus the mobile illustration). They are review
artifacts, not committed assets. A normal rebuild may replace this directory.

Initial sandboxed build could not fetch existing Google fonts; the normal build
passed with network access. Lint retains a pre-existing unused `HomeWhyGrowth`
import warning in `app/page.tsx`. The original batch at `40bdd5c` reported three
production advisories; the narrowly authorized PR #39 follow-up below resolves
them in a separate dependency commit.

Changed-file inventory: the three refreshed components and new payment component
under `content/resources/`, its `index.ts` export, the dedicated mobile illustration
CSS module, `data/resources.ts`, `app/resources/[slug]/page.tsx`, new
`components/resources/ResourceNextStep.tsx`, `components/ui/WebsiteAuditLink.tsx`,
the two existing article CSS modules, `tests/resources/articles.test.ts`,
`tests/resources/articles.smoke.ts`, `package.json` test scripts, and this note.
The service pages, pricing offer, SEO helpers, sitemap generator, blog template,
audit configuration, production form behavior, dependencies, and lockfile were
not changed.

## PR #39 follow-up: dependencies and CI

The follow-up preserves all article content, metadata, publication/update dates,
and audit feature flags. No production credentials, services, submissions, or
manual deployment were used. The dependency-only commit is `58fb358`.

| Package / resolved family | Before | After |
| --- | --- | --- |
| `next`, `eslint-config-next` | 16.3.0 | 16.3.5, exact manifest pins |
| `@next/env`, `@next/eslint-plugin-next`, all platform `@next/swc-*` | 16.3.0 | 16.3.5 |
| `sharp` and platform `@img/sharp-*` binaries | 0.35.3 | 0.35.4 |
| `@img/sharp-libvips-*` bundles | 1.3.2 | 1.3.3 |
| `baseline-browser-mapping` | 2.10.40 | 2.11.25 |
| `@swc/helpers`, required by patched Next.js | 0.5.15 | 0.5.23 |
| `@emnapi/runtime`, required by Sharp's WASM package | 1.11.1 | 1.11.3 |

Maintainer advisories checked: Next.js [Windows hosting](https://github.com/vercel/next.js/security/advisories/GHSA-p293-qw3h-jr36)
and [AVIF optimization](https://github.com/vercel/next.js/security/advisories/GHSA-2xp9-vwfh-vxw4)
are patched starting at 16.3.3; 16.3.5 stays on the existing maintained release
line and requires Sharp `^0.35.4`. The [Sharp advisory](https://github.com/lovell/sharp/security/advisories/GHSA-rgj7-g3m4-5g8c)
requires 0.35.4 / libheif 1.23.2. The [baseline-browser-mapping maintainer release](https://github.com/web-platform-dx/baseline-browser-mapping/releases/tag/v2.11.0)
fixes unsafe process termination beginning at 2.11.0; 2.11.25 satisfies both
Next.js and Browserslist's existing dependency ranges.

The lockfile was updated using explicit Next/tooling versions and a targeted
`npm update baseline-browser-mapping --package-lock-only`. It retains every
unrelated resolved package, including an incidental `fastq` update removed during
diff review. No overrides, ignored advisories, forced audit fix, React upgrade,
or audit-threshold change was introduced. A subsequent `npm ci` verified the
manifest/lockfile agreement; `npm ls` verified the actual installed dependency
tree. Loading native Sharp reported Sharp 0.35.4, libvips 8.18.6, and libheif 1.23.2.
The lockfile also retains the matching patched Linux packages for CI.

Verification repeated from a clean install on Windows (Node 24.20.0, npm 11.19.0):

| Command | Actual result |
| --- | --- |
| `npm.cmd ci` | Passed |
| `npm.cmd run lint` | Passed, existing unused-import warning only |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd test` | 225 passed |
| `npm.cmd run test:browser-smoke` | 6 passed |
| `npm.cmd run build` | Passed on Next.js 16.3.5, 46 pages generated |
| `npm.cmd run test:resources-browser` | Passed, all 20 article/viewport combinations |
| `npm.cmd audit --omit=dev --audit-level=high --json` | Passed, zero production vulnerabilities at every severity |
| `git diff --check` | Passed |

The unfiltered `npm audit --json` still reports two pre-existing development-only
high findings (`browserslist` and `js-yaml`). Their versions were unchanged; they
are outside the authorized production remediation and do not affect the retained
production audit gate. There is no remaining production-audit blocker.

Representative phone and desktop screenshots were visually inspected after the
patched build: payment-guide heading at 320/1440px, payment table at 430px, cost
table at 1440px, proposal worksheet at 320px, and mobile diagnostic table at
1440px. Headings remain readable and within their columns; tables retain readable
type and keyboard-accessible horizontal scrolling at narrow widths. The existing
floating booking widget overlap remains unchanged. This is Chromium viewport
verification, not a claim of testing physical phone keyboards or every browser.

`.github/workflows/ci.yml` now runs the existing article browser suite after a
successful build on Ubuntu 24.04 / Node 22. It starts `next start` at
`127.0.0.1:3100` in its own process group, polls `/blog` with a bounded 60-second
readiness budget, and traps exit/interrupt/termination to stop the group (TERM,
bounded grace, then KILL). The step has a five-minute limit and preserves the
test command's failure status through `pipefail`. The existing production audit
and all existing tests remain intact. Workflow YAML parsing and the extracted
Bash script's syntax were checked locally.

The always-run artifact step uploads only `.next/content-review/*.png`, `*.json`,
and `*.log`, including available partial screenshots and failure logs. Its name is
`article-browser-<run_id>-<attempt>` with 14-day retention. Hidden-path inclusion
is explicit because the files live under `.next`; build output and environment
files are not uploaded. `server.log` and `browser.log` accompany the screenshots
and `results.json`. Local Windows verification also saves `server-error.log`
and stops its production server in a `finally` block.

## Post-publication measurement

Annotate the actual release date. Compare equal before/after Search Console
windows with the same property, search type, country, device and other filters.
Review impressions, clicks, CTR, and position per exact page, then inspect queries
for that selected page to assess whether the intended question is being matched.
Check the new URL's indexability and canonical after publication. Interpret early
changes cautiously; seasonality, query mix, and indexing timing can affect results.
Use existing analytics to assess article-to-service/pricing visits and qualified
inquiries, plus the existing audit-open event when discovery is enabled. Do not
treat more articles, impressions, or raw leads alone as success.

The supplied Search Console screenshots were observations with an unknown date
range and filters, not monthly volume, trends, or difficulty estimates. Separate
page/query screenshots did not establish all query-to-page relationships. No
internal performance figures were published in the articles.
