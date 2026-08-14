import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { siteConfig } from "@/config/site";
import {
  consumeDistributedLimit,
  DistributedLimitUnavailableError,
} from "./distributed-rate-limit";
import { getWebsiteAuditRuntimeConfig } from "./runtime-config";
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

  if (!request.body) {
    if (options.allowEmpty) return null;

    throw new AuditApiError(
      400,
      "INVALID_REQUEST_BODY",
      "A JSON request body is required.",
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";
  const isJsonContent = contentType.startsWith("application/json");

  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let receivedBytes = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      receivedBytes += value.byteLength;
      if (receivedBytes > options.maxBytes) {
        await reader.cancel().catch(() => undefined);
        throw new AuditApiError(
          413,
          "REQUEST_TOO_LARGE",
          "The request is too large.",
        );
      }

      if (!isJsonContent && value.byteLength > 0) {
        await reader.cancel().catch(() => undefined);
        throw new AuditApiError(
          415,
          "UNSUPPORTED_MEDIA_TYPE",
          "The request must use application/json.",
        );
      }

      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof AuditApiError) throw error;

    throw new AuditApiError(
      400,
      "INVALID_REQUEST_BODY",
      "The request body could not be read.",
    );
  } finally {
    reader.releaseLock();
  }

  const encodedBody = new Uint8Array(receivedBytes);
  let offset = 0;

  for (const chunk of chunks) {
    encodedBody.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const rawBody = new TextDecoder().decode(encodedBody);

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
  global?: boolean;
  capacityMessage?: string;
}>;

type LocalRateLimitBucket = {
  count: number;
  expiresAt: number;
};

export const auditCreationRateLimit = Object.freeze({
  limit: 5,
  windowMs: 15 * 60 * 1_000,
});

const recentRequestsByClient = new Map<string, LocalRateLimitBucket>();
const maximumTrackedClients = 2_000;

const getClientAddress = (request: Request) => {
  const forwardedAddress = request.headers
    .get("x-forwarded-for")
    ?.split(",")[0]
    ?.trim();
  return forwardedAddress || request.headers.get("x-real-ip")?.trim() || "unknown";
};

const getHashedClientIdentifier = (request: Request, scope: string) => {
  const clientAddress = getClientAddress(request);

  return createHash("sha256")
    .update(`${scope}\0${clientAddress}`)
    .digest("hex");
};

/**
 * Supplemental serverless burst protection. The hash avoids retaining raw
 * IPs, but this map is intentionally not the production enforcement boundary;
 * every production call also consumes the atomic Redis-backed limit below.
 */
const enforceLocalAuditRateLimit = (
  request: Request,
  options: RateLimitOptions,
  now = Date.now(),
) => {
  if (
    !Number.isSafeInteger(options.limit) ||
    options.limit <= 0 ||
    !Number.isSafeInteger(options.windowMs) ||
    options.windowMs <= 0
  ) {
    throw new RangeError("Rate-limit values must be positive integers.");
  }

  const key = getHashedClientIdentifier(request, options.scope);

  if (
    !recentRequestsByClient.has(key) &&
    recentRequestsByClient.size >= maximumTrackedClients
  ) {
    for (const [identifier, bucket] of recentRequestsByClient) {
      if (bucket.expiresAt <= now) {
        recentRequestsByClient.delete(identifier);
      }
    }

    while (recentRequestsByClient.size >= maximumTrackedClients) {
      const oldestIdentifier = recentRequestsByClient.keys().next().value;

      if (typeof oldestIdentifier !== "string") break;
      recentRequestsByClient.delete(oldestIdentifier);
    }
  }

  const existingBucket = recentRequestsByClient.get(key);
  const bucket =
    existingBucket && existingBucket.expiresAt > now
      ? existingBucket
      : { count: 0, expiresAt: now + options.windowMs };

  if (bucket.count >= options.limit) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.expiresAt - now) / 1000),
    );
    recentRequestsByClient.set(key, bucket);

    throw new AuditApiError(
      429,
      "RATE_LIMITED",
      "Too many requests. Please wait and try again.",
      { headers: { "Retry-After": String(retryAfterSeconds) } },
    );
  }

  bucket.count += 1;
  recentRequestsByClient.set(key, bucket);
};

