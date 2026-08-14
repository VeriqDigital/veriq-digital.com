import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  AuditApiError,
  auditCreationRateLimit,
  assertTrustedMutationRequest,
  auditErrorResponse,
  createReportEmailIdempotencyKey,
  enforceAuditRateLimit,
  readBoundedJsonRequest,
  resetAuditRateLimitsForTesting,
} from "../../lib/website-audit/api-security";

afterEach(() => resetAuditRateLimitsForTesting());

test("rejects cross-site mutation requests", () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: {
      Origin: "https://attacker.example",
      "Sec-Fetch-Site": "cross-site",
    },
  });

  assert.throws(() => assertTrustedMutationRequest(request), AuditApiError);
});

test("accepts same-origin mutation requests", () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: {
      Origin: "https://www.veriqdigital.com",
      "Sec-Fetch-Site": "same-origin",
    },
  });

  assert.doesNotThrow(() => assertTrustedMutationRequest(request));
});

test("accepts the browser Host origin when the framework normalizes request URLs", () => {
  const request = new Request("http://localhost:3000/api/website-audits", {
    method: "POST",
    headers: {
      Host: "127.0.0.1:3000",
      Origin: "http://127.0.0.1:3000",
      "Sec-Fetch-Site": "same-origin",
    },
  });

  assert.doesNotThrow(() => assertTrustedMutationRequest(request));
});

test("enforces content type and actual body byte limits", async () => {
  const wrongType = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: "{}",
  });
  const oversized = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "x".repeat(100) }),
  });

  await assert.rejects(
    readBoundedJsonRequest(wrongType, { maxBytes: 100 }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 415,
  );
  await assert.rejects(
    readBoundedJsonRequest(oversized, { maxBytes: 20 }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 413,
  );
});

const auditCreationLimit = {
  scope: "create-audit-test",
  limit: 5,
  windowMs: 60 * 60 * 1_000,
} as const;

const createRateLimitRequest = () =>
  new Request("https://www.veriqdigital.com/api/website-audits", {
    headers: { "X-Forwarded-For": "203.0.113.9" },
  });

test("uses a five-audit one-hour creation limit", () => {
  assert.deepEqual(auditCreationRateLimit, {
    limit: 5,
    windowMs: 60 * 60 * 1_000,
  });
});

test("allows audit creation requests under the hourly client limit", async () => {
  const request = createRateLimitRequest();

  for (let requestNumber = 0; requestNumber < 4; requestNumber += 1) {
    await enforceAuditRateLimit(request, auditCreationLimit, 1_000 + requestNumber);
  }
});

test("allows the fifth audit creation at the limit boundary", async () => {
  const request = createRateLimitRequest();

  for (let requestNumber = 0; requestNumber < 5; requestNumber += 1) {
    await enforceAuditRateLimit(request, auditCreationLimit, 1_000 + requestNumber);
  }
});

test("rate limits requests above the boundary and returns the actual wait", async () => {
  const request = createRateLimitRequest();

  for (let requestNumber = 0; requestNumber < 5; requestNumber += 1) {
    await enforceAuditRateLimit(request, auditCreationLimit, 1_000 + requestNumber);
  }

  await assert.rejects(
    enforceAuditRateLimit(request, auditCreationLimit, 6_000),
    (error: unknown) => {
      if (!(error instanceof AuditApiError)) return false;

      const retryAfter = new Headers(error.headers).get("Retry-After");
      const responseRetryAfter = auditErrorResponse(error).headers.get(
        "Retry-After",
      );
      return (
        error.status === 429 &&
        retryAfter === "3595" &&
        responseRetryAfter === retryAfter &&
        !error.message.includes("203.0.113.9")
      );
    },
  );
});

test("resets the local fixed window when the hour expires", async () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    headers: { "X-Forwarded-For": "203.0.113.9" },
  });

  for (let requestNumber = 0; requestNumber < 5; requestNumber += 1) {
    await enforceAuditRateLimit(request, auditCreationLimit, 1_000 + requestNumber);
  }

  await enforceAuditRateLimit(
    request,
    auditCreationLimit,
    1_000 + auditCreationLimit.windowMs,
  );
});

test("stable error responses are no-store and omit internal details", async () => {
  const response = auditErrorResponse(new Error("secret provider response"));
  const body = (await response.json()) as {
    error: { code: string; message: string };
  };

  assert.equal(response.status, 500);
  assert.match(response.headers.get("cache-control") ?? "", /no-store/);
  assert.equal(body.error.code, "INTERNAL_ERROR");
  assert.equal(body.error.message.includes("secret"), false);
});

test("report email idempotency keys normalize recipient casing", () => {
  const id = "b6fd5ce8-e536-4caf-9eb0-28e7809a65fd";

  assert.equal(
    createReportEmailIdempotencyKey(id, "Person@Example.com"),
    createReportEmailIdempotencyKey(id, " person@example.com "),
  );
});
