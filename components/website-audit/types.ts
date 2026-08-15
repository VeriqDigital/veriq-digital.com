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
  if (score >= 90) return "Excellent";
  if (score >= 80) return "Good";
  if (score >= 70) return "Fair";
  if (score >= 50) return "Needs work";
  return "Significant issues";
};

export const getEvidenceConfidence = (coverage: number) => {
  if (coverage >= 85) return "High confidence";
  if (coverage >= 60) return "Moderate confidence";
  return "Limited confidence";
};