export async function enforceAuditRateLimit(
  request: Request,
  options: RateLimitOptions,
  now = Date.now(),
): Promise<void> {
  enforceLocalAuditRateLimit(request, options, now);
  const config = getWebsiteAuditRuntimeConfig();

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!config.redisUrl || !config.redisToken || !config.hashSecret) {
    throw new AuditApiError(
      503,
      "AUDIT_CONTROLS_UNAVAILABLE",
      "Website audits are temporarily unavailable because abuse controls are not configured.",
      { headers: { "Retry-After": "300" } },
    );
  }

  const subject = options.global ? "global" : getClientAddress(request);
  const identifier = createHmac("sha256", config.hashSecret)
    .update(`${options.scope}\0${subject}`)
    .digest("hex");

  try {
    const result = await consumeDistributedLimit({
      key: `website-audit:${options.scope}:${identifier}`,
      windowMs: options.windowMs,
      redisUrl: config.redisUrl,
      redisToken: config.redisToken,
    });

    if (result.count > options.limit) {
      throw new AuditApiError(
        options.global ? 503 : 429,
        options.global ? "AUDIT_CAPACITY_REACHED" : "RATE_LIMITED",
        options.capacityMessage ??
          (options.global
            ? "Website audit capacity has been reached. Please try again later."
            : "Too many requests. Please wait and try again."),
        { headers: { "Retry-After": String(result.retryAfterSeconds) } },
      );
    }
  } catch (error) {
    if (error instanceof AuditApiError) {
      throw error;
    }

    if (error instanceof DistributedLimitUnavailableError) {
      throw new AuditApiError(
        503,
        "AUDIT_CONTROLS_UNAVAILABLE",
        "Website audits are temporarily unavailable because abuse controls could not be verified.",
        { headers: { "Retry-After": "60" } },
      );
    }

    throw error;
  }
}

export async function enforceGlobalAuditRunQuota(request: Request): Promise<void> {
  const limit = getWebsiteAuditRuntimeConfig().dailyRunLimit;

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!limit) {
    throw new AuditApiError(
      503,
      "AUDIT_CONTROLS_UNAVAILABLE",
      "Website audits are temporarily unavailable because the outbound quota is not configured.",
    );
  }

  await enforceAuditRateLimit(request, {
    scope: "outbound-daily",
    limit,
    windowMs: 24 * 60 * 60 * 1_000,
    global: true,
    capacityMessage:
      "Today’s website audit capacity has been reached. Please try again tomorrow.",
  });
}

export async function enforceGlobalReportEmailQuota(
  request: Request,
): Promise<void> {
  const limit = getWebsiteAuditRuntimeConfig().dailyEmailLimit;

  if (process.env.NODE_ENV !== "production") {
    return;
  }

  if (!limit) {
    throw new AuditApiError(
      503,
      "AUDIT_CONTROLS_UNAVAILABLE",
      "Report delivery is temporarily unavailable because the email quota is not configured.",
    );
  }

  await enforceAuditRateLimit(request, {
    scope: "report-email-daily",
    limit,
    windowMs: 24 * 60 * 60 * 1_000,
    global: true,
    capacityMessage:
      "Today’s report-email capacity has been reached. Your report link still works.",
  });
}

export function assertWebsiteAuditAvailable(): void {
  const config = getWebsiteAuditRuntimeConfig();

  if (!config.enabled) {
    throw new AuditApiError(
      503,
      "AUDIT_FEATURE_DISABLED",
      "Website audits are not available yet.",
      { headers: { "Retry-After": "3600" } },
    );
  }
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

export function createReportRecipientHash(email: string): string {
  const secret = getWebsiteAuditRuntimeConfig().hashSecret;

  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new AuditApiError(
        503,
        "AUDIT_CONTROLS_UNAVAILABLE",
        "Report delivery is temporarily unavailable.",
      );
    }

    return createHash("sha256")
      .update(email.trim().toLowerCase())
      .digest("hex");
  }

  return createHmac("sha256", secret)
    .update(email.trim().toLowerCase())
    .digest("hex");
}

export function isValidCronAuthorization(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  const authorization = request.headers.get("authorization") ?? "";
  const expected = secret ? `Bearer ${secret}` : "";

  if (!secret || authorization.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(Buffer.from(authorization), Buffer.from(expected));
}

export function resetAuditRateLimitsForTesting(): void {
  recentRequestsByClient.clear();
}
