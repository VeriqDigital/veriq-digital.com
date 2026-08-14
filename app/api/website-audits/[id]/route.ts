import {
  AuditApiError,
  assertWebsiteAuditAvailable,
  auditDataResponse,
  auditErrorResponse,
  createReportUrl,
  logUnexpectedAuditApiError,
} from "@/lib/website-audit/api-security";
import { normalizeAuditResult } from "@/lib/website-audit/result-schema";
import {
  isValidAuditId,
  readAuditResult,
  readAuditState,
} from "@/lib/website-audit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    assertWebsiteAuditAvailable();
    if (!isValidAuditId(id)) {
      throw new AuditApiError(400, "INVALID_AUDIT_ID", "The report ID is invalid.");
    }

    const stored = await readAuditState(id);

    if (!stored) {
      throw new AuditApiError(404, "AUDIT_NOT_FOUND", "The audit could not be found.");
    }

    const publicState = {
      id: stored.state.id,
      status: stored.state.status,
      submittedUrl:
        stored.state.normalizedUrl ?? stored.state.submittedUrl,
      createdAt: stored.state.createdAt,
      updatedAt: stored.state.updatedAt,
      startedAt: stored.state.startedAt,
      completedAt: stored.state.completedAt,
      failedAt: stored.state.failedAt,
      error:
        stored.state.status === "failed" && stored.state.failure
          ? {
              code: stored.state.failure.code,
              message: stored.state.failure.message,
              retryable: stored.state.failure.retryable,
            }
          : undefined,
      reportUrl: createReportUrl(id, request),
    };

    if (stored.state.status !== "completed") {
      return auditDataResponse(publicState);
    }

    const storedResult = await readAuditResult(id, normalizeAuditResult);

    if (!storedResult) {
      throw new AuditApiError(
        503,
        "AUDIT_RESULT_UNAVAILABLE",
        "The completed report is temporarily unavailable. Please try again later.",
        { headers: { "Retry-After": "60" } },
      );
    }

    return auditDataResponse({ ...publicState, result: storedResult.result });
  } catch (error) {
    logUnexpectedAuditApiError("retrieve", error, isValidAuditId(id) ? id : undefined);
    return auditErrorResponse(error);
  }
}
