"use client";

import { usePathname } from "next/navigation";
import BookingLink from "@/components/ui/BookingLink";
import { siteConfig } from "@/config/site";

const FloatingBookingCta = () => {
  const pathname = usePathname();

  if (pathname === "/contact") {
    return null;
  }

  return (
    <BookingLink
      className="floating-booking-cta"
      ariaLabel={`Book a ${siteConfig.booking.durationMinutes}-minute Veriq intro call (opens in a new tab)`}
      dataVisible
      placement="floating_desktop"
    >
      <span>
        <strong>Book a call</strong>
        <small>{siteConfig.booking.durationMinutes}-minute intro</small>
      </span>
      <i aria-hidden="true">↗</i>
    </BookingLink>
  );
};

export default FloatingBookingCta;
