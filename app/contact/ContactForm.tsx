"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import BudgetSelect from "@/components/ui/BudgetSelect";
import { submitLead } from "@/lib/submit-lead";
import styles from "./contact.module.css";

const ContactForm = () => {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitError("");

    const formData = new FormData(event.currentTarget);
    const payload = {
      type: "contact" as const,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      topic: String(formData.get("topic") ?? ""),
      message: String(formData.get("message") ?? ""),
    };

    setIsSubmitting(true);

    const result = await submitLead(payload);

    setIsSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.message);
      return;
    }

    setHasSubmitted(true);
  };

  return (
    <section className={styles.formPanel} aria-labelledby="contact-form-title">
      <div className={styles.formHeading}>
        <div>
          <p>Start a conversation</p>
          <h2 id="contact-form-title">Tell us about your project.</h2>
        </div>
        <span aria-hidden="true">↘</span>
      </div>

      {hasSubmitted ? (
        <div className={styles.success} role="status">
          <span aria-hidden="true">✓</span>
          <p>Thanks, your message is in.</p>
          <small>We&apos;ll get back to you within one business day.</small>
          <button type="button" onClick={() => setHasSubmitted(false)}>
            Send another message
          </button>
        </div>
      ) : (
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.fieldRow}>
            <label>
              <span>Name</span>
              <input
                required
                autoComplete="name"
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

          <div className={styles.fieldRow}>
            <label>
              <span className={styles.labelLine}>
                Phone <small>Optional</small>
              </span>
              <input
                autoComplete="tel"
                name="phone"
                type="tel"
                placeholder="(555) 555-5555"
              />
            </label>
            <div className={styles.budgetField}>
              <span className={styles.labelLine} id="contact-budget-label">
                Budget <small>Optional</small>
              </span>
              <BudgetSelect labelId="contact-budget-label" />
            </div>
          </div>

          <label>
            <span>Tell us about your project</span>
            <textarea
              required
              name="message"
              rows={6}
              placeholder="What are you looking to build or improve?"
            />
          </label>

          <div className={styles.formFooter}>
            <p>
              By submitting, you&apos;re starting a conversation—not signing up
              for a mailing list.
            </p>
            <button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Sending…" : "Send message"}
              <span aria-hidden="true">↗</span>
            </button>
          </div>

          {submitError && (
            <p className={styles.formError} aria-live="polite">
              {submitError}
            </p>
          )}
        </form>
      )}
    </section>
  );
};

export default ContactForm;
