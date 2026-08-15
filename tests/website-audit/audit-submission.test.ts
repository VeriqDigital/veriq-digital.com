import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAuditRetryMessage,
  getAuditRetrySecondsRemaining,
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
    "You can run another audit in about 12 minutes.",
  );
});

test("falls back safely when a rate-limit response has no reliable wait", () => {
  assert.equal(
    formatAuditRetryMessage(null),
    "You can run another audit later.",
  );
});

test("updates rate-limit time from the server-derived retry deadline", () => {
  const retryAt = 1_000_000;

  assert.equal(getAuditRetrySecondsRemaining(retryAt, 880_001), 120);
  assert.equal(
    formatAuditRetryMessage(120),
    "You can run another audit in about 2 minutes.",
  );
  assert.equal(getAuditRetrySecondsRemaining(retryAt, 999_001), 1);
  assert.equal(
    formatAuditRetryMessage(1),
    "You can run another audit in less than a minute.",
  );
  assert.equal(getAuditRetrySecondsRemaining(retryAt, retryAt), 0);
});
