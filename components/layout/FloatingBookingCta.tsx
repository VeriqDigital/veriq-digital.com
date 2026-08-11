"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import BookingLink from "@/components/ui/BookingLink";
import { siteConfig } from "@/config/site";

const FloatingBookingCta = () => {
  const pathname = usePathname();
  const [visibility, setVisibility] = useState({
    pathname: "",
    visible: false,
  });

  useEffect(() => {
    let frameId: number | null = null;

    const updateVisibility = () => {
      const threshold = pathname === "/" ? window.innerHeight : 360;
      const footer = document.querySelector("footer");
      const footerIsVisible = footer
        ? footer.getBoundingClientRect().top < window.innerHeight
        : false;
      const visible =
        pathname !== "/contact" &&
        window.innerWidth >= 900 &&
        window.scrollY >= threshold &&
        !footerIsVisible;

      setVisibility((current) =>
        current.pathname === pathname && current.visible === visible
          ? current
          : { pathname, visible },
      );
      frameId = null;
    };

    const handleViewportChange = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateVisibility);
      }
    };

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);
    frameId = window.requestAnimationFrame(updateVisibility);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, [pathname]);

  const isVisible =
    visibility.pathname === pathname && visibility.visible;

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
