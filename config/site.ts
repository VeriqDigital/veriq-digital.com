import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq",
  shortName: "Veriq",
  defaultTitle: "Web Design & Custom Software Studio | Veriq",
  tagline:
    "Founder-led digital studio creating thoughtful websites and software.",
  description:
    "Des Moines web design and custom software studio creating thoughtful digital experiences for local and remote clients.",
  url: "https://veriqdigital.com",
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
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
];

export const footerLinks = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
] as const satisfies ReadonlyArray<{ label: string; href: string }>;

export const primaryCta = {
  label: "Contact",
  modal: "contact",
} as const satisfies { label: string; modal: ModalType };
