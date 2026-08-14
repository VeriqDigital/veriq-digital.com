"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import {
  AuditApiError,
  createWebsiteAuditId,
  createWebsiteAudit,
} from "./audit-submission";
import {
  clearPendingWebsiteAudit,
  savePendingWebsiteAudit,
} from "./pending-audit";
import { normalizeWebsiteUrl } from "./url";
import styles from "./website-audit.module.css";

type AuditFormState =
  | { status: "idle" }
  | { status: "validating"; message: string }
  | { status: "submitting"; message: string }
  | { status: "completed"; message: string }
  | { status: "failed"; message: string };

const buttonLabels: Record<AuditFormState["status"], string> = {
  idle: "Audit My Website",
  validating: "Checking URL…",
  submitting: "Starting Audit…",
  completed: "Opening Report…",
  failed: "Try Audit Again",
};

export default function AuditForm() {
  const router = useRouter();
  const requestController = useRef<AbortController | null>(null);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [formState, setFormState] = useState<AuditFormState>({ status: "idle" });
  const isBusy = ["validating", "submitting", "completed"].includes(
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
    const auditId = createWebsiteAuditId();
    const reportUrl = `/website-audit/report/${auditId}`;
    savePendingWebsiteAudit({
      id: auditId,
      normalizedUrl: validation.normalizedUrl,
      createdAt: Date.now(),
    });

    try {
      const audit = await createWebsiteAudit(
        validation.normalizedUrl,
        auditId,
        controller.signal,
      );
      setFormState({
        status: "completed",
        message: "Audit created. Opening your recoverable report…",
      });
      router.push(audit.reportUrl);
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      if (error instanceof AuditApiError && error.code === "NETWORK_ERROR") {
        setFormState({
          status: "completed",
          message: "Opening your report to recover the interrupted request…",
        });
        router.push(reportUrl);
      } else {
        clearPendingWebsiteAudit(auditId);
        setFormState({
          status: "failed",
          message:
            error instanceof AuditApiError
              ? error.message
              : "The audit could not be created. Please try again.",
        });
      }
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
