import { z } from "zod";
import {
  AuditApiError,
  assertWebsiteAuditAvailable,
  assertTrustedMutationRequest,
  auditDataResponse,
  auditErrorResponse,
  enforceAuditRateLimit,
  enforceGlobalAuditRunQuota,
  logUnexpectedAuditApiError,
  readBoundedJsonRequest,
} from "@/lib/website-audit/api-security";
import { WebsiteCrawlError } from "@/lib/website-audit/crawler";
import { runWebsiteAudit } from "@/lib/website-audit/orchestrator";
import { normalizeAuditResult } from "@/lib/website-audit/result-schema";
import {
  reconcilePersistedAuditResult,
  shouldTerminallyFailAudit,
} from "@/lib/website-audit/run-lifecycle";
import {
  AuditStorageConflictError,
  isValidAuditId,
  readAuditResult,
  readAuditState,
  transitionAuditState,
  writeAuditResult,
} from "@/lib/website-audit/store";
import type { StoredAuditState } from "@/lib/website-audit/store";
import type { WebsiteAuditResult } from "@/lib/website-audit/model";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const runBodySchema = z.object({}).strict().nullable();
const auditExecutionTimeoutMs = 50_000;
const staleRunningThresholdMs = 2 * 60 * 1000;

type RouteContext = Readonly<{
  params: Promise<{ id: string }>;
}>;

const completedResponse = (
  id: string,
  result: WebsiteAuditResult,
) =>
  auditDataResponse({
    id,
    status: "completed",
    result,
  });

const readCompletedResult = async (id: string) => {
  const storedResult = await readAuditResult(id, normalizeAuditResult);

  if (!storedResult) {
    throw new AuditApiError(
      503,
      "AUDIT_RESULT_UNAVAILABLE",
      "The completed report is temporarily unavailable. Please try again later.",
      { headers: { "Retry-After": "60" } },
    );
  }

  return storedResult.result;
};

const finishFromPersistedResult = async (
  id: string,
  storedState: StoredAuditState,
) => {
  const storedResult = await readCompletedResult(id);
  const result = await reconcilePersistedAuditResult({
    result: storedResult,
    readState: async () => ({
      status: storedState.state.status,
      etag: storedState.etag,
    }),
    readPersistedResult: () => readCompletedResult(id).catch(() => null),
    transitionToCompleted: async (finalUrl, expectedEtag) => {
      await transitionAuditState(
        id,
        { status: "completed", finalUrl },
        { expectedEtag },
      );
    },
  });

  return completedResponse(id, result);
};

