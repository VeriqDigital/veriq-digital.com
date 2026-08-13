"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { submitWebsiteForAudit } from "./audit-submission";
import styles from "./website-audit.module.css";

export default function AuditForm() {
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [normalizedUrl, setNormalizedUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    setNormalizedUrl("");
    setIsSubmitting(true);

    try {
      const result = await submitWebsiteForAudit(websiteUrl);

      if (!result.ok) {
        setError(result.message);
        return;
      }

      setWebsiteUrl(result.normalizedUrl);
      setNormalizedUrl(result.normalizedUrl);
      setNotice(result.message);
    } catch {
      setError("The website could not be prepared for an audit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.auditForm} onSubmit={handleSubmit} noValidate>
      <label htmlFor="audit-url">Website URL</label>
      <div className={styles.urlFieldRow}>
        <input
          id="audit-url"
          name="url"
          type="text"
          inputMode="url"
          autoCapitalize="none"
          autoComplete="url"
          autoCorrect="off"
          spellCheck={false}
          placeholder="https://yourwebsite.com"
          value={websiteUrl}
          aria-invalid={Boolean(error)}
          aria-describedby="audit-url-help audit-url-feedback"
          disabled={isSubmitting}
          onChange={(event) => {
            setWebsiteUrl(event.target.value);
            setError("");
            setNotice("");
            setNormalizedUrl("");
          }}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking URL…" : "Audit My Website"}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className={styles.formMeta}>
        <p id="audit-url-help">Free. No account required.</p>
        <p id="audit-url-feedback" aria-live="polite">
          {error ? <span className={styles.inputError}>{error}</span> : null}
          {notice ? (
            <span className={styles.inputNotice}>
              <strong>{normalizedUrl}</strong> {notice}{" "}
              <a href="#sample-audit-results">Explore the sample report.</a>
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
