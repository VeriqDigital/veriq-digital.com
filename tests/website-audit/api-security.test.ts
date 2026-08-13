import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  AuditApiError,
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

test("rate limits hashed client buckets without returning raw identifiers", () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    headers: { "X-Forwarded-For": "203.0.113.9" },
  });
  const options = { scope: "test", limit: 2, windowMs: 60_000 } as const;

  enforceAuditRateLimit(request, options, 1_000);
  enforceAuditRateLimit(request, options, 2_000);

  assert.throws(
    () => enforceAuditRateLimit(request, options, 3_000),
    (error: unknown) =>
      error instanceof AuditApiError &&
      error.status === 429 &&
      !error.message.includes("203.0.113.9"),
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
