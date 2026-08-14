import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, test } from "node:test";
import { getWebsiteAuditBlobAuthOptions } from "../../lib/website-audit/blob-config";
import {
  AuditStateTransitionError,
  AuditStorageConflictError,
  AuditStorageUnavailableError,
  AuditStorageValidationError,
  createAuditReportStore,
  generateAuditId,
  isValidAuditId,
} from "../../lib/website-audit/store";

const temporaryDirectories: string[] = [];

const createLocalStore = async () => {
  const rootDirectory = await mkdtemp(
    path.join(os.tmpdir(), "veriq-audit-store-"),
  );
  temporaryDirectories.push(rootDirectory);

  let milliseconds = Date.parse("2026-08-12T12:00:00.000Z");
  const store = createAuditReportStore({
    localDirectory: rootDirectory,
    now: () => new Date(milliseconds++),
  });

  return { rootDirectory, store };
};

afterEach(async () => {
  await Promise.all(
    temporaryDirectories.splice(0).map((directory) =>
      rm(directory, { recursive: true, force: true }),
    ),
  );
});

test("generates and validates opaque UUID audit IDs", () => {
  const auditId = generateAuditId();

  assert.equal(isValidAuditId(auditId), true);
  assert.equal(isValidAuditId("../state.json"), false);
  assert.equal(isValidAuditId("00000000-0000-0000-0000-000000000000"), false);
});

test("uses the attached store for OIDC and preserves the token fallback", () => {
  assert.deepEqual(
    getWebsiteAuditBlobAuthOptions({
      BLOB_STORE_ID: " store_website_audits ",
      BLOB_READ_WRITE_TOKEN: "vercel_blob_rw_fallback",
    }),
    { storeId: "store_website_audits" },
  );
  assert.deepEqual(
    getWebsiteAuditBlobAuthOptions({
      BLOB_READ_WRITE_TOKEN: " vercel_blob_rw_fallback ",
    }),
    { token: "vercel_blob_rw_fallback" },
  );
  assert.equal(getWebsiteAuditBlobAuthOptions({}), null);
});

test("creates, reads, and transitions audit state with optimistic ETags", async () => {
  const { store } = await createLocalStore();
  const created = await store.createState({
    submittedUrl: "https://example.com",
    normalizedUrl: "https://example.com/",
  });

  assert.equal(created.state.status, "queued");
  assert.equal(created.state.id, created.state.id.toLowerCase());
  assert.ok(created.etag);

  const read = await store.readState(created.state.id);
  assert.deepEqual(read, created);

  const running = await store.transitionState(
    created.state.id,
    { status: "running" },
    { expectedEtag: created.etag },
  );

  assert.equal(running.state.status, "running");
  assert.ok(running.state.startedAt);
  assert.notEqual(running.etag, created.etag);

  await assert.rejects(
    store.transitionState(
      created.state.id,
      { status: "completed" },
      { expectedEtag: created.etag },
    ),
    AuditStorageConflictError,
  );

  const completed = await store.transitionState(
    created.state.id,
    { status: "completed", finalUrl: "https://example.com/" },
    { expectedEtag: running.etag },
  );

  assert.equal(completed.state.status, "completed");
  assert.ok(completed.state.completedAt);

  await assert.rejects(
    store.transitionState(created.state.id, { status: "running" }),
    AuditStateTransitionError,
  );
});

test("persists an immutable result and validates it at the read boundary", async () => {
  const { store } = await createLocalStore();
  const created = await store.createState({
    submittedUrl: "https://example.com",
  });
  await store.transitionState(created.state.id, { status: "running" });

  const result = { overallScore: 84, findings: ["missing-description"] };
  await store.writeResult(created.state.id, result);

  const stored = await store.readResult(created.state.id, (value) => {
    if (
      typeof value !== "object" ||
      value === null ||
      !("overallScore" in value) ||
      typeof value.overallScore !== "number"
    ) {
      throw new Error("invalid result");
    }

    return value as typeof result;
  });

  assert.deepEqual(stored?.result, result);

  await assert.rejects(
    store.writeResult(created.state.id, { overallScore: 10 }),
    AuditStorageConflictError,
  );

  await assert.rejects(
    store.readResult(created.state.id, () => {
      throw new Error("schema mismatch");
    }),
    AuditStorageValidationError,
  );
});

