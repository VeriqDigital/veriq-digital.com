"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookingLink from "@/components/ui/BookingLink";
import { siteConfig } from "@/config/site";

export const siteFooterSelector = "footer[data-site-footer]";
export const mobileBookingObstructionSelector =
  "[data-floating-booking-mobile-obstruction]";

const FloatingBookingCta = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [footerIntersection, setFooterIntersection] = useState({
    pathname: "",
    visible: false,
  });
  const [mobileObstructionIntersection, setMobileObstructionIntersection] =
    useState({ pathname: "", visible: false });

  useEffect(() => {
    const footer = document.querySelector(siteFooterSelector);

    if (!footer) {
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      setFooterIntersection((current) =>
        current.pathname === pathname && current.visible === entry.isIntersecting
          ? current
          : { pathname, visible: entry.isIntersecting },
      );
    });

    observer.observe(footer);

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

  const footerVisible =
    footerIntersection.pathname === pathname && footerIntersection.visible;
  const mobileObstructionVisible =
    mobileObstructionIntersection.pathname === pathname &&
    mobileObstructionIntersection.visible;
  const isVisible = !footerVisible;
  const isMobileVisible =
    isVisible && !mobileMenuOpen && !mobileObstructionVisible;

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
