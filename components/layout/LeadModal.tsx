"use client";

import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import BudgetSelect from "@/components/ui/BudgetSelect";
import useStableModalPosition from "@/components/ui/useStableModalPosition";

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const modalContent = {
  contact: {
    eyebrow: "hello@veriqdigital.com",
    title: "Let's Talk",
    submitLabel: "Send message",
    successTitle: "Thanks, your message is in.",
    successMessage: "We’ll get back to you within one business day.",
  },
} as const;

export type ModalType = keyof typeof modalContent;

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
  const dialogRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLParagraphElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useStableModalPosition(dialogRef, true);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const frameId = window.requestAnimationFrame(() => {
      firstInputRef.current?.focus();
    });

    return () => {
      window.cancelAnimationFrame(frameId);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;

      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.focus();
    }
  }, [hasSubmitted]);

  useEffect(() => {
    if (submitError) {
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [submitError]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      onClose();
      return;
    }

    if (event.key !== "Tab" || !dialogRef.current) {
      return;
    }

    const focusableElements = Array.from(
      dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement;
    const activeIndex = focusableElements.indexOf(activeElement as HTMLElement);

    if (!dialogRef.current.contains(activeElement)) {
      event.preventDefault();
      firstElement.focus();
    } else if (activeIndex === -1) {
      event.preventDefault();
      (event.shiftKey ? lastElement : firstElement).focus();
    } else if (event.shiftKey && activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex items-start justify-center overflow-y-auto overscroll-contain bg-black/75 px-4 py-8 backdrop-blur-sm sm:items-center"
      role="presentation"
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${activeModal}-form-title`}
        aria-describedby={
          hasSubmitted ? `${activeModal}-success-description` : undefined
        }
        className="max-h-[calc(100dvh-4rem)] w-full max-w-xl overflow-y-auto rounded-lg border border-white/10 bg-(--surface) p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.5)]"
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
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-white/10 text-xl leading-none text-white/70 transition hover:border-(--primary) hover:text-(--primary)"
            aria-label={`Close ${activeContent.title.toLowerCase()} form`}
          >
            x
          </button>
        </div>

        {hasSubmitted ? (
          <div
            ref={successRef}
            className="rounded-md border border-(--primary)/40 bg-(--primary)/10 p-4 outline-none"
            role="status"
            tabIndex={-1}
          >
            <p className="font-semibold text-(--primary)">
              {activeContent.successTitle}
            </p>
            <p
              id={`${activeModal}-success-description`}
              className="mt-2 text-sm text-white/70"
            >
              {activeContent.successMessage}
            </p>
          </div>
        ) : (
          <form
            className="space-y-4"
            onSubmit={onSubmit}
            aria-busy={isSubmitting}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-white/80">
                Name
                <input
                  ref={firstInputRef}
                  required
                  name="name"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/55 focus:border-(--primary)"
                  placeholder="Your name"
                />
              </label>
              <label className="block text-sm font-semibold text-white/80">
                Email
                <input
                  required
                  type="email"
                  name="email"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/55 focus:border-(--primary)"
                  placeholder="you@example.com"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-white/80">
                <span className="flex items-center justify-between gap-3">
                  Phone
                  <span className="text-xs font-normal text-white/55">
                    Optional
                  </span>
                </span>
                <input
                  name="phone"
                  type="tel"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/55 focus:border-(--primary)"
                  placeholder="(555) 555-5555"
                />
              </label>
              <div className="block text-sm font-semibold text-white/80">
                <span
                  id="budget-label"
                  className="flex items-center justify-between gap-3"
                >
                  Budget
                  <span className="text-xs font-normal text-white/55">
                    Optional
                  </span>
                </span>
                <BudgetSelect />
              </div>
            </div>

            <label className="block text-sm font-semibold text-white/80">
              Tell us about your project
              <textarea
                required
                name="message"
                rows={4}
                className="mt-2 w-full resize-none rounded-md border border-white/10 bg-black/35 px-3 py-2 text-white outline-none transition placeholder:text-white/55 focus:border-(--primary)"
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
                <span className="grid">
                  <span
                    className="invisible col-start-1 row-start-1"
                    aria-hidden="true"
                  >
                    {activeContent.submitLabel}
                  </span>
                  <span className="col-start-1 row-start-1">
                    {isSubmitting ? "Sending" : activeContent.submitLabel}
                  </span>
                </span>
              </button>
            </div>

            {submitError && (
              <p
                ref={errorRef}
                className="text-sm font-semibold text-red-300 outline-none"
                role="alert"
                tabIndex={-1}
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
