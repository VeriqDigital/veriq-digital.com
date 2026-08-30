"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export type BookingPlacement =
  | "contact_page"
  | "des_moines_closing"
  | "floating_desktop"
  | "floating_mobile"
  | "navbar"
  | "pricing_closing"
  | "pricing_hero"
  | "small_business_web_design_closing"
  | "services_hero"
  | "services_closing"
  | "website_audit_closing"
  | "website_redesign_closing";

type BookingLinkProps = {
  children: ReactNode;
  placement: BookingPlacement;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  dataVisible?: boolean;
  tabIndex?: number;
  onClick?: () => void;
};

const BookingLink = ({
  children,
  placement,
  className,
  ariaLabel = `Book a ${siteConfig.booking.durationMinutes}-minute intro call with Veriq (opens in a new tab)`,
  ariaHidden,
  dataVisible,
  tabIndex,
  onClick,
}: BookingLinkProps) => (
  <a
    href={siteConfig.booking.url}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    aria-label={ariaLabel}
    aria-hidden={ariaHidden}
    data-visible={dataVisible}
    tabIndex={tabIndex}
    onClick={() => {
      track("book_call", {
        durationMinutes: siteConfig.booking.durationMinutes,
        placement,
      });
      onClick?.();
    }}
  >
    {children}
  </a>
);

export default BookingLink;
