"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookingLink from "@/components/ui/BookingLink";
import { siteConfig } from "@/config/site";

export const siteFooterSelector = "footer[data-site-footer]";
const bookingObstructionSelector =
  `${siteFooterSelector}, [data-floating-booking-obstruction]`;
export const mobileBookingObstructionSelector =
  "[data-floating-booking-mobile-obstruction]";

const FloatingBookingCta = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [obstructionIntersection, setObstructionIntersection] = useState({
    pathname: "",
    visible: false,
  });
  const [mobileObstructionIntersection, setMobileObstructionIntersection] =
    useState({ pathname: "", visible: false });

  useEffect(() => {
    const obstructions = document.querySelectorAll(bookingObstructionSelector);

    if (!obstructions.length) {
      return;
    }

    // Keep the floating shortcut out of reading and conversion regions. Track
    // every region: one leaving the viewport must not reveal it over another.
    const visibleRegions = new Set<Element>();
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visibleRegions.add(entry.target);
        else visibleRegions.delete(entry.target);
      }
      const visible = visibleRegions.size > 0;
      setObstructionIntersection((current) =>
        current.pathname === pathname && current.visible === visible
          ? current
          : { pathname, visible },
      );
    });

    obstructions.forEach((region) => observer.observe(region));

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const obstruction = document.querySelector(
      mobileBookingObstructionSelector,
    );

    if (!obstruction) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setMobileObstructionIntersection((current) =>
        current.pathname === pathname && current.visible === entry.isIntersecting
          ? current
          : { pathname, visible: entry.isIntersecting },
      );
    });

    observer.observe(obstruction);

    return () => observer.disconnect();
  }, [pathname]);

  useEffect(() => {
    const root = document.documentElement;
    const syncMenuState = () =>
      setMobileMenuOpen(root.dataset.mobileMenuOpen === "true");
    const observer = new MutationObserver(syncMenuState);

    syncMenuState();
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-mobile-menu-open"],
    });

    return () => observer.disconnect();
  }, []);

  if (pathname === "/contact" || pathname === "/pricing") {
    return null;
  }

  const obstructionVisible =
    obstructionIntersection.pathname === pathname &&
    obstructionIntersection.visible;
  const mobileObstructionVisible =
    mobileObstructionIntersection.pathname === pathname &&
    mobileObstructionIntersection.visible;
  const isVisible = !obstructionVisible && !mobileMenuOpen;
  const isMobileVisible = isVisible && !mobileObstructionVisible;

  return (
    <>
      <BookingLink
        className="floating-booking-cta-mobile"
        ariaLabel={`Book a ${siteConfig.booking.durationMinutes}-minute Veriq intro call (opens in a new tab)`}
        ariaHidden={!isMobileVisible}
        dataVisible={isMobileVisible}
        placement="floating_mobile"
        tabIndex={isMobileVisible ? undefined : -1}
      >
        <strong>Book a Call</strong>
        <i aria-hidden="true">↗</i>
      </BookingLink>
      <BookingLink
        className="floating-booking-cta"
        ariaLabel={`Book a ${siteConfig.booking.durationMinutes}-minute Veriq intro call (opens in a new tab)`}
        ariaHidden={!isVisible}
        dataVisible={isVisible}
        placement="floating_desktop"
        tabIndex={isVisible ? undefined : -1}
      >
        <span>
          <strong>Book a call</strong>
          <small>{siteConfig.booking.durationMinutes}-minute intro</small>
        </span>
        <i aria-hidden="true">↗</i>
      </BookingLink>
    </>
  );
};

export default FloatingBookingCta;
