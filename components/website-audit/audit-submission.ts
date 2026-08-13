import { normalizeWebsiteUrl } from "./url";

export type AuditSubmissionResult =
  | {
      ok: true;
      mode: "demo";
      normalizedUrl: string;
      message: string;
    }
  | { ok: false; message: string };

/**
 * Integration boundary for the future audit API. This pass validates and
 * normalizes the URL, but deliberately performs no request and claims no scan.
 */
export function submitWebsiteForAudit(
  submittedUrl: string,
): Promise<AuditSubmissionResult> {
  const validation = normalizeWebsiteUrl(submittedUrl);

  if (!validation.ok) {
    return Promise.resolve(validation);
  }

  return Promise.resolve({
    ok: true,
    mode: "demo",
    normalizedUrl: validation.normalizedUrl,
    message:
      "That URL is ready. Live scanning is not connected yet, so the report below remains a clearly labeled sample.",
  });
}

