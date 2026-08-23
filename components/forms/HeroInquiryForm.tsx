"use client";

import { useEffect, useRef } from "react";
import HoneypotField from "@/components/forms/HoneypotField";
import useContactLeadForm from "@/components/forms/useContactLeadForm";
import styles from "./HeroInquiryForm.module.css";

const HeroInquiryForm = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);
  const {
    hasSubmitted,
    handleSubmit,
    isSubmitting,
    resetSubmission,
    submitError,
  } = useContactLeadForm();

  useEffect(() => {
    if (hasSubmitted) {
      successRef.current?.focus();
    }
  }, [hasSubmitted]);

  const startAnotherMessage = () => {
    resetSubmission();
    window.requestAnimationFrame(() => nameRef.current?.focus());
  };

  return (
    <section className={styles.panel} aria-labelledby="hero-inquiry-title">
      <header className={styles.header}>
        <p className={styles.eyebrow}>Let&apos;s talk</p>
        <h2 id="hero-inquiry-title">Tell us about your project</h2>
        <p>
          Share what you&apos;re building or improving. We&apos;ll reply within one
          business day.
        </p>
      </header>

      {hasSubmitted ? (
        <div
          ref={successRef}
          className={styles.success}
          role="status"
          tabIndex={-1}
        >
          <span aria-hidden="true">✓</span>
          <h3>Message received.</h3>
          <p>Thanks for reaching out. We&apos;ll be in touch shortly.</p>
          <button type="button" onClick={startAnotherMessage}>
            Send another message
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <HoneypotField />

          <div className={styles.fieldRow}>
            <label>
              <span>Name</span>
              <input
                ref={nameRef}
                required
                autoComplete="name"
                maxLength={120}
                name="name"
                placeholder="Your name"
              />
            </label>
            <label>
              <span>Email</span>
              <input
                required
                autoComplete="email"
                name="email"
                type="email"
                placeholder="you@example.com"
              />
            </label>
          </div>

          <label>
            <span>What do you need?</span>
            <select required defaultValue="" name="projectType">
              <option value="" disabled>
                Select a project type
              </option>
              <option value="Business website">Business website</option>
              <option value="Website redesign">Website redesign</option>
              <option value="Conversion or website tools">
                Conversion or website tools
              </option>
              <option value="SEO or local visibility">
                SEO or local visibility
              </option>
              <option value="Something else">Something else</option>
            </select>
          </label>

          <label>
            <span>Message</span>
            <textarea
              required
              maxLength={2000}
              name="message"
              rows={4}
              placeholder="What are you looking to build or improve?"
            />
          </label>

          <button className={styles.submit} type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending…" : "Send project inquiry"}
            <span aria-hidden="true">↗</span>
          </button>

          <p className={styles.reassurance}>
            No mailing list. Just a direct reply about your project.
          </p>

          {submitError ? (
            <p className={styles.error} role="alert">
              {submitError}
            </p>
          ) : null}
        </form>
      )}
    </section>
  );
};

export default HeroInquiryForm;
