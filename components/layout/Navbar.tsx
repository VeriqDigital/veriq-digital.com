"use client";

import Link from "next/link";
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
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    openModal,
  } = useLeadModal();

  const navItems: NavItem[] = [
    { name: "Events", href: "/events" },
    { name: "Coaches", href: "/coaches" },
    { name: "FAQ", href: "/#faq" },
    { name: "Tours", modal: "tour" },
    { name: "Contact Us", modal: "contact" },
    { name: "Day Passes", href: "/#day-passes" },
  ];

  return (
    <header className="fixed left-0 top-0 z-50 flex w-full justify-center px-4 pt-5">
      <nav className="flex w-full max-w-4xl items-center justify-between gap-6 rounded-full border border-white/10 bg-black/55 px-5 py-3 text-sm shadow-[0_18px_50px_rgba(0,0,0,0.35)] backdrop-blur-md sm:px-7">
        <Link
          href="/"
          className="font-heading text-lg font-black uppercase tracking-wide text-white"
        >
          Iron Palace
        </Link>

        <div className="hidden items-center gap-7 md:flex">
          {navItems.map((item) => (
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
            )
          ))}
        </div>

        <Link
          href="/join"
          className="rounded-full bg-(--primary) px-4 py-2 font-semibold text-black transition hover:bg-(--primary-hover)"
        >
          Join now
        </Link>
      </nav>

      {activeModal && (
        <LeadModal
          activeModal={activeModal}
          hasSubmitted={hasSubmitted}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
        />
      )}
    </header>
  );
};

export default Navbar;
