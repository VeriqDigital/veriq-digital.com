import { buildAuditChecks } from "./checks";
import { completeWebsiteCrawl, fetchPrimaryAuditPage } from "./crawler";
import type { WebsiteAuditResult } from "./model";
import { runPageSpeedAudit } from "./providers/pagespeed";
import { buildAuditResult } from "./scoring";

const auditDeadlineMs = 45_000;

const getErrorCode = (error: unknown) =>
  error instanceof Error &&
  "code" in error &&
  typeof error.code === "string"
    ? error.code
    : undefined;

const runAuditStage = async <T>(
  auditId: string,
  stage: string,
  operation: () => Promise<T>,
  describe: (value: T) => Readonly<Record<string, unknown>> = () => ({}),
) => {
  const startedAt = Date.now();

  try {
    const value = await operation();
    console.info("Website audit stage completed", {
      auditId,
      stage,
      durationMs: Date.now() - startedAt,
      ...describe(value),
    });
    return value;
  } catch (error) {
    console.warn("Website audit stage failed", {
      auditId,
      stage,
      durationMs: Date.now() - startedAt,
      errorName: error instanceof Error ? error.name : "UnknownError",
      code: getErrorCode(error),
    });
    throw error;
  }
};

export type RunWebsiteAuditOptions = Readonly<{
  id: string;
  submittedUrl: string;
  createdAt: string;
  signal?: AbortSignal;
  pageSpeedApiKey?: string;
  now?: () => Date;
}>;

/**
 * Request-bound v1 job boundary. The caller owns state transitions and durable
 * storage; this function owns the bounded crawl, provider work, and scoring.
 * It can move behind a queue later without changing the result contract.
 */
export async function runWebsiteAudit({
  id,
  submittedUrl,
  createdAt,
  signal: parentSignal,
  pageSpeedApiKey = process.env.GOOGLE_PAGESPEED_API_KEY,
  now = () => new Date(),
}: RunWebsiteAuditOptions): Promise<WebsiteAuditResult> {
  const auditStartedAt = Date.now();
  const deadlineSignal = AbortSignal.timeout(auditDeadlineMs);
  const signal = parentSignal
    ? AbortSignal.any([parentSignal, deadlineSignal])
    : deadlineSignal;

  // Direct retrieval and public-IP pinning must succeed before the URL is
  // shared with PageSpeed Insights.
  const primary = await runAuditStage(
    id,
    "primary-crawl",
    () => fetchPrimaryAuditPage(submittedUrl, signal),
    (value) => ({ redirectCount: value.redirectCount }),
  );
  const [crawl, pageSpeed] = await Promise.all([
    runAuditStage(
      id,
      "first-party-crawl",
      () => completeWebsiteCrawl(primary, signal),
      (value) => ({
        pagesAnalyzed: value.pages.length,
        linksTested: value.brokenLinks.tested,
      }),
    ),
    runAuditStage(
      id,
      "pagespeed-mobile",
      () =>
        runPageSpeedAudit(primary.finalUrl, {
          apiKey: pageSpeedApiKey,
          signal,
        }),
      (value) => ({
        available: value.available,
        reason: value.available ? undefined : value.reason,
      }),
    ),
  ]);
  const { checks, notices } = buildAuditChecks(crawl, pageSpeed);
  const result = buildAuditResult({
    id,
    auditedUrl: primary.finalUrl,
    createdAt,
    completedAt: now().toISOString(),
    checks,
    notices,
  });

  console.info("Website audit engine completed", {
    auditId: id,
    durationMs: Date.now() - auditStartedAt,
    checksEvaluated: checks.length,
    findingsReturned: result.findings.length,
  });
  return result;
}
