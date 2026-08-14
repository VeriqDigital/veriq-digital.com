import {
  AuditApiError,
  getWebsiteAudit,
  runWebsiteAudit,
} from "./audit-submission";
import type { WebsiteAuditState } from "./audit-submission";
import type { WebsiteAuditResult } from "./types";

const staleRunRecoveryMs = 2 * 60 * 1_000;

export type ReportControllerDependencies = Readonly<{
  getAudit: (
    auditId: string,
    signal?: AbortSignal,
  ) => Promise<WebsiteAuditState>;
  runAudit: (
    auditId: string,
    signal?: AbortSignal,
  ) => Promise<WebsiteAuditResult | null>;
  now: () => number;
}>;

const defaultDependencies: ReportControllerDependencies = {
  getAudit: getWebsiteAudit,
  runAudit: runWebsiteAudit,
  now: Date.now,
};

export async function advanceWebsiteAuditReport(
  auditId: string,
  signal?: AbortSignal,
  dependencies: ReportControllerDependencies = defaultDependencies,
): Promise<WebsiteAuditState> {
  let audit = await dependencies.getAudit(auditId, signal);
  const runningAgeMs =
    audit.status === "running"
      ? dependencies.now() - Date.parse(audit.updatedAt)
      : 0;
  const shouldClaimRun =
    audit.status === "queued" ||
    (audit.status === "running" &&
      Number.isFinite(runningAgeMs) &&
      runningAgeMs > staleRunRecoveryMs);

  if (!shouldClaimRun) {
    return audit;
  }

  const statusBeforeRun = audit.status;

  try {
    const result = await dependencies.runAudit(auditId, signal);
    audit = await dependencies.getAudit(auditId, signal);

    if (result && !audit.result && audit.status === "completed") {
      audit = { ...audit, result };
    }
  } catch (error) {
    if (!(error instanceof AuditApiError)) {
      throw error;
    }

    try {
      audit = await dependencies.getAudit(auditId, signal);
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
        "NETWORK_ERROR",
      ].includes(error.code)
    ) {
      throw error;
    }
  }

  return audit;
}
