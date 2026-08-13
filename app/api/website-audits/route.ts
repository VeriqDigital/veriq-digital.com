import { z } from "zod";
import {
  AuditApiError,
  assertTrustedMutationRequest,
  auditDataResponse,
  auditErrorResponse,
  createReportUrl,
  enforceAuditRateLimit,
  logUnexpectedAuditApiError,
  readBoundedJsonRequest,
} from "@/lib/website-audit/api-security";
import { parsePublicAuditUrl, resolvePublicHost } from "@/lib/website-audit/security";
import { createAuditState } from "@/lib/website-audit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submissionSchema = z
  .object({
    url: z.string().trim().min(1).max(2048),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertTrustedMutationRequest(request);
    enforceAuditRateLimit(request, {
      scope: "create-audit",
      limit: 4,
      windowMs: 10 * 60 * 1000,
    });

    const parsedBody = submissionSchema.safeParse(
      await readBoundedJsonRequest(request, { maxBytes: 4_096 }),
    );

    if (!parsedBody.success) {
      throw new AuditApiError(
        400,
        "INVALID_AUDIT_REQUEST",
        "Enter a valid website URL.",
      );
    }

    const auditUrl = parsePublicAuditUrl(parsedBody.data.url);
    await resolvePublicHost(auditUrl.hostname);

    const normalizedUrl = auditUrl.toString();
    const stored = await createAuditState({
      submittedUrl: normalizedUrl,
      normalizedUrl,
    });

    console.info("Website audit queued", { auditId: stored.state.id });

    return auditDataResponse(
      {
        id: stored.state.id,
        status: "queued",
        reportUrl: createReportUrl(stored.state.id, request),
      },
      202,
    );
  } catch (error) {
    logUnexpectedAuditApiError("create", error);
    return auditErrorResponse(error);
  }
}
