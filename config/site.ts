import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq Digital",
  shortName: "Veriq",
  defaultTitle: "Websites & Custom Software for Growing Businesses | Veriq Digital",
  tagline:
    "Web design, SEO, custom functionality, and ongoing support built around what the business actually needs.",
  description:
    "Veriq Digital designs custom and Squarespace websites with SEO foundations, conversion-focused structure, custom functionality, and ongoing support for growing businesses.",
  url: "https://www.veriqdigital.com",
  locale: "en_US",
  location: {
    city: "Des Moines",
    region: "Iowa",
    regionCode: "IA",
    country: "United States",
    countryCode: "US",
  },
  contact: {
    phone: "(815) 416-8926",
    phoneE164: "+18154168926",
    email: "hello@veriqdigital.com",
  },
  booking: {
    url: "https://cal.com/mickenev/veriq",
    durationMinutes: 20,
  },
  socialLinks: [
    {
      name: "Facebook",
      href: "https://www.facebook.com/profile.php?id=61592568039360",
      ariaLabel: "Visit Veriq Digital on Facebook",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/veriqdigital/",
      ariaLabel: "Visit Veriq Digital on Instagram",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/veriqdigital",
      ariaLabel: "Veriq Digital on LinkedIn",
    },
  ],
} as const;

export type HomepageCampaignConfig = {
  enabled: boolean;
  spotCount: number;
  eyebrow: string;
  heading: string;
  description: string;
  supportingText: string;
  ctaLabel: string;
  source: "homepage-free-landing-page";
  offer: "free-landing-page";
  page: "homepage";
};

const auditNavigationEnabled =
  process.env.NEXT_PUBLIC_WEBSITE_AUDIT_DISCOVERY_ENABLED === "true";

export const homepageCampaign: HomepageCampaignConfig = {
  enabled: true,
  spotCount: 3,
  eyebrow: "FOR IOWA SERVICE BUSINESSES",
  heading: "Free Custom Landing Page",
  description:
    "Custom designed specifically for your business.",
  supportingText:
    "No contracts. No obligation.",
  ctaLabel: "Claim My Spot",
  source: "homepage-free-landing-page",
  offer: "free-landing-page",
  page: "homepage",
};

export const navigation = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  ...(auditNavigationEnabled
    ? [{ label: "Website Audit", href: "/website-audit" } as const]
    : []),
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const footerGroups = [
  {
    label: "Services",
    links: [
      { label: "Web Design", href: "/small-business-web-design" },
      { label: "Website Redesign", href: "/website-redesign" },
      { label: "Custom Development", href: "/services#custom-development" },
      { label: "Squarespace", href: "/small-business-web-design" },
      { label: "SEO", href: "/services#ongoing-support" },
      { label: "Website Support", href: "/services#ongoing-support" },
    ],
  },
  {
    label: "Locations",
    links: [
      { label: "Des Moines Web Design", href: "/des-moines-web-design" },
    ],
  },
  {
    label: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Work", href: "/work" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    label: "Resources",
    links: [
      ...(auditNavigationEnabled
        ? [{ label: "Free Website Audit", href: "/website-audit" } as const]
        : []),
      { label: "Website Guides", href: "/blog" },
      { label: "Website Cost Guide", href: "/resources/how-much-does-a-small-business-website-cost" },
      { label: "Custom vs. Template", href: "/resources/custom-website-vs-template-for-small-business" },
    ],
  },
  {
    label: "Legal",
    links: [{ label: "Privacy", href: "/privacy" }],
  },
] as const;

export const primaryCta = {
  label: "Contact",
  modal: "contact",
} as const satisfies { label: string; modal: ModalType };
