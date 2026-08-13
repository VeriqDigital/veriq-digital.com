import { createHash } from "node:crypto";
import { siteConfig } from "@/config/site";
import {
  AuditStateNotFoundError,
  AuditStateTransitionError,
  AuditStorageConflictError,
  AuditStorageUnavailableError,
  AuditStorageValidationError,
  InvalidAuditIdError,
} from "./store";
import {
  PublicHostResolutionError,
  PublicUrlError,
} from "./security";

const apiResponseHeaders = {
  "Cache-Control": "private, no-store, max-age=0, must-revalidate",
  "Content-Security-Policy": "default-src 'none'; frame-ancestors 'none'",
  "Cross-Origin-Resource-Policy": "same-origin",
  Expires: "0",
  Pragma: "no-cache",
  "Referrer-Policy": "no-referrer",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
} as const;

type AuditApiErrorOptions = Readonly<{
  headers?: HeadersInit;
}>;

export class AuditApiError extends Error {
  readonly code: string;
  readonly status: number;
  readonly headers?: HeadersInit;

  constructor(
    status: number,
    code: string,
    message: string,
    options: AuditApiErrorOptions = {},
  ) {
    super(message);
    this.name = "AuditApiError";
    this.status = status;
    this.code = code;
    this.headers = options.headers;
  }
}

export function auditDataResponse(
  data: unknown,
  status = 200,
  headers?: HeadersInit,
): Response {
  return Response.json(
    { data },
    {
      status,
      headers: {
        ...apiResponseHeaders,
        ...Object.fromEntries(new Headers(headers)),
      },
    },
  );
}

export function auditErrorResponse(error: unknown): Response {
  const apiError = toAuditApiError(error);

  return Response.json(
    {
      error: {
        code: apiError.code,
        message: apiError.message,
      },
    },
    {
      status: apiError.status,
      headers: {
        ...apiResponseHeaders,
        ...Object.fromEntries(new Headers(apiError.headers)),
      },
    },
  );
}

export function toAuditApiError(error: unknown): AuditApiError {
  if (error instanceof AuditApiError) {
    return error;
  }

  if (error instanceof InvalidAuditIdError) {
    return new AuditApiError(400, "INVALID_AUDIT_ID", "The report ID is invalid.");
  }

  if (error instanceof AuditStateNotFoundError) {
    return new AuditApiError(404, "AUDIT_NOT_FOUND", "The audit could not be found.");
  }

  if (
    error instanceof AuditStorageConflictError ||
    error instanceof AuditStateTransitionError
  ) {
    return new AuditApiError(
      409,
      "AUDIT_STATE_CONFLICT",
      "The audit state changed. Check the report status and try again if needed.",
    );
  }

  if (
    error instanceof AuditStorageUnavailableError ||
    error instanceof AuditStorageValidationError
  ) {
    return new AuditApiError(
      503,
      "AUDIT_STORAGE_UNAVAILABLE",
      "Website audits are temporarily unavailable. Please try again later.",
      { headers: { "Retry-After": "60" } },
    );
  }

  if (error instanceof PublicUrlError) {
    return new AuditApiError(400, error.code, error.message);
  }

  if (error instanceof PublicHostResolutionError) {
    return new AuditApiError(
      400,
      "UNREACHABLE_WEBSITE",
      "The website must resolve to a public internet address.",
    );
  }

  return new AuditApiError(
    500,
    "INTERNAL_ERROR",
    "The request could not be completed. Please try again.",
  );
}

export function logUnexpectedAuditApiError(
  operation: string,
  error: unknown,
  auditId?: string,
): void {
  const normalized = toAuditApiError(error);

  if (normalized.status < 500) {
    return;
  }

  const originalCode =
    error instanceof Error && "code" in error && typeof error.code === "string"
      ? error.code
      : undefined;

  // Never include submitted URLs, request bodies, email addresses, or provider
  // responses in this log metadata.
  console.error("Website audit API failure", {
    operation,
    auditId,
    errorName: error instanceof Error ? error.name : "UnknownError",
    code: originalCode ?? normalized.code,
  });
}

export function assertTrustedMutationRequest(request: Request): void {
  const fetchSite = request.headers.get("sec-fetch-site")?.toLowerCase();

  if (fetchSite === "cross-site") {
    throw new AuditApiError(
      403,
      "UNTRUSTED_REQUEST",
      "This request could not be accepted.",
    );
  }

  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    if (process.env.NODE_ENV === "production") {
      throw new AuditApiError(
        403,
        "UNTRUSTED_REQUEST",
        "This request could not be accepted.",
      );
    }

    return;
  }

  try {
    const origin = new URL(originHeader).origin;
    const requestUrl = new URL(request.url);
    const requestOrigin = requestUrl.origin;
    const canonicalOrigin = new URL(siteConfig.url).origin;
    const hostHeader = request.headers.get("host")?.trim();
    const hostOrigin =
      hostHeader && !/[\s,\\]/.test(hostHeader)
        ? new URL(`${requestUrl.protocol}//${hostHeader}`).origin
        : null;

    if (
      origin === requestOrigin ||
      origin === canonicalOrigin ||
      origin === hostOrigin
    ) {
      return;
    }
  } catch {
    // Fall through to the same sanitized rejection.
  }

  throw new AuditApiError(
    403,
    "UNTRUSTED_REQUEST",
    "This request could not be accepted.",
  );
}

