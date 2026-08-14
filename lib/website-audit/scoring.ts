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

  if (score >= 80) {
    return "Generally healthy, with a few worthwhile improvements.";
  }

  if (score >= 70) {
    return "A fair foundation with some meaningful improvements needed.";
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

  if (score >= 80) {
    return "The website is generally healthy, with a focused set of improvements worth addressing.";
  }

  if (score >= 70) {
    return "The website has a fair foundation, with meaningful improvements needed in measured areas.";
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
  const totalWeight = categoryChecks.reduce(
    (total, check) => total + check.weight,
    0,
  );
  const evidenceCoverage =
    totalWeight > 0 ? toNormalizedScore((availableWeight / totalWeight) * 100) : 0;
  const rawScore =
    availableWeight > 0
      ? availableChecks.reduce(
          (total, check) => total + (check.score ?? 0) * check.weight,
          0,
        ) / availableWeight
      : null;
  const categoryFindings = availableChecks.flatMap((check) =>
    check.finding ? [check.finding] : [],
  );
  let score =
    rawScore === null
      ? null
      : rawScore * (evidenceCoverage / 100) +
        65 * (1 - evidenceCoverage / 100);

  if (score !== null) {
    const ceilings = [100];

    if (evidenceCoverage < 100 || availableChecks.length < 3) ceilings.push(89);
    if (categoryId === "conversion-ux") ceilings.push(85);
    if (categoryFindings.some((finding) => finding.severity === "high")) {
      ceilings.push(79);
    }
    if (categoryFindings.some((finding) => finding.severity === "critical")) {
      ceilings.push(49);
    }
    score = toNormalizedScore(Math.min(score, ...ceilings));
  }

  return {
    id: categoryId,
    available: score !== null,
    score,
    evidenceLevel:
      evidenceCoverage === 0
        ? "unavailable"
        : evidenceCoverage === 100
          ? "full"
          : "partial",
    evidenceCoverage,
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
 * Scoring methodology v2:
 * - Each check declares a positive weight and a normalized 0–100 result.
 * - Missing evidence reduces coverage and pulls partial results toward a
 *   conservative evidence prior; it is never scored as zero or perfect.
 * - Sparse and partial categories cannot score 90+, while critical/high
 *   findings apply centralized severity ceilings.
 * - The overall score uses explicit category weights and total evidence
 *   coverage so unavailable data cannot make an excellent score easier.
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
  const totalOverallWeight = auditCategoryRegistry.reduce(
    (total, category) => total + category.overallWeight,
    0,
  );
  const evidenceCoverage = toNormalizedScore(
    (categoryScores.reduce((total, category) => {
      const categoryWeight = auditCategoryRegistry.find(
        (entry) => entry.id === category.id,
      )!.overallWeight;

      return total + categoryWeight * (category.evidenceCoverage / 100);
    }, 0) /
      totalOverallWeight) *
      100,
  );

  if (availableOverallWeight === 0) {
    throw new TypeError("An audit result requires at least one scored category.");
  }

  const rawOverallScore =
    availableCategories.reduce((total, category) => {
      const categoryWeight = auditCategoryRegistry.find(
        (entry) => entry.id === category.id,
      )!.overallWeight;

      return total + category.score * categoryWeight;
    }, 0) / availableOverallWeight;
  const hasCriticalFinding = normalizedChecks.some(
    (check) => check.finding?.severity === "critical",
  );
  const overallScore = toNormalizedScore(
    Math.min(
      rawOverallScore * (evidenceCoverage / 100) +
        65 * (1 - evidenceCoverage / 100),
      hasCriticalFinding ? 79 : 100,
    ),
  );
  const findings = prioritizeFindings(normalizedChecks);
  const allFindings = normalizedChecks.flatMap((check) =>
    check.finding ? [check.finding] : [],
  );
  const limitedCategories = categoryScores.filter(
    (category) => category.evidenceLevel !== "full",
  );
  const coverageNotices = limitedCategories.map((category) => {
    const label = auditCategoryRegistry.find(
      (entry) => entry.id === category.id,
    )!.label;

    return category.evidenceLevel === "unavailable"
      ? `${label} was unavailable and reduced overall evidence coverage rather than being scored as zero or perfect.`
      : `${label} was partially evaluated (${category.evidenceCoverage}% evidence coverage); its score reflects reduced confidence.`;
  });

  return normalizeAuditResult({
    id,
    status: "complete",
    auditedUrl,
    createdAt,
    completedAt,
    overallScore,
    evidenceCoverage,
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
    notices: [...new Set([...notices, ...coverageNotices])].slice(0, 8),
    methodologyVersion: "v2",
  });
}
