const storageKeyPrefix = "veriq.website-audit.pending.";
const maximumPendingAgeMs = 15 * 60 * 1_000;

export type PendingWebsiteAudit = Readonly<{
  id: string;
  normalizedUrl: string;
  createdAt: number;
}>;

type PendingAuditStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const getStorage = (): PendingAuditStorage | null => {
  try {
    return typeof window === "undefined" ? null : window.sessionStorage;
  } catch {
    return null;
  }
};

const removeStoredValue = (
  storage: PendingAuditStorage | null,
  key: string,
) => {
  try {
    storage?.removeItem(key);
  } catch {
    // Pending-audit recovery is optional and must never block navigation.
  }
};

export function savePendingWebsiteAudit(pending: PendingWebsiteAudit): void {
  try {
    getStorage()?.setItem(
      `${storageKeyPrefix}${pending.id}`,
      JSON.stringify(pending),
    );
  } catch {
    // Quota and privacy errors only disable best-effort recovery.
  }
}

export function readPendingWebsiteAudit(
  auditId: string,
  now = Date.now(),
): PendingWebsiteAudit | null {
  const storage = getStorage();
  const key = `${storageKeyPrefix}${auditId}`;
  let raw: string | null | undefined;

  try {
    raw = storage?.getItem(key);
  } catch {
    return null;
  }

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
      removeStoredValue(storage, key);
      return null;
    }

    return value as PendingWebsiteAudit;
  } catch {
    removeStoredValue(storage, key);
    return null;
  }
}

export function clearPendingWebsiteAudit(auditId: string): void {
  removeStoredValue(getStorage(), `${storageKeyPrefix}${auditId}`);
}
