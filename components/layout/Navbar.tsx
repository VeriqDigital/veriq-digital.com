"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, primaryCta, siteConfig } from "@/config/site";

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

      updateScrolledState(currentScrollY > 8);

      if (currentScrollY <= 8) {
        updateVisibleState(true);
        downwardDistance = 0;
        upwardDistance = 0;
      } else if (difference > 0) {
        downwardDistance += difference;
        upwardDistance = 0;

        if (currentScrollY > 72 && downwardDistance >= 300) {
          updateVisibleState(false);
          downwardDistance = 0;
        }
      } else if (difference < 0) {
        upwardDistance += Math.abs(difference);
        downwardDistance = 0;

        if (upwardDistance >= 40) {
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
          className="font-heading text-3xl font-black uppercase tracking-wide text-(--nav-text) md:text-4xl"
        >
          {siteConfig.shortName}
        </Link>

        <div className="ml-auto hidden items-center gap-7 lg:flex xl:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-base font-semibold text-(--nav-muted) transition hover:text-(--primary-readable) xl:text-lg"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="cursor-pointer rounded-full bg-(--primary) px-4 py-3 text-lg font-semibold text-black transition hover:bg-(--primary-hover) min-[360px]:px-6 lg:text-xl"
          >
            {primaryCta.label}
          </Link>

          <button
            type="button"
            className="cursor-pointer flex size-11 items-center justify-center rounded-full border border-current/15 text-(--nav-muted) transition hover:border-(--primary-readable) hover:text-(--primary-readable) lg:hidden"
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
          className="absolute inset-x-4 top-full rounded-lg border border-white/10 bg-black/88 p-2 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:hidden"
        >
          <div className="grid gap-1">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-md px-4 py-3 text-lg font-semibold text-white/78 transition hover:bg-white/10 hover:text-(--primary)"
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
