import { z } from "zod";
import {
  AuditApiError,
  auditCreationRateLimit,
  assertWebsiteAuditAvailable,
  assertTrustedMutationRequest,
  auditDataResponse,
  auditErrorResponse,
  createReportUrl,
  enforceAuditRateLimit,
  logUnexpectedAuditApiError,
  readBoundedJsonRequest,
} from "@/lib/website-audit/api-security";
import { parsePublicAuditUrl, resolvePublicHost } from "@/lib/website-audit/security";
import {
  AuditStorageConflictError,
  createAuditState,
  isValidAuditId,
  readAuditState,
} from "@/lib/website-audit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const submissionSchema = z
  .object({
    auditId: z.string().refine(isValidAuditId),
    url: z.string().trim().min(1).max(2048),
  })
  .strict();

export async function POST(request: Request) {
  try {
    assertWebsiteAuditAvailable();
    assertTrustedMutationRequest(request);
    await enforceAuditRateLimit(request, {
      scope: "create-audit",
      ...auditCreationRateLimit,
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
    let stored;

    try {
      stored = await createAuditState({
        id: parsedBody.data.auditId,
        submittedUrl: normalizedUrl,
        normalizedUrl,
      });
    } catch (error) {
      if (!(error instanceof AuditStorageConflictError)) {
        throw error;
      }

      const existing = await readAuditState(parsedBody.data.auditId);

      if (!existing || existing.state.normalizedUrl !== normalizedUrl) {
        throw new AuditApiError(
          409,
          "AUDIT_ID_CONFLICT",
          "This audit request could not be recovered safely.",
        );
      }

      stored = existing;
    }

    console.info("Website audit queued", { auditId: stored.state.id });

    return auditDataResponse(
      {
        id: stored.state.id,
        status: stored.state.status,
        reportUrl: createReportUrl(stored.state.id, request),
      },
      202,
    );
  } catch (error) {
    logUnexpectedAuditApiError("create", error);
    return auditErrorResponse(error);
  }
}
