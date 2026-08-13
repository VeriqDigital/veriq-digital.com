export type FullReportRequest = Readonly<{
  auditId: string;
  name: string;
  email: string;
  website: string;
}>;

export type FullReportSubmissionResult =
  | Readonly<{ ok: true; message: string }>
  | Readonly<{ ok: false; message: string }>;

const auditIdPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export async function submitFullReportRequest(
  request: FullReportRequest,
): Promise<FullReportSubmissionResult> {
  const name = request.name.trim();
  const email = request.email.trim();

  if (!auditIdPattern.test(request.auditId)) {
    return { ok: false, message: "This report link is not valid." };
  }

  if (!name || name.length > 120) {
    return { ok: false, message: "Enter your name using 120 characters or fewer." };
  }

  if (!email || email.length > 254) {
    return { ok: false, message: "Enter a valid email address." };
  }

  const response = await fetch(
    `/api/website-audits/${request.auditId}/report-request`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        email,
        website: request.website,
      }),
      cache: "no-store",
    },
  ).catch(() => null);

  if (!response) {
    return {
      ok: false,
      message: "Could not connect. Check your connection and try again.",
    };
  }

  const body = (await response.json().catch(() => null)) as unknown;

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : null;

    return {
      ok: false,
      message:
        error && typeof error.message === "string" && error.message.trim()
          ? error.message
          : response.status === 429
            ? "Too many requests were sent. Please wait and try again."
            : "The report email could not be sent. Please try again.",
    };
  }

  if (
    !isRecord(body) ||
    !isRecord(body.data) ||
    body.data.status !== "sent"
  ) {
    return {
      ok: false,
      message: "The report service returned an unexpected response. Please try again.",
    };
  }

  return {
    ok: true,
    message: "The report link is on its way. Check your inbox in a few minutes.",
  };
}
