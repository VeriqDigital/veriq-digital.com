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

export const getScoreInterpretation = (score: number) => {
  if (score >= 90) return "Strong automated foundations";
  if (score >= 80) return "Generally strong foundations";
  if (score >= 70) return "Mixed foundations";
  if (score >= 50) return "Needs attention";
  return "Significant issues detected";
};

export const automatedScoreScope =
  "This score reflects automated technical and structural checks. It does not grade visual design, branding, copy quality, or overall persuasiveness.";

export const getEvidenceConfidence = (coverage: number) => {
  if (coverage >= 85) return "High confidence";
  if (coverage >= 60) return "Moderate confidence";
  return "Limited confidence";
};
