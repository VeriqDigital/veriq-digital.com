export const siteConfig = {
  name: "Veriq",
  shortName: "Veriq Digital",
  brandSlogan: "COMMAND ATTENTION.",
  defaultTitle: "Des Moines Web Design, SEO & Conversion | Veriq",
  tagline:
    "Custom websites, local SEO, conversion-focused functionality, and ongoing support.",
  description:
    "Veriq is a Des Moines studio for custom website design and development, local SEO, Google Business Profile assistance, conversion tools, and ongoing support.",
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
      ariaLabel: "Visit Veriq on Facebook",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/veriqdigital/",
      ariaLabel: "Visit Veriq on Instagram",
    },
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/veriqdigital",
      ariaLabel: "Veriq on LinkedIn",
    },
  ],
} as const;

export type HomepageCampaignConfig = {
  enabled: boolean;
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
  enabled: false,
  eyebrow: "FREE HOMEPAGE CONCEPT",
  heading: "Your new website starts free.",
  description:
    "I’ll design and build your new homepage at no charge so you can see what Veriq can do before deciding whether you want to go any further.",
  supportingText:
    "No contract. No obligation. Additional pages, functionality, deployment, ongoing support, and larger engagements are scoped separately.",
  ctaLabel: "Request Your Free Homepage",
  source: "homepage-free-landing-page",
  offer: "free-landing-page",
  page: "homepage",
};

export const navigation = [
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Work", href: "/work" },
  ...(auditNavigationEnabled
    ? [{ label: "Website Audit", href: "/website-audit" } as const]
    : []),
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const footerGroups = [
  {
    label: "Services",
    links: [
      { label: "Web Design & Development", href: "/services#web-design-development" },
      { label: "Custom Websites", href: "/services#custom-websites" },
      { label: "Website Redesign", href: "/services#website-redesigns" },
      { label: "Website Growth", href: "/services#website-growth" },
      { label: "SEO & Local Visibility", href: "/services#seo-growth" },
      { label: "Conversion & Website Tools", href: "/services#custom-website-tools" },
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
      { label: "Pricing", href: "/pricing" },
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
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
    ],
  },
] as const;