const handleAlreadyRunning = async (id: string, storedState: StoredAuditState) => {
  const existingResult = await readAuditResult(id, normalizeAuditResult);

  if (existingResult) {
    return finishFromPersistedResult(id, storedState);
  }

  const updatedAt = Date.parse(storedState.state.updatedAt);

  if (
    Number.isFinite(updatedAt) &&
    Date.now() - updatedAt > staleRunningThresholdMs
  ) {
    if (storedState.state.runAttempts >= 2) {
      await transitionAuditState(
        id,
        {
          status: "failed",
          failure: {
            code: "AUDIT_INTERRUPTED",
            message:
              "The audit was interrupted more than once and could not be recovered.",
            retryable: true,
          },
        },
        { expectedEtag: storedState.etag },
      ).catch((error: unknown) => {
        if (!(error instanceof AuditStorageConflictError)) throw error;
      });

      throw new AuditApiError(
        503,
        "AUDIT_INTERRUPTED",
        "The audit was interrupted more than once and could not be recovered.",
      );
    }

    try {
      await transitionAuditState(
        id,
        { status: "queued" },
        { expectedEtag: storedState.etag },
      );
    } catch (error) {
      if (!(error instanceof AuditStorageConflictError)) throw error;
    }

    return auditDataResponse(
      { id, status: "queued" },
      202,
      { "Retry-After": "1" },
    );
  }

  return auditDataResponse(
    { id, status: "running" },
    202,
    { "Retry-After": "3" },
  );
};

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  let runningState: StoredAuditState | null = null;
  let resultPersisted = false;

  try {
    assertWebsiteAuditAvailable();
    assertTrustedMutationRequest(request);

    if (!isValidAuditId(id)) {
      throw new AuditApiError(400, "INVALID_AUDIT_ID", "The report ID is invalid.");
    }

    await enforceAuditRateLimit(request, {
      scope: `run-audit:${id}`,
      limit: 8,
      windowMs: 10 * 60 * 1000,
    });

    const body = runBodySchema.safeParse(
      await readBoundedJsonRequest(request, {
        allowEmpty: true,
        maxBytes: 1_024,
      }),
    );

    if (!body.success) {
      throw new AuditApiError(
        400,
        "INVALID_REQUEST_BODY",
        "The run request body must be empty.",
      );
    }

    const stored = await readAuditState(id);

    if (!stored) {
      throw new AuditApiError(404, "AUDIT_NOT_FOUND", "The audit could not be found.");
    }

    if (stored.state.status === "completed") {
      return completedResponse(id, await readCompletedResult(id));
    }

    if (stored.state.status === "failed") {
      throw new AuditApiError(
        409,
        "AUDIT_FAILED",
        stored.state.failure?.message ?? "The audit could not be completed.",
      );
    }

    if (stored.state.status === "running") {
      return await handleAlreadyRunning(id, stored);
    }

    try {
      runningState = await transitionAuditState(
        id,
        { status: "running" },
        { expectedEtag: stored.etag },
      );
    } catch (error) {
      if (!(error instanceof AuditStorageConflictError)) {
        throw error;
      }

      const latest = await readAuditState(id);

      if (!latest) {
        throw new AuditApiError(404, "AUDIT_NOT_FOUND", "The audit could not be found.");
      }

      if (latest.state.status === "completed") {
        return completedResponse(id, await readCompletedResult(id));
      }

      if (latest.state.status === "running") {
        return await handleAlreadyRunning(id, latest);
      }

      throw error;
    }

    console.info("Website audit started", { auditId: id });

    await enforceGlobalAuditRunQuota(request);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), auditExecutionTimeoutMs);
    let result: WebsiteAuditResult;

    try {
      result = normalizeAuditResult(
        await runWebsiteAudit({
          id,
          submittedUrl:
            runningState.state.normalizedUrl ?? runningState.state.submittedUrl,
          createdAt: runningState.state.createdAt,
          signal: controller.signal,
        }),
      );
    } finally {
      clearTimeout(timeout);
    }

    if (result.id !== id || result.status !== "complete") {
      throw new Error("The audit engine returned a mismatched result.");
    }

    try {
      await writeAuditResult(id, result);
      resultPersisted = true;
    } catch (error) {
      if (!(error instanceof AuditStorageConflictError)) {
        throw error;
      }

      // An immutable-write conflict means a result already exists. From this
      // point onward, state/control-plane errors must not mark the audit failed.
      resultPersisted = true;
      result = await readCompletedResult(id);
    }

    result = await reconcilePersistedAuditResult({
      result,
      readState: async () => {
        const latest = await readAuditState(id);
        return latest
          ? { status: latest.state.status, etag: latest.etag }
          : null;
      },
      readPersistedResult: async () => {
        const persisted = await readAuditResult(id, normalizeAuditResult);
        return persisted?.result ?? null;
      },
      transitionToCompleted: async (finalUrl, expectedEtag) => {
        await transitionAuditState(
          id,
          { status: "completed", finalUrl },
          { expectedEtag },
        );
      },
    });

    console.info("Website audit completed", { auditId: id });
    return completedResponse(id, result);
  } catch (error) {
    if (runningState) {
      if (!shouldTerminallyFailAudit(resultPersisted, error)) {
        logUnexpectedAuditApiError("run-completion", error, id);
        return auditErrorResponse(
          new AuditApiError(
            503,
            "AUDIT_COMPLETION_PENDING",
            "The audit result was saved and its status is still being finalized. Please try again.",
            { headers: { "Retry-After": "3" } },
          ),
        );
      }

      const latest = await readAuditState(id).catch(() => null);

      if (latest?.state.status === "running") {
        const shouldRequeueWithoutExecution =
          error instanceof AuditApiError &&
          [
            "AUDIT_CAPACITY_REACHED",
            "AUDIT_CONTROLS_UNAVAILABLE",
          ].includes(error.code);

        if (shouldRequeueWithoutExecution) {
          await transitionAuditState(
            id,
            { status: "queued" },
            { expectedEtag: latest.etag },
          ).catch(() => undefined);
          logUnexpectedAuditApiError("run", error, id);
          return auditErrorResponse(error);
        }

        const timedOut =
          (error instanceof WebsiteCrawlError &&
            error.code === "AUDIT_TIMEOUT") ||
          error instanceof Error &&
          (error.name === "AbortError" || error.name === "TimeoutError");
        const safeCrawlFailure =
          error instanceof WebsiteCrawlError ? error : null;

        await transitionAuditState(
          id,
          {
            status: "failed",
            failure: {
              code: safeCrawlFailure?.code ??
                (timedOut ? "AUDIT_TIMEOUT" : "AUDIT_FAILED"),
              message:
                safeCrawlFailure?.message ??
                (timedOut
                  ? "The audit took too long to complete. Please try again."
                  : "The audit could not be completed. Please try again."),
              retryable:
                !safeCrawlFailure ||
                ["AUDIT_TIMEOUT", "TARGET_UNREACHABLE"].includes(
                  safeCrawlFailure.code,
                ),
            },
          },
          { expectedEtag: latest.etag },
        ).catch(() => undefined);
      }

      logUnexpectedAuditApiError("run", error, id);

      return auditErrorResponse(
        new AuditApiError(
          error instanceof WebsiteCrawlError
            ? error.code === "AUDIT_TIMEOUT"
              ? 504
              : 422
            : 503,
          error instanceof WebsiteCrawlError
            ? error.code
            : "AUDIT_UNAVAILABLE",
          error instanceof WebsiteCrawlError
            ? error.message
            : "The audit could not be completed. Please try again.",
          error instanceof WebsiteCrawlError &&
            !["AUDIT_TIMEOUT", "TARGET_UNREACHABLE"].includes(error.code)
            ? undefined
            : { headers: { "Retry-After": "60" } },
        ),
      );
    }

    logUnexpectedAuditApiError("run", error, isValidAuditId(id) ? id : undefined);
    return auditErrorResponse(error);
  }
}
