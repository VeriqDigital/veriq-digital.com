import { del, list } from "@vercel/blob";
import { getWebsiteAuditRuntimeConfig } from "./runtime-config";

const auditBlobPrefix = "website-audits/";
const auditPathPattern =
  /^website-audits\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\//i;

export async function purgeExpiredWebsiteAudits(options: Readonly<{
  now?: Date;
  maximumListPages?: number;
  maximumAudits?: number;
}> = {}): Promise<Readonly<{ auditsDeleted: number; blobsDeleted: number }>> {
  const now = options.now ?? new Date();
  const maximumListPages = options.maximumListPages ?? 10;
  const maximumAudits = options.maximumAudits ?? 100;
  const retentionDays = getWebsiteAuditRuntimeConfig().retentionDays;
  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1_000;
  const blobsByAudit = new Map<
    string,
    Array<Readonly<{ pathname: string; uploadedAt: Date }>>
  >();
  let cursor: string | undefined;
  let truncatedBoundaryAuditId: string | null = null;

  for (let page = 0; page < maximumListPages; page += 1) {
    const result = await list({
      prefix: auditBlobPrefix,
      limit: 1_000,
      cursor,
    });

    for (const blob of result.blobs) {
      const auditId = blob.pathname.match(auditPathPattern)?.[1];
      if (!auditId) continue;

      const entries = blobsByAudit.get(auditId) ?? [];
      entries.push({ pathname: blob.pathname, uploadedAt: blob.uploadedAt });
      blobsByAudit.set(auditId, entries);
    }

    if (!result.hasMore || !result.cursor) break;

    if (page === maximumListPages - 1) {
      truncatedBoundaryAuditId = result.blobs.at(-1)?.pathname.match(
        auditPathPattern,
      )?.[1] ?? null;
      break;
    }

    cursor = result.cursor;
  }

  const expired = [...blobsByAudit.entries()]
    .filter(([auditId, blobs]) => {
      if (auditId === truncatedBoundaryAuditId) return false;
      const state = blobs.find((blob) => blob.pathname.endsWith("/state.json"));
      return state ? state.uploadedAt.getTime() < cutoff : false;
    })
    .slice(0, maximumAudits);
  let blobsDeleted = 0;

  for (const [, blobs] of expired) {
    const pathnames = blobs.map((blob) => blob.pathname);
    await del(pathnames);
    blobsDeleted += pathnames.length;
  }

  return { auditsDeleted: expired.length, blobsDeleted };
}
