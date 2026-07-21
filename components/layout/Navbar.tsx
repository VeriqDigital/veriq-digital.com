"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { navigation, primaryCta, siteConfig } from "@/config/site";
import LeadModal from "./LeadModal";
import type { ModalType } from "./LeadModal";
import useLeadModal from "./useLeadModal";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    isSubmitting,
    openModal,
    submitError,
  } = useLeadModal();

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    let frameId: number | null = null;
    let resetTimer: ReturnType<typeof setTimeout> | null = null;
    let downwardDistance = 0;
    let upwardDistance = 0;

    const updateNavbar = () => {
      const currentScrollY = window.scrollY;
      const difference = currentScrollY - lastScrollY.current;

      setIsScrolled(currentScrollY > 8);

      if (currentScrollY <= 8) {
        setIsVisible(true);
        downwardDistance = 0;
        upwardDistance = 0;
      } else if (difference > 0) {
        downwardDistance += difference;
        upwardDistance = 0;

        if (currentScrollY > 72 && downwardDistance >= 300) {
          setIsVisible(false);
          downwardDistance = 0;
        }
      } else if (difference < 0) {
        upwardDistance += Math.abs(difference);
        downwardDistance = 0;

        if (upwardDistance >= 40) {
          setIsVisible(true);
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

  const handleModalOpen = (modal: ModalType) => {
    setIsMenuOpen(false);
    openModal(modal);
  };

  return (
    <header
      className="site-navbar fixed inset-x-0 top-0 z-50 isolate w-full text-lg"
      data-scrolled={isScrolled}
      data-visible={isVisible || isMenuOpen}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 z-0 transition duration-300 ${
          isScrolled
            ? "bg-white/10 backdrop-blur-2xl"
            : "bg-transparent backdrop-blur-none"
        }`}
      />
      <nav className="relative z-10 mx-auto flex h-24 w-full items-center justify-between gap-3 px-4 sm:gap-8 sm:px-10 lg:px-14 xl:px-20">
        <Link
          href="/"
          className="font-heading text-2xl font-black uppercase tracking-wide text-(--nav-text) sm:text-3xl md:text-4xl"
        >
          {siteConfig.shortName}
        </Link>

        <div className="ml-auto hidden items-center gap-8 md:flex">
          {navigation.map((item) =>
            "href" in item ? (
              <Link
                key={item.href}
                href={item.href}
                className="text-lg font-semibold text-(--nav-muted) transition hover:text-(--primary) lg:text-xl"
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                onClick={() => openModal(item.modal)}
                className="cursor-pointer text-lg font-semibold text-(--nav-muted) transition hover:text-(--primary) lg:text-xl"
              >
                {item.label}
              </button>
            ),
          )}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/contact"
            onClick={() => setIsMenuOpen(false)}
            className="cursor-pointer rounded-full bg-(--primary) px-4 py-2.5 text-base font-semibold text-black transition hover:bg-(--primary-hover) sm:px-6 sm:py-3 sm:text-lg lg:text-xl"
          >
            {primaryCta.label}
          </Link>

          <button
            type="button"
            className="cursor-pointer flex size-11 items-center justify-center rounded-full border border-current/15 text-(--nav-muted) transition hover:border-(--primary) hover:text-(--primary) md:hidden"
            aria-label={
              isMenuOpen ? "Close navigation menu" : "Open navigation menu"
            }
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
        <div className="absolute inset-x-4 top-full rounded-lg border border-white/10 bg-black/88 p-2 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-xl md:hidden">
          <div className="grid gap-1">
            {navigation.map((item) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md px-4 py-3 text-lg font-semibold text-white/78 transition hover:bg-white/10 hover:text-(--primary)"
                >
                  {item.label}
                </Link>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleModalOpen(item.modal)}
                  className="rounded-md px-4 py-3 text-left text-lg font-semibold text-white/78 transition hover:bg-white/10 hover:text-(--primary)"
                >
                  {item.label}
                </button>
              ),
            )}
          </div>
        </div>
      )}

      {activeModal && (
        <LeadModal
          activeModal={activeModal}
          hasSubmitted={hasSubmitted}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          submitError={submitError}
        />
      )}
    </header>
  );
};

export default Navbar;
