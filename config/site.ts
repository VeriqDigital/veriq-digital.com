import type { ModalType } from "@/components/layout/LeadModal";

export const siteConfig = {
  name: "Veriq",
  shortName: "Veriq",
  description:
    "A modern web design agency built to modernize businesses online personas.",
  url: "https://veriqdigital.com",
  locale: "en_US",
  contact: {
    phone: "(815) 416-8926",
    email: "hello@veriqdigital.com",
  },
  socialLinks: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/",
      shortLabel: "IG",
    },
  ],
} as const;

export type NavItem =
  | { label: string; href: string }
  | { label: string; modal: ModalType };

export const navigation: NavItem[] = [
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "About", href: "/about" },
];

export const footerLinks: NavItem[] = [
  { label: "Services", href: "/#services" },
  { label: "About", href: "/about" },
  { label: "Contact", modal: "contact" },
];

export const primaryCta = {
  label: "Contact",
  modal: "contact",
} as const satisfies { label: string; modal: ModalType };
