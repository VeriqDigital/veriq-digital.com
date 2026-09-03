"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AuditResults from "./AuditResults";
import {
  AuditApiError,
  createWebsiteAudit,
} from "./audit-submission";
import type { WebsiteAuditState } from "./audit-submission";
import {
  clearPendingWebsiteAudit,
  readPendingWebsiteAudit,
} from "./pending-audit";
import { advanceWebsiteAuditReport } from "./report-controller";
import ShareReportLink from "./ShareReportLink";
import styles from "./website-audit.module.css";

type ReportViewProps = {
  auditId: string;
  initialAudit?: WebsiteAuditState | null;
};

type ReportViewState =
  | { status: "loading" }
  | { status: "ready"; audit: WebsiteAuditState }
  | { status: "not-found" }
  | { status: "error"; message: string };

const pollDelayMs = 2500;

const getDisplayUrl = (value: string) => {
  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return "Submitted website";
  }
};

const getStatusCopy = (audit: WebsiteAuditState) => {
  if (audit.status === "queued") {
    return {
      title: "Your audit is queued.",
      description:
        "The audit will begin as soon as the service is ready. This page updates automatically.",
    };
  }

  return {
    title: "Analyzing your website…",
    description:
      "Veriq is checking the page, its technical signals, and available mobile performance data. This page updates automatically.",
  };
};

export default function ReportView({ auditId, initialAudit }: ReportViewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewState, setViewState] = useState<ReportViewState>(() =>
    initialAudit
      ? { status: "ready", audit: initialAudit }
      : { status: "loading" },
  );

  const retry = useCallback(() => {
    setViewState({ status: "loading" });
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    if (
      refreshKey === 0 &&
      (initialAudit?.status === "failed" ||
        (initialAudit?.status === "completed" && initialAudit.result))
    ) {
      return;
    }

    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isActive = true;
    let attemptedCreationRecovery = false;

    const loadReport = async () => {
      try {
        const audit = await advanceWebsiteAuditReport(
          auditId,
          controller.signal,
        );
        clearPendingWebsiteAudit(auditId);

        if (!isActive) {
          return;
        }

        setViewState({ status: "ready", audit });

        if (audit.status === "queued" || audit.status === "running") {
          timer = setTimeout(loadReport, pollDelayMs);
        }
      } catch (error) {
        if (
          !isActive ||
          (error instanceof DOMException && error.name === "AbortError")
        ) {
          return;
        }

        if (
          error instanceof AuditApiError &&
          error.status === 404 &&
          !attemptedCreationRecovery
        ) {
          const pending = readPendingWebsiteAudit(auditId);

          if (pending) {
            attemptedCreationRecovery = true;

            try {
              await createWebsiteAudit(
                pending.normalizedUrl,
                pending.id,
                controller.signal,
              );
              await loadReport();
              return;
            } catch (recoveryError) {
              if (
                recoveryError instanceof DOMException &&
                recoveryError.name === "AbortError"
              ) {
                return;
              }

              setViewState({
                status: "error",
                message:
                  recoveryError instanceof AuditApiError
                    ? `Your report ID was preserved, but recovery is waiting on the audit service: ${recoveryError.message}`
                    : "Your report ID was preserved, but the interrupted audit could not be recovered yet.",
              });
              return;
            }
          }

          setViewState({ status: "not-found" });
          return;
        }

        setViewState({
          status: "error",
          message:
            error instanceof AuditApiError
              ? error.message
              : "This report is temporarily unavailable. Please try again.",
        });
      }
    };

    void loadReport();

    return () => {
      isActive = false;
      controller.abort();

      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [auditId, initialAudit, refreshKey]);

  if (viewState.status === "loading") {
    return (
      <ReportStatusLayout
        eyebrow="Website audit report"
        title="Loading your report…"
        description="Retrieving the latest audit status."
        isBusy
      />
    );
  }

  if (viewState.status === "not-found") {
    return (
      <ReportStatusLayout
        eyebrow="Report not found"
        title="This audit report is not available."
        description="The link may be incomplete, expired, or no longer available. Start a new audit to create another report."
      >
        <Link href="/website-audit" className={styles.reportPrimaryAction}>
          Start a new audit
          <span aria-hidden="true">↗</span>
        </Link>
      </ReportStatusLayout>
    );
  }

  if (viewState.status === "error") {
    return (
      <ReportStatusLayout
        eyebrow="Report unavailable"
        title="We couldn’t load this report."
        description={viewState.message}
      >
        <button type="button" className={styles.reportPrimaryAction} onClick={retry}>
          Try again
        </button>
      </ReportStatusLayout>
    );
  }

  const { audit } = viewState;

  if (audit.status === "queued" || audit.status === "running") {
    const statusCopy = getStatusCopy(audit);

    return (
      <ReportStatusLayout
        eyebrow="Website audit in progress"
        title={statusCopy.title}
        description={statusCopy.description}
        submittedUrl={audit.submittedUrl}
        isBusy
      />
    );
  }

  if (audit.status === "failed") {
    return (
      <ReportStatusLayout
        eyebrow="Audit incomplete"
        title="The audit could not be completed."
        description={
          audit.error?.message ??
          "The website could not be analyzed this time. Please start a new audit and try again."
        }
        submittedUrl={audit.submittedUrl}
      >
        <Link href="/website-audit" className={styles.reportPrimaryAction}>
          Try another audit
          <span aria-hidden="true">↗</span>
        </Link>
      </ReportStatusLayout>
    );
  }

  if (!audit.result) {
    return (
      <ReportStatusLayout
        eyebrow="Report unavailable"
        title="The completed report could not be read."
        description="Please try loading this report again."
      >
        <button type="button" className={styles.reportPrimaryAction} onClick={retry}>
          Try again
        </button>
      </ReportStatusLayout>
    );
  }

  return (
    <>
      <section className={styles.reportHero} aria-labelledby="report-title">
        <Container>
          <div className={styles.reportHeroInner}>
            <div>
              <p className={styles.reportEyebrow}>Completed website audit</p>
              <h1 id="report-title">Your website audit report.</h1>
              <p className={styles.reportUrl}>{getDisplayUrl(audit.result.auditedUrl)}</p>
            </div>
            <ShareReportLink />
          </div>
        </Container>
      </section>
      <section className={styles.resultsSection} aria-label="Website audit results">
        <Container>
          <AuditResults result={audit.result} variant="live" />
        </Container>
      </section>
    </>
  );
}

type ReportStatusLayoutProps = {
  eyebrow: string;
  title: string;
  description: string;
  submittedUrl?: string;
  isBusy?: boolean;
  children?: React.ReactNode;
};

function ReportStatusLayout({
  eyebrow,
  title,
  description,
  submittedUrl,
  isBusy = false,
  children,
}: ReportStatusLayoutProps) {
  return (
    <section className={styles.reportHero} aria-labelledby="report-title">
      <Container>
        <div
          className={styles.reportStatus}
          role="status"
          aria-live="polite"
          aria-busy={isBusy}
        >
          <p className={styles.reportEyebrow}>{eyebrow}</p>
          <h1 id="report-title">{title}</h1>
          {submittedUrl ? (
            <p className={styles.reportUrl}>{getDisplayUrl(submittedUrl)}</p>
          ) : null}
          <p className={styles.reportStatusDescription}>{description}</p>
          {children ? <div className={styles.reportStatusActions}>{children}</div> : null}
        </div>
      </Container>
    </section>
  );
}
