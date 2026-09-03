import assert from "node:assert/strict";
import test from "node:test";
import {
  readInitialWebsiteAuditState,
  type ReportStateReader,
} from "../../lib/website-audit/report-state";
import type { StoredAuditState } from "../../lib/website-audit/store-types";
import type { WebsiteAuditResult } from "../../lib/website-audit/model";

const auditId = "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2";
const timestamp = "2026-08-12T12:00:00.000Z";

const storedState = (
  status: StoredAuditState["state"]["status"],
  overrides: Partial<StoredAuditState["state"]> = {},
): StoredAuditState => ({
  etag: `${status}-etag`,
  state: {
    schemaVersion: 1,
    id: auditId,
    status,
    submittedUrl: "https://example.com/",
    normalizedUrl: "https://example.com",
    createdAt: timestamp,
    updatedAt: timestamp,
    runAttempts: status === "running" ? 1 : 0,
    ...overrides,
  },
});

const reader = (
  state: StoredAuditState | null,
  result: WebsiteAuditResult | null = null,
): ReportStateReader => ({
  readState: async () => state,
  readResult: async () =>
    result ? { auditId, result, etag: "result-etag" } : null,
});

test("returns no initial state for a missing report so client recovery can run", async () => {
  assert.equal(await readInitialWebsiteAuditState(auditId, reader(null)), null);
});

test("projects queued and failed states for the first server render", async () => {
  const queued = await readInitialWebsiteAuditState(
    auditId,
    reader(storedState("queued")),
  );
  assert.deepEqual(queued, {
    id: auditId,
    status: "queued",
    submittedUrl: "https://example.com",
    createdAt: timestamp,
    updatedAt: timestamp,
    error: undefined,
  });

  const failed = await readInitialWebsiteAuditState(
    auditId,
    reader(
      storedState("failed", {
        failure: {
          code: "TARGET_UNREACHABLE",
          message: "The website did not respond.",
          retryable: true,
        },
      }),
    ),
  );
  assert.deepEqual(failed?.error, {
    code: "TARGET_UNREACHABLE",
    message: "The website did not respond.",
  });
});

test("includes a completed result in the first server render", async () => {
  const result = {
    id: auditId,
    status: "complete",
  } as WebsiteAuditResult;
  const completed = await readInitialWebsiteAuditState(
    auditId,
    reader(storedState("completed"), result),
  );

  assert.equal(completed?.status, "completed");
  assert.equal(completed?.result, result);
});
