const storageKeyPrefix = "veriq.website-audit.pending.";
const maximumPendingAgeMs = 15 * 60 * 1_000;

export type PendingWebsiteAudit = Readonly<{
  id: string;
  normalizedUrl: string;
  createdAt: number;
}>;

const getStorage = () =>
  typeof window === "undefined" ? null : window.sessionStorage;

export function savePendingWebsiteAudit(pending: PendingWebsiteAudit): void {
  getStorage()?.setItem(
    `${storageKeyPrefix}${pending.id}`,
    JSON.stringify(pending),
  );
}

export function readPendingWebsiteAudit(
  auditId: string,
  now = Date.now(),
): PendingWebsiteAudit | null {
  const storage = getStorage();
  const key = `${storageKeyPrefix}${auditId}`;
  const raw = storage?.getItem(key);

  if (!raw) return null;

  try {
    const value = JSON.parse(raw) as Partial<PendingWebsiteAudit>;

    if (
      value.id !== auditId ||
      typeof value.normalizedUrl !== "string" ||
      !value.normalizedUrl ||
      typeof value.createdAt !== "number" ||
      !Number.isFinite(value.createdAt) ||
      now - value.createdAt > maximumPendingAgeMs
    ) {
      storage?.removeItem(key);
      return null;
    }

    return value as PendingWebsiteAudit;
  } catch {
    storage?.removeItem(key);
    return null;
  }
}

export function clearPendingWebsiteAudit(auditId: string): void {
  getStorage()?.removeItem(`${storageKeyPrefix}${auditId}`);
}
