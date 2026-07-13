"use client";

import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import BudgetSelect from "@/components/ui/BudgetSelect";

export type ModalType = "quote" | "contact";

const modalContent = {
  quote: {
    eyebrow: "Request quote",
    title: "Tell us what you need",
    submitLabel: "Send request",
    successTitle: "Thanks, we got your request.",
    successMessage: "Someone from the business will follow up soon.",
  },
  contact: {
    eyebrow: "hello@veriqdigital.com",
    title: "Let's Talk",
    submitLabel: "Send message",
    successTitle: "Thanks, your message is in.",
    successMessage: "Someone from the business will get back to you soon.",
  },
};

type LeadModalProps = {
  activeModal: ModalType;
  hasSubmitted: boolean;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  submitError: string;
};

const LeadModal = ({
  activeModal,
  hasSubmitted,
  isSubmitting,
  onClose,
  onSubmit,
  submitError,
}: LeadModalProps) => {
  const activeContent = modalContent[activeModal];
  const isQuote = activeModal === "quote";

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/75 px-4 py-8 backdrop-blur-sm"
      role="presentation"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${activeModal}-form-title`}
        className="w-full max-w-xl rounded-lg border border-white/10 bg-(--surface) p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-(--primary)">
              {activeContent.eyebrow}
            </p>
            <h2
              id={`${activeModal}-form-title`}
              className="font-heading text-3xl font-black uppercase"
            >
              {activeContent.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 cursor-pointer items-center justify-center rounded-full border border-white/10 text-xl leading-none text-white/70 transition hover:border-(--primary) hover:text-(--primary)"
            aria-label={`Close ${activeContent.title.toLowerCase()} form`}
          >
            x
          </button>
        </div>

        {hasSubmitted ? (
          <div className="rounded-md border border-(--primary)/40 bg-(--primary)/10 p-4">
            <p className="font-semibold text-(--primary)">
              {activeContent.successTitle}
            </p>
            <p className="mt-2 text-sm text-white/70">
              {activeContent.successMessage}
            </p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-white/80">
                Name
                <input
                  required
                  name="name"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                  placeholder="Your name"
                />
              </label>
              <label className="block text-sm font-semibold text-white/80">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-white/80">
                <span className="flex items-center justify-between gap-3">
                  Phone
                  <span className="text-xs font-normal text-white/35">
                    Optional
                  </span>
                </span>
                <input
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                  placeholder="(555) 555-5555"
                />
              </label>
              {isQuote ? (
                <label className="block text-sm font-semibold text-white/80">
                  Preferred date
                  <input
                    name="preferred-date"
                    type="date"
                    className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition focus:border-(--primary)"
                  />
                </label>
              ) : (
                <div className="block text-sm font-semibold text-white/80">
                  <span
                    id="budget-label"
                    className="flex items-center justify-between gap-3"
                  >
                    Budget
                    <span className="text-xs font-normal text-white/35">
                      Optional
                    </span>
                  </span>
                  <BudgetSelect />
                </div>
              )}
            </div>

            <label className="block text-sm font-semibold text-white/80">
              {isQuote
                ? "What can we help with?"
                : "Tell us About Your Project"}
              <textarea
                required
                name="message"
                rows={4}
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                placeholder="Share a few details about what you are looking for."
              />
            </label>

            <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="cursor-pointer rounded-md border border-white/10 px-5 py-2.5 font-semibold text-white/80 transition hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="cursor-pointer rounded-md bg-(--primary) px-5 py-2.5 font-semibold text-black transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending" : activeContent.submitLabel}
              </button>
            </div>

            {submitError && (
              <p
                className="text-sm font-semibold text-red-300"
                aria-live="polite"
              >
                {submitError}
              </p>
            )}
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default LeadModal;
