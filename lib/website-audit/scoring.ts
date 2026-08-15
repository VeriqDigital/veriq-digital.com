import { auditCategoryRegistry } from "./categories";
import type { AuditCategoryId } from "./categories";
import type {
  AuditCategoryScore,
  AuditCheckResult,
  AuditFinding,
  AuditFindingImpact,
  AuditSeverity,
  WebsiteAuditResult,
} from "./model";
import {
  getAdditionalWeakCategoryAdjustment,
  getMaterialCategoryHealthCap,
  healthConstraintCaps,
  independentMaterialGroupStep,
  maximumIndependentGroupAdjustment,
  maximumWeakCategoryBreadthAdjustment,
} from "./health-constraints";
import { normalizeAuditResult, toNormalizedScore } from "./result-schema";

const severityPriority: Record<AuditSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  opportunity: 4,
  passed: 5,
};

const impactPriority: Record<AuditFindingImpact, number> = {
  confirmed: 0,
  likely: 1,
  informational: 2,
};

const impactDeductionFactor: Record<AuditFindingImpact, number> = {
  confirmed: 1,
  likely: 0.55,
  informational: 0.1,
};

const inferFindingImpact = (finding: AuditFinding): AuditFindingImpact =>
  finding.impact ??
  (finding.severity === "critical" || finding.severity === "high"
    ? "confirmed"
    : finding.severity === "opportunity" || finding.severity === "passed"
      ? "informational"
      : "likely");

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

  if (
    check.evidenceConfidence !== undefined &&
    (!Number.isFinite(check.evidenceConfidence) ||
      check.evidenceConfidence < 0 ||
      check.evidenceConfidence > 1)
  ) {
    throw new TypeError(
      `Audit check ${check.id} must have evidence confidence from 0 to 1.`,
    );
  }

  for (const [label, cap] of [
    ["category", check.categoryScoreCap],
    ["overall", check.overallScoreCap],
  ] as const) {
    if (
      cap !== undefined &&
      (!Number.isFinite(cap) || cap < 0 || cap > 100)
    ) {
      throw new TypeError(
        `Audit check ${check.id} has an invalid ${label} score cap.`,
      );
    }
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
  const totalWeight = categoryChecks.reduce(
    (total, check) => total + check.weight,
    0,
  );
  const evidenceCoverage =
    totalWeight > 0
      ? toNormalizedScore(
          (availableChecks.reduce(
            (total, check) =>
              total + check.weight * (check.evidenceConfidence ?? 1),
            0,
          ) /
            totalWeight) *
            100,
        )
      : 0;
  const groupedDeductions = new Map<string, number>();
  const groupedScoringWeights = new Map<string, number>();

  for (const availableCheck of availableChecks) {
    const rawDeduction =
      availableCheck.weight * (100 - (availableCheck.score ?? 100));
    const impact = availableCheck.finding
      ? inferFindingImpact(availableCheck.finding)
      : "confirmed";
    const deduction = rawDeduction * impactDeductionFactor[impact];
    const group = availableCheck.penaltyGroup ?? availableCheck.id;

    groupedDeductions.set(
      group,
      Math.max(groupedDeductions.get(group) ?? 0, deduction),
    );
    groupedScoringWeights.set(
      group,
      Math.max(groupedScoringWeights.get(group) ?? 0, availableCheck.weight),
    );
  }

  const scoringWeight = [...groupedScoringWeights.values()].reduce(
    (total, weight) => total + weight,
    0,
  );

  let score =
    scoringWeight > 0
      ? 100 -
        [...groupedDeductions.values()].reduce(
          (total, deduction) => total + deduction,
          0,
        ) /
          scoringWeight
      : null;

  if (score !== null) {
    const explicitCaps = availableChecks.flatMap((check) =>
      check.categoryScoreCap === undefined ? [] : [check.categoryScoreCap],
    );
    score = toNormalizedScore(Math.min(score, 100, ...explicitCaps));
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
      const impactDifference =
        impactPriority[inferFindingImpact(left)] -
        impactPriority[inferFindingImpact(right)];

      if (impactDifference !== 0) return impactDifference;

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
 * Scoring methodology v3:
 * - Each check declares a positive weight and a normalized 0–100 result.
 * - Impact controls scoring influence, so informational observations have only
 *   a tiny effect while confirmed harmful issues keep their full effect.
 * - Correlated checks share a penalty group and count only their strongest
 *   deduction instead of stacking every manifestation of one root condition.
 * - Unavailable evidence is excluded from score denominators. Coverage reports
 *   confidence separately and never pulls the health score toward a prior.
 * - Only checks with proven impact can declare explicit score caps; nominal
 *   severity alone does not impose a generic ceiling.
 * - Confirmed material caps are grouped by root cause. Independent material
 *   groups can tighten the strongest cap, while duplicate manifestations do not.
 * - Confirmed materially weak categories add a score-sensitive ceiling, so a
 *   severely broken system cannot be averaged away by unrelated perfect areas.
 * - A literal 100 requires complete evidence and no remaining findings. Missing
 *   evidence is not scored as failure; it only prevents a claim of perfection.
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
  const groupedMaterialCaps = new Map<string, number>();
  const materialGroupsByCategory = new Map<AuditCategoryId, Set<string>>();

  for (const check of normalizedChecks) {
    if (
      check.status !== "failed" ||
      check.overallScoreCap === undefined ||
      !check.finding ||
      inferFindingImpact(check.finding) !== "confirmed"
    ) {
      continue;
    }

    const group = check.penaltyGroup ?? check.id;
    groupedMaterialCaps.set(
      group,
      Math.min(groupedMaterialCaps.get(group) ?? 100, check.overallScoreCap),
    );
    const categoryGroups = materialGroupsByCategory.get(check.category) ??
      new Set<string>();
    categoryGroups.add(group);
    materialGroupsByCategory.set(check.category, categoryGroups);
  }

  const strongestExplicitMaterialCap = Math.min(
    100,
    ...groupedMaterialCaps.values(),
  );
  // Fundamental visibility and availability failures already dominate the
  // health classification; breadth adjustments are reserved for lesser caps.
  const independentGroupAdjustment =
    strongestExplicitMaterialCap >=
    healthConstraintCaps.fundamentalVisibility + 1
      ? Math.min(
          maximumIndependentGroupAdjustment,
          Math.max(0, groupedMaterialCaps.size - 1) *
            independentMaterialGroupStep,
        )
      : 0;
  const explicitMaterialConstraint =
    strongestExplicitMaterialCap - independentGroupAdjustment;
  const weakMaterialCategories = categoryScores
    .flatMap((category) => {
      const groups = materialGroupsByCategory.get(category.id);

      return category.score !== null && category.score < 90 && groups
        ? [{ score: category.score, groups }]
        : [];
    })
    .sort((left, right) => left.score - right.score);
  const countedWeakCategoryGroups = new Set<string>();
  let weakCategoryConstraint = 100;
  let weakCategoryBreadthAdjustment = 0;

  for (const weakCategory of weakMaterialCategories) {
    const introducesIndependentRoot = [...weakCategory.groups].some(
      (group) => !countedWeakCategoryGroups.has(group),
    );

    if (!introducesIndependentRoot) continue;

    if (countedWeakCategoryGroups.size === 0) {
      weakCategoryConstraint = getMaterialCategoryHealthCap(
        weakCategory.score,
      );
    } else {
      weakCategoryBreadthAdjustment +=
        getAdditionalWeakCategoryAdjustment(weakCategory.score);
    }

    for (const group of weakCategory.groups) {
      countedWeakCategoryGroups.add(group);
    }
  }

  weakCategoryConstraint -= Math.min(
    maximumWeakCategoryBreadthAdjustment,
    weakCategoryBreadthAdjustment,
  );
  const materialConstraint = Math.min(
    explicitMaterialConstraint,
    weakCategoryConstraint,
  );
  const allFindings = normalizedChecks.flatMap((check) =>
    check.finding ? [check.finding] : [],
  );
  const perfectScoreEligible =
    categoryScores.every((category) => category.evidenceLevel === "full") &&
    allFindings.length === 0;
  const perfectionConstraint = perfectScoreEligible
    ? 100
    : healthConstraintCaps.incompletePerfection;
  const overallScore = toNormalizedScore(
    Math.min(
      rawOverallScore,
      materialConstraint,
      perfectionConstraint,
    ),
  );
  const findings = prioritizeFindings(normalizedChecks);
  const limitedCategories = categoryScores.filter(
    (category) => category.evidenceLevel !== "full",
  );
  const coverageNotices = limitedCategories.map((category) => {
    const label = auditCategoryRegistry.find(
      (entry) => entry.id === category.id,
    )!.label;

    return category.evidenceLevel === "unavailable"
      ? `${label} was unavailable and reduced overall evidence coverage rather than being scored as zero or perfect.`
      : `${label} was partially evaluated (${category.evidenceCoverage}% evidence coverage). Its score uses completed checks only; confidence is lower.`;
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
    methodologyVersion: "v3",
  });
}
