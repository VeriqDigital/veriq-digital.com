# Customer-path QA — September 20, 2026

## Baseline and isolation

- Repository: `VeriqDigital/veriq-digital.com`.
- `git ls-remote --symref origin HEAD` verified default branch `main` at
  `ca19d883d96815d5246b9d34681a846827499964` against GitHub before work began.
- Isolated branch: `qa/customer-path-defects`; worktree: `.worktrees/customer-path-qa`.
  The original `Customer-Path-Problems` checkout was left unchanged.
- Reviewed PRs #39/#40, their corresponding commits, and `SEO-CONTENT-BATCH.md`.
  Article copy/dates, public destinations, pricing, analytics, and discovery flags are unchanged.
- The worktree contains no private environment files. Build/server processes used an
  OS-only environment allowlist plus `NEXT_TELEMETRY_DISABLED=1`, with no application
  provider credentials. Discovery flags retain their unset defaults; campaign remains disabled.
- Browser tests allow only local GET/HEAD requests, abort external traffic and audit APIs,
  and fulfill lead submissions with synthetic responses. No email, booking, audit,
  production data, or deployment was invoked.

## Three demonstrated defects

### 1. Floating booking shortcut obscures content and controls

Reproduce on the baseline:

- At 320×900, open `/resources/website-redesign-seo-checklist` and scroll until
  the final paragraph extends just below the viewport. The floating button covers
  the paragraph's lower lines. The same collision occurs across the five widths.
- Position the article's final service link near the viewport bottom: booking
  intercepts part of its label/hit area at 320, 390, 430, 768, and 1440px.
- On `/small-business-web-design`, position the closing Start a project button
  with its bottom about 45px above the viewport bottom. Booking covers it at 320
  and 1440px. The homepage message field is also obstructed at the four smaller widths.

Root cause: the shared visibility observer only protected the footer; a separate
mobile-only marker protected the audit form. Reading, contact, and service CTA
regions had no protection.

Correction: explicitly mark the article body/related guides/next step, homepage
inquiry panel, and closing CTAs on the four investigated service pages. Track all
visible protected regions in one observer; hide the floating shortcut while any
is visible, including on desktop. Retain footer protection, existing audit behavior,
booking destinations, navbar booking, and the floating shortcut elsewhere.

`tests/customer-path/booking.smoke.ts` failed against the original production
build with `article-ending 320: floating booking intercepts content`. Its hit tests,
keyboard CTA activation, route changes, menu/footer checks, and availability checks
cover the corrected behavior without visiting the booking provider.

### 2. Budget popup covers the focused message after Tab

Reproduce: `/contact` → focus Budget → ArrowDown → Tab. Focus reaches the message
field, but the listbox remains over its text. Reproduced at all five widths;
at 390px, a point inside the message field hits a budget option instead.

Root cause: the custom select handled Escape, selection, and pointer dismissal,
but omitted Tab dismissal. Correction: close on Tab without preventing normal
focus movement. Shift+Tab, keyboard selection, Escape, and pointer selection remain intact.

The budget regression in `tests/customer-path/forms.smoke.ts` failed on the
original build at 320px because the listbox remained open after Tab.
Separate form coverage checks required fields, invalid email, pending duplicate
prevention, HTTP/network failures, retained input, successful retry, and reset.
No input-loss defect was reproduced; submission code is unchanged.

### 3. Enlarged-text navigation controls become unreachable

Reproduce with root text size 200%: the booking/menu controls extend offscreen at
320/390/430px, and desktop links crowd booking offscreen at 1440px. At 768px with
a 640px or 800px viewport height, Contact falls below the fixed menu with no
scrollable menu area.

Root cause: viewport-only breakpoints did not account for enlarged text, and the
fixed dropdown had no height bound. Correction: root-relative container queries
reflow the header when needed; the menu occupies the remaining viewport height
and scrolls. The default visual treatment remains.

`tests/customer-path/navigation.smoke.ts` failed against the original build at
320px/200% because booking extended outside the viewport. It covers all five
widths, 640/900px heights, normal/200% root text, label bounds, keyboard access to
Contact, navigation to Services, Escape dismissal, and retained scroll position.

## Verification

Run from the isolated checkout, after a local production build/server:

| Command | Actual result |
| --- | --- |
| `npm.cmd run lint` | Passed; existing unused `HomeWhyGrowth` warning in `app/page.tsx:12` |
| `npm.cmd run typecheck` | Passed |
| `npm.cmd test` | 227 passed |
| `npm.cmd run test:browser-smoke` | 6 passed; synthetic rendered-audit fixtures |
| `npm.cmd run build` | Passed; 47 pages generated |
| `node node_modules/next/dist/bin/next start --hostname 127.0.0.1 --port 3100` | Local production server ready |
| `npm.cmd run test:customer-paths` | 4 passed; all five widths, keyboard/form/overlay paths, normal and enlarged navigation |
| `npm.cmd run test:resources-browser` | Passed; 30 article/viewport combinations |
| `git diff --check` | Passed |

Initial environment-only build obstacles: Turbopack rejected the shared dependency
junction, so existing dependencies were copied into the isolated checkout. Restricted
network access blocked Google Fonts; a credential-free build with network permission
fetched the existing public fonts. Subsequent standard builds passed. No project
dependency or build configuration was changed.

Browser coverage uses Chromium and CSS viewport widths 320, 390, 430, 768, and
1440px. Existing article coverage also includes 1024px. CI runs the new suite after
the existing article suite against the same production server, retaining all
previous assertions/checks. Screenshots are artifacts, not tracked source files:

- Baseline: `node_modules/.cache/customer-path/` (including `regression-before/article-ending-320.png`).
- Corrected: `.next/customer-path/` (booking, budget, navigation screenshots).
- Existing article suite: `.next/content-review/`.

## Remaining limits

- Browser zoom, Safari/iOS, Android browser chrome, and real assistive technology
  were not tested. Enlarged-text coverage changes the root text size to 200%.
- Real delivery/provider behavior was deliberately not exercised. Disabled campaign
  and audit-discovery paths were not enabled; the unused lead-dialog component was not mounted.
- The existing mobile menu dismisses on Escape but leaves focus on the document body
  when a menu link was focused. Scroll position is preserved. This separate issue
  remains outside the three-fix cap.
- The homepage display heading can clip at 320px with 200% root text. This separate
  content-layout issue also remains outside the selected three fixes.
- The booking correction protects the demonstrated customer-path regions; this is
  not a claim that every section of every public route has been audited.
- No merge or manual deployment.
