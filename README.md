# Business Site Starter

A reusable small-business website starter built with Next.js, React, TypeScript,
Tailwind CSS, Resend, and Zod.

## What Is Included

- Config-driven site metadata, navigation, contact info, hours, and social links
- Responsive homepage with hero, services, testimonials, location, and FAQ
- Reusable layout components: navbar, footer, modal lead forms
- Lead capture API route with owner notification and customer auto-reply
- Newsletter confirmation API route
- SEO metadata pattern for the App Router
- Vercel Analytics and Speed Insights hooks

## Customize A New Client Site

1. Update `config/site.ts` with the business name, URL, contact details, hours,
   navigation, and CTAs.
2. Update `data/services.ts`, `data/faq.ts`, and `data/testimonials.ts`.
3. Replace `public/starter-hero.svg`, `app/icon.png`, and any Open Graph image
   assets.
4. Set environment variables in `.env.local` or your deployment provider:

```bash
RESEND_API_KEY=
EMAIL_FROM=
BUSINESS_OWNER_EMAIL=
```

## Running Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Scripts

```bash
npm run lint
npm run build
```
