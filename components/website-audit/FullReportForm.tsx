"use client";

import Link from "next/link";
import { useState } from "react";
import type { FormEvent } from "react";
import { submitFullReportRequest } from "./report-submission";
import styles from "./website-audit.module.css";

type FullReportFormProps = {
  auditId: string;
};

type ReportFormState =
  | { status: "idle"; message: "" }
  | { status: "submitting"; message: "" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

export default function FullReportForm({ auditId }: FullReportFormProps) {
  const [formState, setFormState] = useState<ReportFormState>({
    status: "idle",
    message: "",
  });
  const isSubmitting = formState.status === "submitting";
  const isComplete = formState.status === "success";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting || isComplete) {
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    setFormState({ status: "submitting", message: "" });
    const result = await submitFullReportRequest({
      auditId,
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      website: String(formData.get("website") ?? ""),
    });

    if (!result.ok) {
      setFormState({ status: "error", message: result.message });
      return;
    }

    form.reset();
    setFormState({ status: "success", message: result.message });
  };

  return (
    <form
      className={styles.reportForm}
      onSubmit={handleSubmit}
      aria-busy={isSubmitting}
    >
      <div className={styles.reportHoneypot} aria-hidden="true">
        <label>
          Leave this field empty
          <input
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            disabled={isSubmitting || isComplete}
          />
        </label>
      </div>
      <div className={styles.reportFields}>
        <label>
          <span>Name</span>
          <input
            required
            name="name"
            autoComplete="name"
            placeholder="Your name"
            disabled={isSubmitting || isComplete}
            maxLength={120}
            aria-describedby={`${auditId}-report-privacy`}
          />
        </label>
        <label>
          <span>Email</span>
          <input
            required
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            disabled={isSubmitting || isComplete}
            maxLength={254}
            aria-describedby={`${auditId}-report-privacy`}
          />
        </label>
      </div>
      <div className={styles.reportFormFooter}>
        <p id={`${auditId}-report-privacy`}>
          We use your name and email only to send this report. We retain a
          pseudonymous delivery receipt, not the raw values. No mailing list. See
          our <Link href="/privacy">privacy policy</Link>.
        </p>
        <button type="submit" disabled={isSubmitting || isComplete}>
          {isComplete
            ? "Report Sent"
            : isSubmitting
              ? "Sending Report…"
              : "Email My Report"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      {formState.message ? (
        <p
          className={styles.reportNotice}
          data-state={formState.status}
          role={formState.status === "error" ? "alert" : "status"}
        >
          {formState.message}
        </p>
      ) : null}
    </form>
  );
}
