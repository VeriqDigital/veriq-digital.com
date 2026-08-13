"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  AuditApiError,
  createWebsiteAudit,
  runWebsiteAudit,
} from "./audit-submission";
import { normalizeWebsiteUrl } from "./url";
import styles from "./website-audit.module.css";

type AuditFormState =
  | { status: "idle" }
  | { status: "validating"; message: string }
  | { status: "submitting"; message: string }
  | { status: "analyzing"; message: string }
  | { status: "completed"; message: string }
  | { status: "failed"; message: string };

const buttonLabels: Record<AuditFormState["status"], string> = {
  idle: "Audit My Website",
  validating: "Checking URL…",
  submitting: "Starting Audit…",
  analyzing: "Analyzing Website…",
  completed: "Opening Report…",
  failed: "Try Audit Again",
};

export default function AuditForm() {
  const router = useRouter();
  const requestController = useRef<AbortController | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [formState, setFormState] = useState<AuditFormState>({ status: "idle" });
  const isBusy = ["validating", "submitting", "analyzing", "completed"].includes(
    formState.status,
  );

  useEffect(
    () => () => {
      requestController.current?.abort();
    },
    [],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setFormState({ status: "validating", message: "Checking the website address…" });
    const validation = normalizeWebsiteUrl(websiteUrl);

    if (!validation.ok) {
      setFormState({ status: "failed", message: validation.message });
      return;
    }

    setWebsiteUrl(validation.normalizedUrl);
    setFormState({
      status: "submitting",
      message: "Starting a new website audit…",
    });
    const controller = new AbortController();
    requestController.current = controller;

    try {
      const audit = await createWebsiteAudit(
        validation.normalizedUrl,
        controller.signal,
      );
      setFormState({
        status: "analyzing",
        message:
          "Analyzing your website. Performance data can take a little longer to return…",
      });
      await runWebsiteAudit(audit.id, controller.signal);
      setFormState({
        status: "completed",
        message: "Audit complete. Opening your report…",
      });
      router.push(audit.reportUrl);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      setFormState({
        status: "failed",
        message:
          error instanceof AuditApiError
            ? error.message
            : "The audit could not be completed. Please try again.",
      });
    } finally {
      requestController.current = null;
    }
  };

  return (
    <form
      className={styles.auditForm}
      onSubmit={handleSubmit}
      noValidate
      aria-busy={isBusy}
    >
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
          aria-invalid={formState.status === "failed"}
          aria-describedby="audit-url-help audit-url-feedback"
          disabled={isBusy}
          maxLength={2048}
          onChange={(event) => {
            setWebsiteUrl(event.target.value);

            if (formState.status !== "idle") {
              setFormState({ status: "idle" });
            }
          }}
        />
        <button type="submit" disabled={isBusy}>
          {buttonLabels[formState.status]}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <div className={styles.formMeta}>
        <p id="audit-url-help">Free. No account required.</p>
        <p
          id="audit-url-feedback"
          aria-live={formState.status === "failed" ? "assertive" : "polite"}
          aria-atomic="true"
        >
          {formState.status !== "idle" ? (
            <span
              className={
                formState.status === "failed"
                  ? styles.inputError
                  : styles.inputNotice
              }
            >
              {formState.message}
            </span>
          ) : null}
        </p>
      </div>
    </form>
  );
}
