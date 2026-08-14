import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAuditRetryMessage,
  getAuditApiError,
} from "../../components/website-audit/audit-submission";

test("uses Retry-After for the client-facing audit limit message", async () => {
  const response = Response.json(
    {
      error: {
        code: "RATE_LIMITED",
        message: "Too many requests. Please wait and try again.",
      },
    },
    { status: 429, headers: { "Retry-After": "720" } },
  );
  const error = getAuditApiError(response, await response.json());

  assert.equal(error.retryAfterSeconds, 720);
  assert.equal(
    error.message,
    "You've reached the audit limit. Try again in about 12 minutes.",
  );
});

test("falls back safely when a rate-limit response has no reliable wait", () => {
  assert.equal(
    formatAuditRetryMessage(null),
    "You've reached the audit limit. Please try again later.",
  );
});
