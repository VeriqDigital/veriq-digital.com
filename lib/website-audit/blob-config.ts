export type WebsiteAuditBlobAuthOptions =
  | Readonly<{ storeId: string }>
  | Readonly<{ token: string }>;

export function getWebsiteAuditBlobAuthOptions(
  environment: Readonly<Record<string, string | undefined>> = process.env,
): WebsiteAuditBlobAuthOptions | null {
  const storeId = environment.BLOB_STORE_ID?.trim();

  if (storeId) {
    return { storeId };
  }

  const token = environment.BLOB_READ_WRITE_TOKEN?.trim();

  return token ? { token } : null;
}
