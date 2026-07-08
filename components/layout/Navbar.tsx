"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LeadModal from "./LeadModal";
import type { ModalType } from "./LeadModal";
import useLeadModal from "./useLeadModal";

type NavItem =
  | {
      name: string;
      href: string;
    }
  | {
      name: string;
      modal: ModalType;
    };

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    isSubmitting,
    openModal,
    submitError,
  } = useLeadModal();

  const navItems: NavItem[] = [
    { name: "Events", href: "/events" },
    { name: "Coaches", href: "/coaches" },
    { name: "FAQ", href: "/#faq" },
    { name: "Tours", modal: "tour" },
    { name: "Contact Us", modal: "contact" },
    { name: "Day Passes", href: "/#day-passes" },
  ];

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
    <header className="fixed left-0 top-0 z-50 flex w-full justify-center px-4 pt-5 text-sm">
      <nav className="flex w-full max-w-4xl items-center justify-between gap-6 rounded-full border border-white/10 bg-black/55 px-5 py-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-7">
        <Link
          href="/"
          className="font-heading text-lg font-black uppercase tracking-wide text-white"
        >
          Iron Palace
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) =>
            "href" in item ? (
              <Link
                key={item.href}
                href={item.href}
                className="font-medium text-white/72 transition hover:text-(--primary)"
              >
                {item.name}
              </Link>
            ) : (
              <button
                key={item.name}
                type="button"
                onClick={() => openModal(item.modal)}
                className="cursor-pointer font-medium text-white/72 transition hover:text-(--primary)"
              >
                {item.name}
              </button>
            ),
          )}
        </div>

        <div className="ml-auto flex items-center gap-3">
          <Link
            href="/join"
            className="rounded-full bg-(--primary) px-4 py-2 font-semibold text-black transition hover:bg-(--primary-hover)"
          >
            Join now
          </Link>

          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full border border-white/15 text-white/80 transition hover:border-(--primary) hover:text-(--primary) md:hidden"
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
        <div className="absolute top-19 w-[calc(100%-2rem)] max-w-4xl rounded-lg border border-white/10 bg-black/88 p-2 text-white shadow-[0_18px_50px_rgba(0,0,0,0.45)] backdrop-blur-md md:hidden">
          <div className="grid gap-1">
            {navItems.map((item) =>
              "href" in item ? (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="rounded-md px-4 py-3 font-semibold text-white/78 transition hover:bg-white/10 hover:text-(--primary)"
                >
                  {item.name}
                </Link>
              ) : (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => handleModalOpen(item.modal)}
                  className="rounded-md px-4 py-3 text-left font-semibold text-white/78 transition hover:bg-white/10 hover:text-(--primary)"
                >
                  {item.name}
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
