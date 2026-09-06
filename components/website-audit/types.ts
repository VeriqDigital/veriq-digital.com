import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "@/lib/website-audit/methodology";
import { getCategoryScoreDisplay } from "@/lib/website-audit/evidence-policy";
import type { AuditCategoryScore } from "@/lib/website-audit/model";

export type {
  AuditCategoryScore,
  AuditEvidenceLevel,
  AuditFinding,
  AuditSeverity,
  AuditSummary,
  AuditSupportingMetric,
  NormalizedScore,
  WebsiteAuditResult,
} from "@/lib/website-audit/model";
export type { AuditCategoryId } from "@/lib/website-audit/categories";

export const getScoreInterpretation = (score: number, methodologyVersion: string = CURRENT_AUDIT_METHODOLOGY_VERSION) => {
  if (methodologyVersion !== CURRENT_AUDIT_METHODOLOGY_VERSION) return "Historical score";
  if (score >= 90) return "Strong automated foundations";
  if (score >= 80) return "Generally strong foundations";
  if (score >= 70) return "Mixed foundations";
  if (score >= 50) return "Needs attention";
  return "Significant issues detected";
};

export const automatedScoreScope =
  "This score reflects automated technical and structural checks. It does not grade visual design, branding, copy quality, or overall persuasiveness.";

export const evidenceWeightedScoreScope =
  "Category influence is scaled by evidence coverage. Unavailable checks do not count as failures.";

export function getCategoryScorePresentation(category: AuditCategoryScore, methodologyVersion: string) {
  if (!category.available || category.score === null) {
    return { display: "unavailable" as const, showNumeric: false, interpretation: "Unavailable", summary: category.summary };
  }
  const display = methodologyVersion === CURRENT_AUDIT_METHODOLOGY_VERSION
    ? getCategoryScoreDisplay(category.evidenceCoverage) : "normal";
  if (display === "normal") {
    return { display, showNumeric: true, interpretation: getScoreInterpretation(category.score, methodologyVersion), summary: category.summary };
  }
  const confirmed = category.hasConfirmedMaterialIssue === true;
  if (display === "withheld") {
    const completed = confirmed
      ? "A confirmed issue was detected; see the findings below."
      : category.score >= 90
        ? "The completed checks performed well."
        : "The completed checks found potential weaknesses.";
    return {
      display, showNumeric: false,
      interpretation: confirmed ? "Limited evidence, with a confirmed issue detected" : "Limited evidence",
      summary: `Only ${category.evidenceCoverage}% of this category could be evaluated. ${completed} There is not enough evidence for a reliable category rating.`,
    };
  }
  const performance = category.score >= 80 ? "Strong" : category.score >= 70 ? "Mixed" : "Weak";
  return {
    display, showNumeric: true,
    interpretation: `${performance} results in completed checks · Limited evidence${confirmed ? " · Confirmed issue detected" : ""}`,
    summary: `${category.evidenceCoverage}% of this category was evaluated. This rating describes completed checks only.${confirmed ? " A confirmed issue was detected; see the findings below." : ""}`,
  };
}

export const getEvidenceConfidence = (coverage: number) => {
  if (coverage >= 85) return "High confidence";
  if (coverage >= 60) return "Moderate confidence";
  return "Limited confidence";
};