test("writes report-request receipts separately from public audit data", async () => {
  const { rootDirectory, store } = await createLocalStore();
  const created = await store.createState({
    submittedUrl: "https://example.com",
  });
  const running = await store.transitionState(created.state.id, {
    status: "running",
  });
  await store.writeResult(created.state.id, { overallScore: 90 });
  await store.transitionState(
    created.state.id,
    { status: "completed" },
    { expectedEtag: running.etag },
  );

  const storedReceipt = await store.writeReportRequestReceipt({
    auditId: created.state.id,
    recipientHash: "a".repeat(64),
    status: "sent",
    providerMessageId: "resend_123",
  });

  const receiptPath = path.join(
    rootDirectory,
    created.state.id,
    "report-requests",
    `${storedReceipt.receipt.id}.json`,
  );
  const rawReceipt = JSON.parse(await readFile(receiptPath, "utf8")) as {
    recipientHash: string;
    name?: string;
    email?: string;
  };
  const publicResult = await store.readResult(created.state.id);

  assert.equal(rawReceipt.recipientHash, "a".repeat(64));
  assert.equal(rawReceipt.name, undefined);
  assert.equal(rawReceipt.email, undefined);
  assert.deepEqual(publicResult?.result, { overallScore: 90 });
  assert.equal("email" in (publicResult?.result as object), false);
});

test("requires a safe failure reason when transitioning to failed", async () => {
  const { store } = await createLocalStore();
  const created = await store.createState({
    submittedUrl: "https://example.com",
  });

  await assert.rejects(
    store.transitionState(created.state.id, { status: "failed" }),
    AuditStorageValidationError,
  );

  const failed = await store.transitionState(created.state.id, {
    status: "failed",
    failure: {
      code: "FETCH_FAILED",
      message: "The website could not be reached.",
      retryable: true,
    },
  });

  assert.equal(failed.state.status, "failed");
  assert.equal(failed.state.failure?.code, "FETCH_FAILED");
});

test("atomically requeues one stale run while preserving attempt history", async () => {
  const { store } = await createLocalStore();
  const created = await store.createState({
    submittedUrl: "https://example.com",
  });
  const firstRun = await store.transitionState(
    created.state.id,
    { status: "running" },
    { expectedEtag: created.etag },
  );
  const recovered = await store.transitionState(
    created.state.id,
    { status: "queued" },
    { expectedEtag: firstRun.etag },
  );
  const secondRun = await store.transitionState(
    created.state.id,
    { status: "running" },
    { expectedEtag: recovered.etag },
  );

  assert.equal(firstRun.state.runAttempts, 1);
  assert.equal(recovered.state.status, "queued");
  assert.equal(recovered.state.startedAt, undefined);
  assert.equal(secondRun.state.runAttempts, 2);
  await assert.rejects(
    store.transitionState(
      created.state.id,
      { status: "queued" },
      { expectedEtag: firstRun.etag },
    ),
    AuditStorageConflictError,
  );
});

test("expired audit state becomes unreadable at the retention boundary", async () => {
  const rootDirectory = await mkdtemp(
    path.join(os.tmpdir(), "veriq-audit-retention-"),
  );
  temporaryDirectories.push(rootDirectory);
  let now = new Date("2026-08-01T00:00:00.000Z");
  const store = createAuditReportStore({
    localDirectory: rootDirectory,
    now: () => now,
    retentionDays: 1,
  });
  const created = await store.createState({
    submittedUrl: "https://example.com",
  });

  now = new Date("2026-08-02T00:00:00.000Z");
  assert.equal(await store.readState(created.state.id), null);
});

test("fails closed in production when Blob storage is not configured", async () => {
  const previousNodeEnvironment = process.env.NODE_ENV;
  const previousBlobStoreId = process.env.BLOB_STORE_ID;
  const previousBlobToken = process.env.BLOB_READ_WRITE_TOKEN;

  try {
    Reflect.set(process.env, "NODE_ENV", "production");
    Reflect.deleteProperty(process.env, "BLOB_STORE_ID");
    Reflect.deleteProperty(process.env, "BLOB_READ_WRITE_TOKEN");

    const store = createAuditReportStore({
      localDirectory: path.join(os.tmpdir(), "must-not-be-used"),
    });

    await assert.rejects(
      store.createState({ submittedUrl: "https://example.com" }),
      AuditStorageUnavailableError,
    );
  } finally {
    if (previousNodeEnvironment === undefined) {
      Reflect.deleteProperty(process.env, "NODE_ENV");
    } else {
      Reflect.set(process.env, "NODE_ENV", previousNodeEnvironment);
    }

    if (previousBlobToken === undefined) {
      Reflect.deleteProperty(process.env, "BLOB_READ_WRITE_TOKEN");
    } else {
      Reflect.set(process.env, "BLOB_READ_WRITE_TOKEN", previousBlobToken);
    }

    if (previousBlobStoreId === undefined) {
      Reflect.deleteProperty(process.env, "BLOB_STORE_ID");
    } else {
      Reflect.set(process.env, "BLOB_STORE_ID", previousBlobStoreId);
    }
  }
});
