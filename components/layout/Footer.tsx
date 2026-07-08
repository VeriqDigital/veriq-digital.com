"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import LeadModal from "./LeadModal";
import type { ModalType } from "./LeadModal";
import useLeadModal from "./useLeadModal";

type UtilityLink =
  | {
      label: string;
      href: string;
    }
  | {
      label: string;
      modal: ModalType;
    };

const utilityLinks: UtilityLink[] = [
  { label: "Careers", href: "/careers" },
  { label: "Join Now", href: "/join" },
  { label: "Contact Us", modal: "contact" },
  { label: "Book A Tour", modal: "tour" },
  { label: "Membership Cancellation", modal: "cancellation" },
];

const Footer = () => {
  const [newsletterEmail, setNewsletterEmail] = useState("");
  const [newsletterMessage, setNewsletterMessage] = useState("");
  const [newsletterStatus, setNewsletterStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    isSubmitting,
    openModal,
    submitError,
  } = useLeadModal();

  const handleNewsletterSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNewsletterStatus("loading");
    setNewsletterMessage("");

    const response = await fetch("/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: newsletterEmail }),
    });
    const data = (await response.json().catch(() => null)) as {
      message?: string;
    } | null;

    if (!response.ok) {
      setNewsletterStatus("error");
      setNewsletterMessage(
        data?.message ?? "Something went wrong. Please try again.",
      );
      return;
    }

    setNewsletterStatus("success");
    setNewsletterEmail("");
    setNewsletterMessage(
      data?.message ?? "Thanks for signing up to the Iron Palace newsletter!",
    );
  };

  return (
    <footer className="w-full px-6 py-20 text-white sm:py-24">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center">
        <div className="grid w-full gap-14 md:grid-cols-[1fr_1.2fr] md:gap-54">
          <div className="text-center md:text-left">
            <h2 className="font-heading text-lg font-black uppercase">
              Utilities
            </h2>
            <ul className="mt-5 flex flex-col gap-4 text-sm font-bold text-white/65">
              {utilityLinks.map((link) => (
                <li key={link.label}>
                  {"href" in link ? (
                    <Link
                      href={link.href}
                      className="transition hover:text-(--primary)"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openModal(link.modal)}
                      className="cursor-pointer transition hover:text-(--primary)"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h2 className="font-heading text-lg font-black uppercase">
              Sign Up To Our Newsletter
            </h2>
            <form
              className="mt-5 flex w-full max-w-md flex-col gap-3"
              onSubmit={handleNewsletterSubmit}
            >
              <div className="flex flex-col gap-3 sm:flex-row">
                <label className="sr-only" htmlFor="footer-email">
                  Email address
                </label>
                <input
                  id="footer-email"
                  type="email"
                  value={newsletterEmail}
                  onChange={(event) => setNewsletterEmail(event.target.value)}
                  placeholder="Your Email Address"
                  required
                  className="min-h-12 flex-1 rounded-md border border-white/35 bg-transparent px-5 text-sm font-semibold text-white outline-none transition placeholder:text-white/45 focus:border-(--primary)"
                />
                <button
                  type="submit"
                  disabled={newsletterStatus === "loading"}
                  className="min-h-12 cursor-pointer rounded-md bg-white px-7 font-heading text-sm font-black uppercase text-black transition duration-200 hover:scale-[1.03] hover:bg-(--primary) disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100 disabled:hover:bg-white"
                >
                  {newsletterStatus === "loading" ? "Sending" : "Sign Up"}
                </button>
              </div>
              {newsletterMessage && (
                <p
                  className={`text-sm font-semibold ${
                    newsletterStatus === "success"
                      ? "text-(--primary)"
                      : "text-red-300"
                  }`}
                  aria-live="polite"
                >
                  {newsletterMessage}
                </p>
              )}
            </form>

            <div className="mt-9 h-px w-full max-w-md bg-white/18" />

            <div className="mt-9 flex w-full max-w-md items-center justify-between gap-8">
              <h2 className="font-heading text-lg font-black uppercase">
                Follow Us
              </h2>
              <a
                href="https://www.instagram.com/"
                aria-label="Instagram"
                className="grid size-8 place-items-center rounded-md border border-white/35 text-xs font-black text-white/75 transition hover:border-(--primary) hover:text-(--primary)"
              >
                IG
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center text-[0.7rem] font-bold uppercase leading-relaxed text-white/55">
          <p className="text-white/80">
            &copy; 2026 Iron Palace. All Rights Reserved
          </p>
          {/* <p className="mt-2 font-heading text-white">
            Learn More | Train Hard | Be More
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {legalLinks.map((link, index) => (
              <span key={link} className="flex items-center gap-2">
                {index > 0 && <span className="text-white/30">|</span>}
                <span>{link}</span>
              </span>
            ))}
          </div> */}
          <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-zinc-500">
            Disclaimer: This website is a fictional portfolio project developed
            to demonstrate web design and development capabilities. Iron Palace
            is not an operating business, and all content, pricing, memberships,
            events, locations, and services displayed are fictitious and
            provided solely for demonstration purposes.
          </p>
        </div>
      </div>

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
    </footer>
  );
};

export default Footer;
