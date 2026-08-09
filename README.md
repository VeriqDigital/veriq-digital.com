# Veriq Digital

The Veriq marketing site, built with Next.js, React, TypeScript, Tailwind CSS,
Resend, and Zod.

## Included

- Responsive homepage, services, work, about, and contact pages
- Config-driven metadata, navigation, contact details, and social sharing metadata
- Project case-study routes generated from `data/projects.ts`
- Contact modal and full-page lead forms
- Lead notification and customer auto-reply API route
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
```

- `RESEND_API_KEY` authorizes transactional email delivery.
- `EMAIL_FROM` is the verified sender used for owner notifications and replies.
- `BUSINESS_OWNER_EMAIL` receives every valid lead submission.

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
npm run build
npm audit --omit=dev
```

The production audit intentionally omits development-only tooling. GitHub
Actions also runs a clean install followed by lint, typecheck, build, and a
high-severity production dependency audit.
