"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import Container from "@/components/ui/Container";
import AuditResults from "./AuditResults";
import {
  AuditApiError,
  getWebsiteAudit,
  runWebsiteAudit,
} from "./audit-submission";
import type { WebsiteAuditState } from "./audit-submission";
import ShareReportLink from "./ShareReportLink";
import styles from "./website-audit.module.css";

type ReportViewProps = {
  auditId: string;
};

type ReportViewState =
  | { status: "loading" }
  | { status: "ready"; audit: WebsiteAuditState }
  | { status: "not-found" }
  | { status: "error"; message: string };

const pollDelayMs = 2500;
const staleRunRecoveryMs = 2 * 60 * 1000;

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

export default function ReportView({ auditId }: ReportViewProps) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewState, setViewState] = useState<ReportViewState>({
    status: "loading",
  });

  const retry = useCallback(() => {
    setViewState({ status: "loading" });
    setRefreshKey((value) => value + 1);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    let isActive = true;

    const loadReport = async () => {
      try {
        let audit = await getWebsiteAudit(auditId, controller.signal);

        // Recover a share link that was opened after creation but before the
        // originating tab could claim the request-bound audit job.
        const runningAgeMs =
          audit.status === "running"
            ? Date.now() - Date.parse(audit.updatedAt)
            : 0;
        const shouldClaimRun =
          audit.status === "queued" ||
          (audit.status === "running" &&
            Number.isFinite(runningAgeMs) &&
            runningAgeMs > staleRunRecoveryMs);

        if (shouldClaimRun) {
          const statusBeforeRun = audit.status;

          try {
            const result = await runWebsiteAudit(auditId, controller.signal);
            audit = await getWebsiteAudit(auditId, controller.signal);

            if (!audit.result && audit.status === "completed") {
              audit = { ...audit, result };
            }
          } catch (error) {
            if (!(error instanceof AuditApiError)) {
              throw error;
            }

            try {
              audit = await getWebsiteAudit(auditId, controller.signal);
            } catch {
              throw error;
            }

            if (
              audit.status === statusBeforeRun &&
              ![
                "AUDIT_STATE_CONFLICT",
                "INVALID_AUDIT_RESPONSE",
                "AUDIT_INTERRUPTED",
                "AUDIT_STILL_RUNNING",
              ].includes(error.code)
            ) {
              throw error;
            }
          }
        }

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

        if (error instanceof AuditApiError && error.status === 404) {
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
  }, [auditId, refreshKey]);

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
