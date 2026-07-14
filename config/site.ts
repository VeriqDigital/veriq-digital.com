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
    email: "mick@veriqdigital.com",
    address: "123 Main Street, Your City, ST 12345",
    mapUrl: "https://maps.google.com/?q=123+Main+Street",
    mapEmbedUrl: "https://www.google.com/maps?q=123%20Main%20Street&output=embed",
  },
  hours: [
    { label: "Monday-Friday", value: "8:00 AM - 6:00 PM" },
    { label: "Saturday", value: "9:00 AM - 2:00 PM" },
    { label: "Sunday", value: "Closed" },
  ],
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
  // { label: "Blog", href: "/blog" }, get rid of for now add back eventually
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
