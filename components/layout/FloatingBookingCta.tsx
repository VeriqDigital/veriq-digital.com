"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookingLink from "@/components/ui/BookingLink";
import { siteConfig } from "@/config/site";

const FloatingBookingCta = () => {
  const pathname = usePathname();
  const [homepageScroll, setHomepageScroll] = useState({
    pathname: "",
    eligible: false,
  });
  const [footerIntersection, setFooterIntersection] = useState({
    pathname: "",
    visible: false,
  });

  useEffect(() => {
    let frameId: number | null = null;

    const updateHomepageEligibility = () => {
      const eligible = pathname !== "/" || window.scrollY >= window.innerHeight;

      setHomepageScroll((current) =>
        current.pathname === pathname && current.eligible === eligible
          ? current
          : { pathname, eligible },
      );
      frameId = null;
    };

    const handleViewportChange = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateHomepageEligibility);
      }
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    frameId = window.requestAnimationFrame(updateHomepageEligibility);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  useEffect(() => {
    const footer = document.querySelector("footer");

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

  if (pathname === "/contact") {
    return null;
  }

  const homepageEligible =
    pathname !== "/" ||
    (homepageScroll.pathname === pathname && homepageScroll.eligible);
  const footerVisible =
    footerIntersection.pathname === pathname && footerIntersection.visible;
  const isVisible = homepageEligible && !footerVisible;

  return (
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
  );
};

export default FloatingBookingCta;