type ReadJsonOptions = Readonly<{
  allowEmpty?: boolean;
  maxBytes: number;
}>;

export async function readBoundedJsonRequest(
  request: Request,
  options: ReadJsonOptions,
): Promise<unknown> {
  const declaredLength = Number(request.headers.get("content-length") ?? 0);

  if (
    Number.isFinite(declaredLength) &&
    declaredLength > options.maxBytes
  ) {
    throw new AuditApiError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  }

  const rawBody = await request.text().catch(() => {
    throw new AuditApiError(
      400,
      "INVALID_REQUEST_BODY",
      "The request body could not be read.",
    );
  });

  if (new TextEncoder().encode(rawBody).byteLength > options.maxBytes) {
    throw new AuditApiError(413, "REQUEST_TOO_LARGE", "The request is too large.");
  }

  if (!rawBody.trim()) {
    if (options.allowEmpty) {
      return null;
    }

    throw new AuditApiError(
      400,
      "INVALID_REQUEST_BODY",
      "A JSON request body is required.",
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    throw new AuditApiError(
      415,
      "UNSUPPORTED_MEDIA_TYPE",
      "The request must use application/json.",
    );
  }

  try {
    return JSON.parse(rawBody) as unknown;
  } catch {
    throw new AuditApiError(
      400,
      "INVALID_REQUEST_BODY",
      "The JSON request body is invalid.",
    );
  }
}

type RateLimitOptions = Readonly<{
  limit: number;
  scope: string;
  windowMs: number;
}>;

const recentRequestsByClient = new Map<string, number[]>();
const maximumTrackedClients = 2_000;

const getHashedClientIdentifier = (request: Request, scope: string) => {
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  const clientAddress =
    forwardedAddress || request.headers.get("x-real-ip")?.trim() || "unknown";

  return createHash("sha256")
    .update(`${scope}\0${clientAddress}`)
    .digest("hex");
};

/**
 * Best-effort serverless burst protection. The hash avoids retaining raw IPs,
 * but the map is per process and forwarded headers are trusted only as far as
 * the hosting proxy guarantees them. A platform-level distributed rule is
 * still recommended for sustained production abuse.
 */
export function enforceAuditRateLimit(
  request: Request,
  options: RateLimitOptions,
  now = Date.now(),
): void {
  if (
    !Number.isSafeInteger(options.limit) ||
    options.limit <= 0 ||
    !Number.isSafeInteger(options.windowMs) ||
    options.windowMs <= 0
  ) {
    throw new RangeError("Rate-limit values must be positive integers.");
  }

  const key = getHashedClientIdentifier(request, options.scope);
  const windowStart = now - options.windowMs;

  if (
    !recentRequestsByClient.has(key) &&
    recentRequestsByClient.size >= maximumTrackedClients
  ) {
    for (const [identifier, timestamps] of recentRequestsByClient) {
      if (timestamps.every((timestamp) => timestamp <= windowStart)) {
        recentRequestsByClient.delete(identifier);
      }
    }

    while (recentRequestsByClient.size >= maximumTrackedClients) {
      const oldestIdentifier = recentRequestsByClient.keys().next().value;

      if (typeof oldestIdentifier !== "string") break;
      recentRequestsByClient.delete(oldestIdentifier);
    }
  }

  const recentRequests = (recentRequestsByClient.get(key) ?? []).filter(
    (timestamp) => timestamp > windowStart,
  );

  if (recentRequests.length >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((recentRequests[0] + options.windowMs - now) / 1000),
    );
    recentRequestsByClient.set(key, recentRequests);

    throw new AuditApiError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please wait and try again.",
      { headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  recentRequests.push(now);
  recentRequestsByClient.set(key, recentRequests);
}

export function createReportUrl(auditId: string, request?: Request): string {
  const baseUrl =
    process.env.NODE_ENV === "production" || !request
      ? siteConfig.url
      : new URL(request.url).origin;

  return new URL(`/website-audit/report/${auditId}`, baseUrl).toString();
}

export function createReportEmailIdempotencyKey(
  auditId: string,
  email: string,
): string {
  const recipientHash = createHash("sha256")
    .update(email.trim().toLowerCase())
    .digest("hex");

  return `website-audit/${auditId}/${recipientHash}`;
}

export function resetAuditRateLimitsForTesting(): void {
  recentRequestsByClient.clear();
}
