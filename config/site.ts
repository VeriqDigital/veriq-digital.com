import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq Digital",
  shortName: "Veriq",
  defaultTitle: "Websites & Custom Software for Growing Businesses | Veriq Digital",
  tagline:
    "Web design, custom development, and growth support built around what the business actually needs.",
  description:
    "Veriq Digital designs websites and custom software that help growing businesses attract customers, improve operations, and build for the long term.",
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
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "Des Moines Web Design", href: "/des-moines-web-design" },
  { label: "Blog", href: "/blog" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const primaryCta = {
  label: "Contact",
  modal: "contact",
} as const satisfies { label: string; modal: ModalType };
