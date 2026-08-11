"use client";

import { track } from "@vercel/analytics";
import type { ReactNode } from "react";
import { siteConfig } from "@/config/site";

export type BookingPlacement =
  | "contact_page"
  | "des_moines_closing"
  | "floating_desktop"
  | "services_closing";

type BookingLinkProps = {
  children: ReactNode;
  placement: BookingPlacement;
  className?: string;
  ariaLabel?: string;
  ariaHidden?: boolean;
  dataVisible?: boolean;
  tabIndex?: number;
};

const BookingLink = ({
  children,
  placement,
  className,
  ariaLabel = `Book a ${siteConfig.booking.durationMinutes}-minute intro call with Veriq Digital (opens in a new tab)`,
  ariaHidden,
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
    data-visible={dataVisible}
    tabIndex={tabIndex}
    onClick={() =>
      track("book_call", {
        durationMinutes: siteConfig.booking.durationMinutes,
        placement,
      })
    }
  >
    {children}
  </a>
);

export default BookingLink;
