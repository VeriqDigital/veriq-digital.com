"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { submitFullReportRequest } from "./report-submission";
import styles from "./website-audit.module.css";

type FullReportFormProps = {
  auditId: string;
};

export default function FullReportForm({ auditId }: FullReportFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage("");
    setIsSubmitting(true);

    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const result = await submitFullReportRequest({
        auditId,
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      });

      setMessage(result.message);
    } catch {
      setMessage("The report request could not be prepared. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.reportForm} onSubmit={handleSubmit}>
      <div className={styles.reportFields}>
        <label>
          <span>Name</span>
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Your name"
            disabled={isSubmitting}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            required
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting}
          />
        </label>
      </div>
      <div className={styles.reportFormFooter}>
        <p>
          Preview only — report delivery is not connected, and this form does
          not send or store your details yet.
        </p>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Preparing preview…" : "Send My Full Report"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      {message ? (
        <p className={styles.reportNotice} role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
