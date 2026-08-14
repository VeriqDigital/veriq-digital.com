import assert from "node:assert/strict";
import test from "node:test";
import { purgeExpiredWebsiteAudits } from "../../lib/website-audit/retention";

test("purges every audit blob from immutable creation time despite a later state upload", async () => {
  const auditId = "0f734c3d-7a37-4bd2-98ab-88ff5f059f83";
  const pathnames = [
    `website-audits/${auditId}/state.json`,
    `website-audits/${auditId}/result.json`,
    `website-audits/${auditId}/report-requests/receipt.json`,
  ];
  const deleted: string[][] = [];

  const result = await purgeExpiredWebsiteAudits({
    now: new Date("2026-08-31T00:00:00.000Z"),
    storageForTesting: {
      listBlobs: async () => ({
        blobs: pathnames.map((pathname) => ({
          pathname,
          uploadedAt: new Date("2026-08-30T23:59:00.000Z"),
        })),
        hasMore: false,
      }),
      // state.json may have been uploaded again moments ago, but createdAt is T0.
      readAuditCreatedAt: async () => "2026-08-01T00:00:00.000Z",
      deleteBlobs: async (blobs) => {
        deleted.push([...blobs]);
      },
    },
  });

  assert.deepEqual(result, { auditsDeleted: 1, blobsDeleted: 3 });
  assert.deepEqual(deleted, [pathnames]);
});

test("does not purge a possibly incomplete audit at a truncated page boundary", async () => {
  const auditId = "0f734c3d-7a37-4bd2-98ab-88ff5f059f83";
  let reads = 0;

  const result = await purgeExpiredWebsiteAudits({
    now: new Date("2026-09-01T00:00:00.000Z"),
    maximumListPages: 1,
    storageForTesting: {
      listBlobs: async () => ({
        blobs: [{ pathname: `website-audits/${auditId}/state.json` }],
        cursor: "next-page",
        hasMore: true,
      }),
      readAuditCreatedAt: async () => {
        reads += 1;
        return "2026-01-01T00:00:00.000Z";
      },
      deleteBlobs: async () => assert.fail("boundary audit must not be deleted"),
    },
  });

  assert.deepEqual(result, { auditsDeleted: 0, blobsDeleted: 0 });
  assert.equal(reads, 0);
});
