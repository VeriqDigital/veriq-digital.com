import assert from "node:assert/strict";
import test from "node:test";
import {
  PersistedAuditResultControlPlaneError,
  reconcilePersistedAuditResult,
  shouldTerminallyFailAudit,
} from "../../lib/website-audit/run-lifecycle";

const result = {
  auditedUrl: "https://example.com/",
  marker: "immutable-result",
} as const;

test("returns the persisted result when the post-write state read fails", async () => {
  const recovered = await reconcilePersistedAuditResult({
    result,
    readState: async () => {
      throw new Error("temporary state read failure");
    },
    readPersistedResult: async () => result,
    transitionToCompleted: async () => assert.fail("must not transition"),
  });

  assert.equal(recovered, result);
  assert.equal(shouldTerminallyFailAudit(true, new Error("state read")), false);
});

test("returns the immutable result when the completion transition conflicts", async () => {
  let expectedEtag = "";
  const recovered = await reconcilePersistedAuditResult({
    result,
    readState: async () => ({ status: "running", etag: "running-etag" }),
    readPersistedResult: async () => result,
    transitionToCompleted: async (_finalUrl, etag) => {
      expectedEtag = etag;
      throw new Error("optimistic transition conflict");
    },
  });

  assert.equal(recovered, result);
  assert.equal(expectedEtag, "running-etag");
});

test("recovery completes a running state from the persisted result without rerunning work", async () => {
  let completion: { finalUrl: string; etag: string } | undefined;
  let crawlRuns = 0;
  const recovered = await reconcilePersistedAuditResult({
    result,
    readState: async () => ({ status: "running", etag: "recovery-etag" }),
    readPersistedResult: async () => {
      crawlRuns += 1;
      return result;
    },
    transitionToCompleted: async (finalUrl, etag) => {
      completion = { finalUrl, etag };
    },
  });

  assert.equal(recovered, result);
  assert.deepEqual(completion, {
    finalUrl: "https://example.com/",
    etag: "recovery-etag",
  });
  assert.equal(crawlRuns, 0);
});

test("unrecoverable post-write errors stay recoverable while pre-result failures remain terminal", async () => {
  await assert.rejects(
    reconcilePersistedAuditResult({
      result,
      readState: async () => {
        throw new Error("state unavailable");
      },
      readPersistedResult: async () => null,
      transitionToCompleted: async () => undefined,
    }),
    PersistedAuditResultControlPlaneError,
  );

  assert.equal(shouldTerminallyFailAudit(true, new Error("after result")), false);
  assert.equal(shouldTerminallyFailAudit(false, new Error("crawl failed")), true);
});
