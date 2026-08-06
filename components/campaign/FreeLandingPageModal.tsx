"use client";

import { track } from "@vercel/analytics";
import type { FormEvent, KeyboardEvent } from "react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import useStableModalPosition from "@/components/ui/useStableModalPosition";
import { submitLead } from "@/lib/submit-lead";
import type { CampaignTracking } from "./HomepageCampaignCta";
import styles from "./HomepageCampaign.module.css";

type FreeLandingPageModalProps = CampaignTracking & {
  isOpen: boolean;
  onClose: () => void;
  spotCount: number;
};

const focusableSelector = [
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "a[href]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

const FreeLandingPageModal = ({
  isOpen,
  offer,
  onClose,
  page,
  source,
  spotCount,
}: FreeLandingPageModalProps) => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  useStableModalPosition(dialogRef, isOpen);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previouslyFocused = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

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
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && hasSubmitted) {
      successRef.current?.focus();
    }
  }, [hasSubmitted, isOpen]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const result = await submitLead({
      type: "free-landing-page",
      businessName: String(formData.get("businessName") ?? ""),
      email: String(formData.get("email") ?? ""),
      website: String(formData.get("website") ?? ""),
      source,
      offer,
      page,
      submittedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      track("free_offer_submission_failed", {
        offer,
        page,
        source,
        reason: result.message,
      });
      return;
    }

    setHasSubmitted(true);
    track("free_offer_submitted", { offer, page, source });
  };

  if (!isOpen) {
    return null;
  }

  return createPortal(
    <div
      className={styles.modalOverlay}
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={dialogRef}
        className={styles.modalDialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={
          hasSubmitted ? "free-offer-success-title" : "free-offer-title"
        }
        aria-describedby={
          hasSubmitted
            ? "free-offer-success-description"
            : "free-offer-description"
        }
      >
        <div className={styles.modalHeader}>
          <p className={styles.modalEyebrow}>Limited Iowa business offer</p>
          <button
            type="button"
            className={styles.modalClose}
            onClick={onClose}
            aria-label="Close free landing page form"
          >
            <span aria-hidden="true">&times;</span>
          </button>
        </div>

        {hasSubmitted ? (
          <div
            ref={successRef}
            className={styles.successState}
            role="status"
            tabIndex={-1}
          >
            <span className={styles.successMark} aria-hidden="true">
              ✓
            </span>
            <h2 id="free-offer-success-title">You’re on the list</h2>
            <p id="free-offer-success-description">
              Thanks — I’ll review your business and reach out personally by
              email.
            </p>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div className={styles.modalIntro}>
              <h2 id="free-offer-title">Reserve your free landing page</h2>
              <p id="free-offer-description">
                Share two details so I can review your business for one of the
                {` ${spotCount} available ${spotCount === 1 ? "spot" : "spots"}.`}
              </p>
            </div>

            <form
              className={styles.offerForm}
              onSubmit={handleSubmit}
              aria-busy={isSubmitting}
            >
              <label>
                <span>Business name</span>
                <input
                  ref={firstInputRef}
                  required
                  autoComplete="organization"
                  name="businessName"
                  placeholder="Your business"
                />
              </label>

              <label>
                <span>Email address</span>
                <input
                  required
                  autoComplete="email"
                  inputMode="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                />
              </label>

              <label>
                <span className={styles.labelLine}>
                  Website URL <small>Optional</small>
                </span>
                <input
                  autoCapitalize="none"
                  autoComplete="url"
                  inputMode="url"
                  name="website"
                  type="url"
                  placeholder="https://yourbusiness.com"
                  spellCheck={false}
                />
              </label>

              <button
                type="submit"
                className={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Reserving…" : "Reserve my spot"}
              </button>

              <p className={styles.reassurance}>
                No spam. I’ll personally review your business and follow up by
                email.
              </p>

              {submitError && (
                <p className={styles.formError} role="alert">
                  {submitError}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default FreeLandingPageModal;
