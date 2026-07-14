# Veriq Digital

The Veriq marketing site, built with Next.js, React, TypeScript, Tailwind CSS,
Resend, and Zod.

## Included

- Responsive homepage, services, work, about, and contact pages
- Config-driven metadata, navigation, contact details, and social links
- Project case-study routes generated from `data/projects.ts`
- Contact modal and full-page lead forms
- Lead notification, customer auto-reply, and newsletter API routes
- Vercel Analytics and Speed Insights

## Configuration

Update the site-wide details in `config/site.ts` and the homepage content in the
files under `data/`.

Set these environment variables locally or in the deployment provider:

```bash
RESEND_API_KEY=
EMAIL_FROM=
BUSINESS_OWNER_EMAIL=
```

## Development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run build
```
