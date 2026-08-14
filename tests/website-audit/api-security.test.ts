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

test("reads valid bounded JSON", async () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url: "https://example.com" }),
  });

  assert.deepEqual(
    await readBoundedJsonRequest(request, { maxBytes: 100 }),
    { url: "https://example.com" },
  );
});

test("rejects an unsupported request content type before reading its body", async () => {
  const wrongType = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: new ReadableStream({
      pull(controller) {
        controller.enqueue(new TextEncoder().encode("{}"));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  await assert.rejects(
    readBoundedJsonRequest(wrongType, { maxBytes: 100 }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 415,
  );
});

test("rejects a declared oversized JSON body without consuming it", async () => {
  const oversized = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": "101",
    },
    body: new ReadableStream({
      pull(controller) {
        controller.enqueue(new TextEncoder().encode("{}"));
        controller.close();
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  await assert.rejects(
    readBoundedJsonRequest(oversized, { maxBytes: 100 }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 413,
  );
});

test("stops a chunked JSON body as soon as its encoded bytes exceed the limit", async () => {
  let chunksRead = 0;
  const chunks = ["{\"url\":\"", "x".repeat(20), "never-read\"}"];
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: new ReadableStream({
      pull(controller) {
        const chunk = chunks[chunksRead];
        chunksRead += 1;
        if (chunk === undefined) {
          controller.close();
        } else {
          controller.enqueue(new TextEncoder().encode(chunk));
        }
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  await assert.rejects(
    readBoundedJsonRequest(request, { maxBytes: 20 }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 413,
  );
  assert.equal(chunksRead, 2);
});

test("enforces the request limit on multibyte UTF-8 bytes", async () => {
  const raw = JSON.stringify({ value: "é" });
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw,
  });

  await assert.rejects(
    readBoundedJsonRequest(request, { maxBytes: raw.length }),
    (error: unknown) =>
      error instanceof AuditApiError && error.status === 413,
  );
});

test("preserves allowEmpty behavior for an absent body", async () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
  });

  assert.equal(
    await readBoundedJsonRequest(request, { allowEmpty: true, maxBytes: 100 }),
    null,
  );
});

test("maps request stream read failures to the stable invalid-body error", async () => {
  const request = new Request("https://www.veriqdigital.com/api/website-audits", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: new ReadableStream({
      pull(controller) {
        controller.error(new Error("stream failed"));
      },
    }),
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  await assert.rejects(
    readBoundedJsonRequest(request, { maxBytes: 100 }),
    (error: unknown) =>
      error instanceof AuditApiError &&
      error.status === 400 &&
      error.code === "INVALID_REQUEST_BODY",
  );
});

const auditCreationLimit = {
  scope: "create-audit-test",
  limit: 5,
  windowMs: 15 * 60 * 1_000,
} as const;

const createRateLimitRequest = () =>
  new Request("https://www.veriqdigital.com/api/website-audits", {
    headers: { "X-Forwarded-For": "203.0.113.9" },
  });

test("uses a five-audit fifteen-minute creation limit", () => {
  assert.deepEqual(auditCreationRateLimit, {
    limit: 5,
    windowMs: 15 * 60 * 1_000,
  });
});

test("allows audit creation requests under the fifteen-minute client limit", async () => {
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
        retryAfter === "895" &&
        responseRetryAfter === retryAfter &&
        !error.message.includes("203.0.113.9")
      );
    },
  );
});

test("resets the local fixed window when fifteen minutes expire", async () => {
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
