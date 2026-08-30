"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import BookingLink from "@/components/ui/BookingLink";
import { navigation, siteConfig } from "@/config/site";

const TOP_THRESHOLD = 8;
const HIDE_START = 72;
const HIDE_DISTANCE = 120;
const REVEAL_DISTANCE = 16;

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    let frameId: number | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let downwardDistance = 0;
    let upwardDistance = 0;
    let scrolled = false;
    let visible = true;

    const updateScrolledState = (nextScrolled: boolean) => {
      if (scrolled !== nextScrolled) {
        scrolled = nextScrolled;
        setIsScrolled(nextScrolled);
      }
    };

    const updateVisibleState = (nextVisible: boolean) => {
      if (visible !== nextVisible) {
        visible = nextVisible;
        setIsVisible(nextVisible);
      }
    };

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      updateScrolledState(currentScrollY > TOP_THRESHOLD);

      if (currentScrollY <= TOP_THRESHOLD) {
        updateVisibleState(true);
        downwardDistance = 0;
        upwardDistance = 0;
      } else if (difference > 0) {
        downwardDistance += difference;
        upwardDistance = 0;

        if (
          currentScrollY > HIDE_START &&
          downwardDistance >= HIDE_DISTANCE
        ) {
          updateVisibleState(false);
          downwardDistance = 0;
        }
      } else if (difference < 0) {
        upwardDistance += Math.abs(difference);
        downwardDistance = 0;

        if (upwardDistance >= REVEAL_DISTANCE) {
          updateVisibleState(true);
          upwardDistance = 0;
        }
      }

      lastScrollY.current = currentScrollY;
      frameId = null;
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateNavbar);
      }

      // Treat a pause as the end of the current scrolling gesture.
      if (resetTimer !== null) {
        clearTimeout(resetTimer);
      }

      resetTimer = setTimeout(() => {
        downwardDistance = 0;
        upwardDistance = 0;
      }, 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    updateNavbar();

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (resetTimer !== null) {
        clearTimeout(resetTimer);
      }
    };
  }, []);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    document.documentElement.dataset.mobileMenuOpen = String(isMenuOpen);

    return () => {
      delete document.documentElement.dataset.mobileMenuOpen;
    };
  }, [isMenuOpen]);

  return (
    <>
      <span className="site-navbar-safe-area" aria-hidden="true" />
      <header
        className="site-navbar fixed inset-x-0 top-0 z-50 isolate w-full text-lg"
        data-scrolled={isScrolled}
        data-visible={isVisible || isMenuOpen}
      >
      <nav
        className="relative z-10 mx-auto flex h-24 w-full items-center justify-between gap-3 px-4 min-[360px]:gap-8 min-[360px]:px-6 sm:px-10 lg:px-14 xl:px-20"
        aria-label="Primary"
      >
        <Link
          href="/"
          className="font-sans text-3xl font-black uppercase tracking-wide text-(--nav-text) md:text-4xl"
        >
          {siteConfig.name}
        </Link>

        <div className="ml-auto hidden items-center xl:flex xl:gap-6 2xl:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-semibold text-(--nav-muted) transition hover:text-(--primary-readable) 2xl:text-lg"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <BookingLink
            placement="navbar"
            onClick={() => setIsMenuOpen(false)}
            className="cursor-pointer rounded-full bg-(--primary) px-4 py-3 text-lg font-semibold text-black transition hover:bg-(--primary-hover) min-[360px]:px-6 lg:text-xl"
          >
            Book a Call
          </BookingLink>

          <button
            type="button"
            className="cursor-pointer flex size-11 items-center justify-center rounded-full border border-current/15 text-(--nav-muted) transition hover:border-(--primary-readable) hover:text-(--primary-readable) xl:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen((isOpen) => !isOpen)}
          >
            <span className="grid gap-1.5" aria-hidden="true">
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
              <span className="block h-0.5 w-4 rounded-full bg-current" />
            </span>
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile navigation"
          className="absolute inset-x-4 top-full rounded-lg border border-black/10 bg-[#f6f3ed]/95 p-2 text-(--foreground) shadow-[0_18px_50px_rgba(20,22,23,0.14)] backdrop-blur-xl xl:hidden"
        >
          <div className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-4 py-3 text-lg font-semibold text-(--nav-muted) transition hover:bg-black/5 hover:text-(--primary-readable)"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>
      )}

      </header>
    </>
  );
};

export default Navbar;
