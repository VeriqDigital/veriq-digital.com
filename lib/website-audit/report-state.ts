import type { WebsiteAuditState } from "@/components/website-audit/audit-submission";
import { normalizeAuditResult } from "./result-schema";
import { readAuditResult, readAuditState } from "./store";
import type { StoredAuditResult, StoredAuditState } from "./store-types";
import type { WebsiteAuditResult } from "./model";

export type ReportStateReader = Readonly<{
  readState(auditId: string): Promise<StoredAuditState | null>;
  readResult(
    auditId: string,
  ): Promise<StoredAuditResult<WebsiteAuditResult> | null>;
}>;

const defaultReader: ReportStateReader = {
  readState: readAuditState,
  readResult: (auditId) =>
    readAuditResult(auditId, normalizeAuditResult),
};

export const readInitialWebsiteAuditState = async (
  auditId: string,
  reader: ReportStateReader = defaultReader,
): Promise<WebsiteAuditState | null> => {
  const stored = await reader.readState(auditId);

  if (!stored) {
    return null;
  }

  const audit: WebsiteAuditState = {
    id: stored.state.id,
    status: stored.state.status,
    submittedUrl:
      stored.state.normalizedUrl ?? stored.state.submittedUrl,
    createdAt: stored.state.createdAt,
    updatedAt: stored.state.updatedAt,
    error:
      stored.state.status === "failed" && stored.state.failure
        ? {
            code: stored.state.failure.code,
            message: stored.state.failure.message,
          }
        : undefined,
  };

  if (stored.state.status !== "completed") {
    return audit;
  }

  const storedResult = await reader.readResult(auditId);

  return storedResult
    ? { ...audit, result: storedResult.result }
    : audit;
};
