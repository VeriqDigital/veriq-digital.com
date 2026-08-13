export type FullReportRequest = {
  auditId: string;
  name: string;
  email: string;
};

export type FullReportSubmissionResult = {
  ok: true;
  mode: "demo";
  message: string;
};

/**
 * Integration boundary for future report delivery. No personal information is
 * transmitted or persisted while the audit engine remains in demo mode.
 */
export function submitFullReportRequest(
  request: FullReportRequest,
): Promise<FullReportSubmissionResult> {
  void request;

  return Promise.resolve({
    ok: true,
    mode: "demo",
    message:
      "Report delivery is still in preview, so no information was sent or saved.",
  });
}
