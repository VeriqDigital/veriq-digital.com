import { Resend } from "resend";
import { z } from "zod";
import { siteConfig } from "@/config/site";
import {
  AuditApiError,
  assertTrustedMutationRequest,
  auditDataResponse,
  auditErrorResponse,
  createReportEmailIdempotencyKey,
  createReportUrl,
  enforceAuditRateLimit,
  logUnexpectedAuditApiError,
  readBoundedJsonRequest,
} from "@/lib/website-audit/api-security";
import { normalizeAuditResult } from "@/lib/website-audit/result-schema";
import {
  isValidAuditId,
  readAuditResult,
  readAuditState,
  writeReportRequestReceipt,
} from "@/lib/website-audit/store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const reportRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(120),
    email: z.email().max(320),
    website: z.string().max(200).optional().default(""),
  })
  .strict();

type RouteContext = Readonly<{
  params: Promise<{ id: string }>;
}>;

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    assertTrustedMutationRequest(request);

    if (!isValidAuditId(id)) {
      throw new AuditApiError(400, "INVALID_AUDIT_ID", "The report ID is invalid.");
    }

    enforceAuditRateLimit(request, {
      scope: `request-report:${id}`,
      limit: 3,
      windowMs: 60 * 60 * 1000,
    });

    const parsedBody = reportRequestSchema.safeParse(
      await readBoundedJsonRequest(request, { maxBytes: 8_192 }),
    );

    if (!parsedBody.success) {
      throw new AuditApiError(
        400,
        "INVALID_REPORT_REQUEST",
        "Enter a valid name and email address.",
      );
    }

    // Silently accept automated honeypot submissions without storing PII or
    // sending email.
    if (parsedBody.data.website.trim()) {
      return auditDataResponse(
        {
          status: "sent",
          message: "If the request is valid, the report email will arrive shortly.",
        },
        202,
      );
    }

    const stored = await readAuditState(id);

    if (!stored) {
      throw new AuditApiError(404, "AUDIT_NOT_FOUND", "The audit could not be found.");
    }

    if (stored.state.status !== "completed") {
      throw new AuditApiError(
        409,
        "AUDIT_NOT_COMPLETE",
        "The audit must finish before the report can be emailed.",
      );
    }

    const storedResult = await readAuditResult(id, normalizeAuditResult);

    if (!storedResult) {
      throw new AuditApiError(
        503,
        "AUDIT_RESULT_UNAVAILABLE",
        "The completed report is temporarily unavailable. Please try again later.",
      );
    }

    const apiKey = process.env.RESEND_API_KEY;
    const fromEmail = process.env.EMAIL_FROM;
    const reportUrl = createReportUrl(id, request);
    const receiptBase = {
      auditId: id,
      name: parsedBody.data.name,
      email: parsedBody.data.email,
    } as const;

    if (!apiKey || !fromEmail) {
      await writeReportRequestReceipt({
        ...receiptBase,
        status: "failed",
      });

      throw new AuditApiError(
        503,
        "REPORT_EMAIL_UNAVAILABLE",
        "Report email delivery is temporarily unavailable. Your report link still works.",
        { headers: { "Retry-After": "60" } },
      );
    }

    const resend = new Resend(apiKey);
    const emailResult = await resend.emails
      .send(
        {
          from: fromEmail,
          to: parsedBody.data.email,
          subject: `Your ${siteConfig.name} website audit`,
          text: [
            `Hi ${parsedBody.data.name},`,
            "",
            "Your website audit is ready. Use the shareable report URL below to review the findings:",
            reportUrl,
            "",
            "This automated audit highlights measurable website signals and is not a guarantee of search rankings, conversions, or accessibility compliance.",
            "",
            siteConfig.name,
          ].join("\n"),
        },
        {
          idempotencyKey: createReportEmailIdempotencyKey(
            id,
            parsedBody.data.email,
          ),
        },
      )
      .catch((error: unknown) => ({ data: null, error }));

    if (emailResult.error || !emailResult.data?.id) {
      await writeReportRequestReceipt({
        ...receiptBase,
        status: "failed",
      });

      console.error("Website audit report email failed", {
        auditId: id,
        errorName:
          emailResult.error instanceof Error
            ? emailResult.error.name
            : "ProviderError",
      });

      throw new AuditApiError(
        503,
        "REPORT_EMAIL_UNAVAILABLE",
        "The report email could not be sent. Your report link still works.",
        { headers: { "Retry-After": "60" } },
      );
    }

    await writeReportRequestReceipt({
      ...receiptBase,
      status: "sent",
      providerMessageId: emailResult.data.id,
    });

    return auditDataResponse(
      {
        status: "sent",
        message: "Your report link has been sent.",
        reportUrl,
      },
      201,
    );
  } catch (error) {
    logUnexpectedAuditApiError(
      "request-report",
      error,
      isValidAuditId(id) ? id : undefined,
    );
    return auditErrorResponse(error);
  }
}
