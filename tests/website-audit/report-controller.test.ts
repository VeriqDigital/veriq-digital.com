import assert from "node:assert/strict";
import test from "node:test";
import {
  AuditApiError,
} from "../../components/website-audit/audit-submission";
import {
  advanceWebsiteAuditReport,
} from "../../components/website-audit/report-controller";
import type { WebsiteAuditState } from "../../components/website-audit/audit-submission";
import type { WebsiteAuditResult } from "../../components/website-audit/types";

const auditId = "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2";
const timestamp = "2026-08-12T12:00:00.000Z";
const state = (
  status: WebsiteAuditState["status"],
  overrides: Partial<WebsiteAuditState> = {},
): WebsiteAuditState => ({
  id: auditId,
  status,
  submittedUrl: "https://example.com/",
  createdAt: timestamp,
  updatedAt: timestamp,
  ...overrides,
});

const completedResult = {
  id: auditId,
  status: "complete",
} as WebsiteAuditResult;

test("created queued report is claimed, run, and returned completed", async () => {
  const states = [state("queued"), state("completed", { result: completedResult })];
  let runCalls = 0;
  const result = await advanceWebsiteAuditReport(auditId, undefined, {
    getAudit: async () => states.shift()!,
    runAudit: async () => {
      runCalls += 1;
      return completedResult;
    },
    now: () => Date.parse(timestamp) + 1_000,
  });

  assert.equal(runCalls, 1);
  assert.equal(result.status, "completed");
  assert.equal(result.result, completedResult);
});

test("already-running response is polled without starting a duplicate run", async () => {
  let runCalls = 0;
  const result = await advanceWebsiteAuditReport(auditId, undefined, {
    getAudit: async () => state("running"),
    runAudit: async () => {
      runCalls += 1;
      return null;
    },
    now: () => Date.parse(timestamp) + 30_000,
  });

  assert.equal(runCalls, 0);
  assert.equal(result.status, "running");
});

test("interrupted run request recovers from the persisted report state", async () => {
  const states = [state("queued"), state("running")];
  const result = await advanceWebsiteAuditReport(auditId, undefined, {
    getAudit: async () => states.shift()!,
    runAudit: async () => {
      throw new AuditApiError("Connection ended.", "NETWORK_ERROR", 0);
    },
    now: () => Date.parse(timestamp) + 1_000,
  });

  assert.equal(result.status, "running");
});

test("stale running state is reclaimed through the run endpoint", async () => {
  const states = [state("running"), state("queued")];
  let runCalls = 0;
  const result = await advanceWebsiteAuditReport(auditId, undefined, {
    getAudit: async () => states.shift()!,
    runAudit: async () => {
      runCalls += 1;
      return null;
    },
    now: () => Date.parse(timestamp) + 3 * 60 * 1_000,
  });

  assert.equal(runCalls, 1);
  assert.equal(result.status, "queued");
});

test("failed and completed audits are terminal and never restarted", async () => {
  for (const terminal of [
    state("failed", { error: { code: "TARGET_UNREACHABLE", message: "No response." } }),
    state("completed", { result: completedResult }),
  ]) {
    let runCalls = 0;
    const result = await advanceWebsiteAuditReport(auditId, undefined, {
      getAudit: async () => terminal,
      runAudit: async () => {
        runCalls += 1;
        return null;
      },
      now: () => Date.parse(timestamp) + 1_000,
    });

    assert.equal(runCalls, 0);
    assert.equal(result.status, terminal.status);
  }
});
