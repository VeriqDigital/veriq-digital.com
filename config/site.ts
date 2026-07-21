import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq",
  shortName: "Veriq",
  defaultTitle: "Websites, Software & Digital Growth Systems | Veriq",
  tagline:
    "Helping ambitious businesses grow through websites, software, and long-term digital systems.",
  description:
    "Veriq builds websites, custom software, and digital growth systems that help ambitious businesses attract customers and operate more effectively.",
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
} as const;

export type NavItem =
  | { label: string; href: string }
  | { label: string; modal: ModalType };

export const navigation: NavItem[] = [
  { label: "Web Design", href: "/web-design" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
];

export const footerLinks = [
  { label: "Web Design", href: "/web-design" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const primaryCta = {
  label: "Contact",
  modal: "contact",
} as const satisfies { label: string; modal: ModalType };
