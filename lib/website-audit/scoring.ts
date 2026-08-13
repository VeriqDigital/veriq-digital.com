import { auditCategoryRegistry } from "./categories";
import type { AuditCategoryId } from "./categories";
import type {
  AuditCategoryScore,
  AuditCheckResult,
  AuditFinding,
  AuditSeverity,
  WebsiteAuditResult,
} from "./model";
import { normalizeAuditResult, toNormalizedScore } from "./result-schema";

const severityPriority: Record<AuditSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  opportunity: 4,
  passed: 5,
};

const summarizeCategory = (score: number | null) => {
  if (score === null) {
    return "This category could not be measured during this audit.";
  }

  if (score >= 90) {
    return "Strong measurable foundations with only minor issues detected.";
  }

  if (score >= 75) {
    return "Generally healthy, with a few worthwhile improvements.";
  }

  if (score >= 50) {
    return "Several measurable issues are limiting this area.";
  }

  return "High-impact measurable issues need attention in this area.";
};

const summarizeOverall = (score: number) => {
  if (score >= 90) {
    return "The checks completed in this audit found a strong website foundation with only minor opportunities.";
  }

  if (score >= 75) {
    return "The website is generally healthy, with a focused set of improvements worth addressing.";
  }

  if (score >= 50) {
    return "The website has a workable foundation, but several measurable issues are limiting visibility, usability, or customer action.";
  }

  return "The audit found high-impact issues that should be addressed before lower-priority improvements.";
};

const normalizeCheck = (check: AuditCheckResult): AuditCheckResult => {
  if (!Number.isFinite(check.weight) || check.weight <= 0) {
    throw new TypeError(`Audit check ${check.id} must have a positive weight.`);
  }

  if (check.status === "unavailable") {
    if (check.score !== null) {
      throw new TypeError(`Unavailable audit check ${check.id} cannot have a score.`);
    }

    return check;
  }

  if (check.score === null || !Number.isFinite(check.score)) {
    throw new TypeError(`Audit check ${check.id} must have a finite score.`);
  }

  return { ...check, score: toNormalizedScore(check.score) };
};

const scoreCategory = (
  categoryId: AuditCategoryId,
  checks: readonly AuditCheckResult[],
): AuditCategoryScore => {
  const categoryChecks = checks.filter((check) => check.category === categoryId);
  const availableChecks = categoryChecks.filter(
    (check) => check.status !== "unavailable" && check.score !== null,
  );
  const availableWeight = availableChecks.reduce(
    (total, check) => total + check.weight,
    0,
  );
  const score =
    availableWeight > 0
      ? toNormalizedScore(
          availableChecks.reduce(
            (total, check) => total + (check.score ?? 0) * check.weight,
            0,
          ) / availableWeight,
        )
      : null;

  return {
    id: categoryId,
    available: score !== null,
    score,
    summary: summarizeCategory(score),
    checksRun: availableChecks.length,
    checksUnavailable: categoryChecks.length - availableChecks.length,
  };
};

const prioritizeFindings = (checks: readonly AuditCheckResult[]) =>
  checks
    .flatMap((check) => (check.finding ? [check.finding] : []))
    .sort((left, right) => {
      const severityDifference =
        severityPriority[left.severity] - severityPriority[right.severity];

      if (severityDifference !== 0) return severityDifference;

      const leftCheck = checks.find((check) => check.finding?.id === left.id);
      const rightCheck = checks.find((check) => check.finding?.id === right.id);

      return (rightCheck?.weight ?? 0) - (leftCheck?.weight ?? 0);
    })
    .slice(0, 15) as readonly AuditFinding[];

type BuildAuditResultOptions = {
  id: string;
  auditedUrl: string;
  createdAt: string;
  completedAt: string;
  checks: readonly AuditCheckResult[];
  notices?: readonly string[];
};

/**
 * Scoring methodology v1:
 * - Each check declares a positive weight and a normalized 0–100 result.
 * - Unavailable checks are removed from their category denominator.
 * - Category scores are weighted means of available checks only.
 * - The overall score uses the registry's explicit category weights and
 *   reweights around any category with no available evidence.
 */
export function buildAuditResult({
  id,
  auditedUrl,
  createdAt,
  completedAt,
  checks,
  notices = [],
}: BuildAuditResultOptions): WebsiteAuditResult {
  const normalizedChecks = checks.map(normalizeCheck);
  const duplicateCheckIds = normalizedChecks.map((check) => check.id);

  if (new Set(duplicateCheckIds).size !== duplicateCheckIds.length) {
    throw new TypeError("Audit check IDs must be unique.");
  }

  const categoryScores = auditCategoryRegistry.map((category) =>
    scoreCategory(category.id, normalizedChecks),
  );
  const availableCategories = categoryScores.filter(
    (category): category is AuditCategoryScore & { score: number } =>
      category.available && category.score !== null,
  );
  const availableOverallWeight = availableCategories.reduce(
    (total, category) =>
      total +
      auditCategoryRegistry.find((entry) => entry.id === category.id)!
        .overallWeight,
    0,
  );

  if (availableOverallWeight === 0) {
    throw new TypeError("An audit result requires at least one scored category.");
  }

  const overallScore = toNormalizedScore(
    availableCategories.reduce((total, category) => {
      const categoryWeight = auditCategoryRegistry.find(
        (entry) => entry.id === category.id,
      )!.overallWeight;

      return total + category.score * categoryWeight;
    }, 0) / availableOverallWeight,
  );
  const findings = prioritizeFindings(normalizedChecks);
  const allFindings = normalizedChecks.flatMap((check) =>
    check.finding ? [check.finding] : [],
  );
  const unavailableCategories = categoryScores.filter(
    (category) => !category.available,
  );
  const coverageNotices = unavailableCategories.map((category) => {
    const label = auditCategoryRegistry.find(
      (entry) => entry.id === category.id,
    )!.label;

    return `${label} was not included in the overall score because no reliable measurement was available.`;
  });

  return normalizeAuditResult({
    id,
    status: "complete",
    auditedUrl,
    createdAt,
    completedAt,
    overallScore,
    overallSummary: summarizeOverall(overallScore),
    categoryScores,
    summary: {
      criticalIssues: allFindings.filter(
        (finding) => finding.severity === "critical",
      ).length,
      improvements: allFindings.filter((finding) =>
        ["high", "medium", "low"].includes(finding.severity),
      ).length,
      opportunities: allFindings.filter(
        (finding) => finding.severity === "opportunity",
      ).length,
      passedChecks: normalizedChecks.filter(
        (check) => check.status === "passed",
      ).length,
    },
    findings,
    notices: [...new Set([...notices, ...coverageNotices])],
    methodologyVersion: "v1",
  });
}
