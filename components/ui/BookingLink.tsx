"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export type BookingPlacement =
  | "contact_page"
  | "des_moines_closing"
  | "floating_desktop"
  | "floating_mobile"
  | "small_business_web_design_closing"
  | "services_closing";

type BookingLinkProps = {
  children: ReactNode;
  placement: BookingPlacement;
  responsivePlacement?: {
    query: string;
    placement: BookingPlacement;
  };
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  dataMobileMenuOpen?: boolean;
  dataVisible?: boolean;
  tabIndex?: number;
};

const BookingLink = ({
  children,
  placement,
  responsivePlacement,
  className,
  ariaLabel = `Book a ${siteConfig.booking.durationMinutes}-minute intro call with Veriq Digital (opens in a new tab)`,
  ariaHidden,
  dataMobileMenuOpen,
  dataVisible,
  tabIndex,
}: BookingLinkProps) => (
  <a
    href={siteConfig.booking.url}
    target="_blank"
    rel="noopener noreferrer"
    className={className}
    aria-label={ariaLabel}
    aria-hidden={ariaHidden}
    data-mobile-menu-open={dataMobileMenuOpen}
    data-visible={dataVisible}
    tabIndex={tabIndex}
    onClick={() => {
      const trackedPlacement =
        responsivePlacement &&
        window.matchMedia(responsivePlacement.query).matches
          ? responsivePlacement.placement
          : placement;

      track("book_call", {
        durationMinutes: siteConfig.booking.durationMinutes,
        placement: trackedPlacement,
      });
    }}
  >
    {children}
  </a>
);

export default BookingLink;
