export type {
  AuditCategoryScore,
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
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Poor";
};
