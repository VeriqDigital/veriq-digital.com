import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq",
  shortName: "Veriq",
  description:
    "Founder-led digital studio creating thoughtful websites and software.",
  url: "https://veriqdigital.com",
  locale: "en_US",
  contact: {
    phone: "(815) 416-8926",
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
