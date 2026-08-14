import { del, get, list } from "@vercel/blob";
import { getWebsiteAuditBlobAuthOptions } from "./blob-config";
import { getWebsiteAuditRuntimeConfig } from "./runtime-config";

const auditBlobPrefix = "website-audits/";
const auditPathPattern =
  /^website-audits\/([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})\//i;

type RetentionBlob = Readonly<{ pathname: string; uploadedAt?: Date }>;

type RetentionStorage = Readonly<{
  deleteBlobs: (pathnames: readonly string[]) => Promise<void>;
  listBlobs: (cursor?: string) => Promise<Readonly<{
    blobs: readonly RetentionBlob[];
    cursor?: string;
    hasMore: boolean;
  }>>;
  readAuditCreatedAt: (statePathname: string) => Promise<string | null>;
}>;

const readCreatedAtFromBlob = async (
  pathname: string,
  authOptions: NonNullable<ReturnType<typeof getWebsiteAuditBlobAuthOptions>>,
) => {
  const result = await get(pathname, {
    access: "private",
    ...authOptions,
    useCache: false,
  });

  if (!result || result.statusCode !== 200) return null;

  try {
    const value = JSON.parse(await new Response(result.stream).text()) as unknown;

    if (
      typeof value !== "object" ||
      value === null ||
      !("createdAt" in value) ||
      typeof value.createdAt !== "string" ||
      !Number.isFinite(Date.parse(value.createdAt))
    ) {
      return null;
    }

    return value.createdAt;
  } catch {
    return null;
  }
};

export async function purgeExpiredWebsiteAudits(options: Readonly<{
  now?: Date;
  maximumListPages?: number;
  maximumAudits?: number;
  storageForTesting?: RetentionStorage;
}> = {}): Promise<Readonly<{ auditsDeleted: number; blobsDeleted: number }>> {
  const now = options.now ?? new Date();
  const maximumListPages = options.maximumListPages ?? 10;
  const maximumAudits = options.maximumAudits ?? 100;
  const retentionDays = getWebsiteAuditRuntimeConfig().retentionDays;
  const cutoff = now.getTime() - retentionDays * 24 * 60 * 60 * 1_000;
  const blobsByAudit = new Map<
    string,
    RetentionBlob[]
  >();
  let cursor: string | undefined;
  let truncatedBoundaryAuditId: string | null = null;
  const authOptions = getWebsiteAuditBlobAuthOptions();

  if (!authOptions && !options.storageForTesting) {
    throw new Error("Website audit Blob storage is not configured.");
  }

  const storage: RetentionStorage = options.storageForTesting ?? {
    listBlobs: (listCursor) =>
      list({
        ...authOptions,
        prefix: auditBlobPrefix,
        limit: 1_000,
        cursor: listCursor,
      }),
    readAuditCreatedAt: (pathname) =>
      readCreatedAtFromBlob(pathname, authOptions!),
    deleteBlobs: async (pathnames) => {
      await del([...pathnames], authOptions!);
    },
  };

  for (let page = 0; page < maximumListPages; page += 1) {
    const result = await storage.listBlobs(cursor);

    for (const blob of result.blobs) {
      const auditId = blob.pathname.match(auditPathPattern)?.[1];
      if (!auditId) continue;

      const entries = blobsByAudit.get(auditId) ?? [];
      entries.push({ pathname: blob.pathname });
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

  const expired: Array<[string, RetentionBlob[]]> = [];

  for (const [auditId, blobs] of blobsByAudit) {
    if (expired.length >= maximumAudits) break;
    if (auditId === truncatedBoundaryAuditId) continue;

    const state = blobs.find((blob) => blob.pathname.endsWith("/state.json"));
    if (!state) continue;

    const createdAt = await storage.readAuditCreatedAt(state.pathname);
    if (createdAt && Date.parse(createdAt) <= cutoff) {
      expired.push([auditId, blobs]);
    }
  }
  let blobsDeleted = 0;

  for (const [, blobs] of expired) {
    const pathnames = blobs.map((blob) => blob.pathname);
    await storage.deleteBlobs(pathnames);
    blobsDeleted += pathnames.length;
  }

  return { auditsDeleted: expired.length, blobsDeleted };
}
