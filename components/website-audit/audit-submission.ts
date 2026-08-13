import { normalizeAuditResult } from "@/lib/website-audit/result-schema";
import type { WebsiteAuditResult } from "./types";

const auditIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const auditStatuses = ["queued", "running", "completed", "failed"] as const;

export type PersistedAuditStatus = (typeof auditStatuses)[number];

export type WebsiteAuditState = Readonly<{
  id: string;
  status: PersistedAuditStatus;
  submittedUrl: string;
  createdAt: string;
  updatedAt: string;
  result?: WebsiteAuditResult;
  error?: Readonly<{ code: string; message: string }>;
}>;

export class AuditApiError extends Error {
  readonly code: string;
  readonly status: number;

  constructor(message: string, code = "AUDIT_REQUEST_FAILED", status = 500) {
    super(message);
    this.name = "AuditApiError";
    this.code = code;
    this.status = status;
  }
}

type CreateAuditResult = Readonly<{
  id: string;
  status: "queued";
  reportUrl: string;
}>;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

const isAuditStatus = (value: unknown): value is PersistedAuditStatus =>
  typeof value === "string" &&
  (auditStatuses as readonly string[]).includes(value);

const parseJson = async (response: Response): Promise<unknown> =>
  response.json().catch(() => null);

const getApiError = (response: Response, body: unknown) => {
  const error = isRecord(body) && isRecord(body.error) ? body.error : null;
  const code = error && isNonEmptyString(error.code)
    ? error.code
    : "AUDIT_REQUEST_FAILED";
  const message = error && isNonEmptyString(error.message)
    ? error.message
    : response.status === 429
      ? "Too many audits were requested. Please wait a few minutes and try again."
      : "The audit could not be completed. Please try again.";

  return new AuditApiError(message, code, response.status);
};

const getData = async (response: Response) => {
  const body = await parseJson(response);

  if (!response.ok) {
    throw getApiError(response, body);
  }

  if (!isRecord(body) || !isRecord(body.data)) {
    throw new AuditApiError(
      "The audit service returned an unexpected response. Please try again.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  return body.data;
};

const assertAuditId = (value: unknown): string => {
  if (typeof value !== "string" || !auditIdPattern.test(value)) {
    throw new AuditApiError(
      "The audit service returned an invalid report ID. Please try again.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  return value;
};

export async function createWebsiteAudit(
  normalizedUrl: string,
  signal?: AbortSignal,
): Promise<CreateAuditResult> {
  const response = await fetch("/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: normalizedUrl }),
    cache: "no-store",
    signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new AuditApiError(
      "Could not connect to the audit service. Check your connection and try again.",
      "NETWORK_ERROR",
      0,
    );
  });
  const data = await getData(response);
  const id = assertAuditId(data.id);
  const expectedReportUrl = `/website-audit/report/${id}`;
  let returnedReportPath = "";

  if (typeof data.reportUrl === "string") {
    try {
      const reportUrl = new URL(data.reportUrl, window.location.origin);
      returnedReportPath = `${reportUrl.pathname}${reportUrl.search}${reportUrl.hash}`;
    } catch {
      returnedReportPath = "";
    }
  }

  if (data.status !== "queued" || returnedReportPath !== expectedReportUrl) {
    throw new AuditApiError(
      "The audit service returned an unexpected response. Please try again.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  return { id, status: "queued", reportUrl: expectedReportUrl };
}

export async function runWebsiteAudit(
  auditId: string,
  signal?: AbortSignal,
): Promise<WebsiteAuditResult> {
  const id = assertAuditId(auditId);
  const response = await fetch(`/api/website-audits/${id}/run`, {
    method: "POST",
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new AuditApiError(
      "The connection ended before the audit finished. Please try again.",
      "NETWORK_ERROR",
      0,
    );
  });
  const data = await getData(response);

  if (response.status === 202 && data.id === id && data.status === "running") {
    throw new AuditApiError(
      "The website audit is still running.",
      "AUDIT_STILL_RUNNING",
      202,
    );
  }

  if (data.id !== id || data.status !== "completed") {
    throw new AuditApiError(
      "The audit service returned an unexpected response. Please try again.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  try {
    const result = normalizeAuditResult(data.result);

    if (result.id !== id || result.status !== "complete") {
      throw new Error("The result does not match the requested audit.");
    }

    return result;
  } catch {
    throw new AuditApiError(
      "The completed audit could not be read. Please try again.",
      "INVALID_AUDIT_RESULT",
      502,
    );
  }
}

export async function getWebsiteAudit(
  auditId: string,
  signal?: AbortSignal,
): Promise<WebsiteAuditState> {
  const id = assertAuditId(auditId);
  const response = await fetch(`/api/website-audits/${id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
    signal,
  }).catch((error: unknown) => {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw error;
    }

    throw new AuditApiError(
      "Could not load this report. Check your connection and try again.",
      "NETWORK_ERROR",
      0,
    );
  });
  const data = await getData(response);

  if (
    assertAuditId(data.id) !== id ||
    !isAuditStatus(data.status) ||
    !isNonEmptyString(data.submittedUrl) ||
    !isNonEmptyString(data.createdAt) ||
    !isNonEmptyString(data.updatedAt) ||
    !Number.isFinite(Date.parse(data.createdAt)) ||
    !Number.isFinite(Date.parse(data.updatedAt))
  ) {
    throw new AuditApiError(
      "The report could not be read. Please try again.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  let result: WebsiteAuditResult | undefined;

  if (data.status === "completed") {
    try {
      result = normalizeAuditResult(data.result);
    } catch {
      throw new AuditApiError(
        "The completed report could not be read. Please try again.",
        "INVALID_AUDIT_RESULT",
        502,
      );
    }

    if (result.id !== id || result.status !== "complete") {
      throw new AuditApiError(
        "The completed report does not match this link.",
        "INVALID_AUDIT_RESULT",
        502,
      );
    }
  }

  const error = isRecord(data.error) &&
      isNonEmptyString(data.error.code) &&
      isNonEmptyString(data.error.message)
    ? { code: data.error.code, message: data.error.message }
    : undefined;

  if (data.status === "failed" && !error) {
    throw new AuditApiError(
      "The failed audit did not include a usable error message.",
      "INVALID_AUDIT_RESPONSE",
      502,
    );
  }

  return {
    id,
    status: data.status,
    submittedUrl: data.submittedUrl,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    result,
    error,
  };
}
