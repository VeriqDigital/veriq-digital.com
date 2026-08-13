export const coreAuditCategoryIds = [
  "seo",
  "performance",
  "mobile-experience",
  "accessibility",
  "conversion-ux",
  "technical-health",
] as const;

export type CoreAuditCategoryId = (typeof coreAuditCategoryIds)[number];

// Additional categories, such as Local SEO, can be added without reshaping a report.
export type AuditCategoryId = CoreAuditCategoryId | "local-seo";

export type AuditSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "opportunity"
  | "passed";

export type NormalizedScore = number;

export type AuditCategoryScore = {
  id: AuditCategoryId;
  label: string;
  score: NormalizedScore;
  summary: string;
};

export type AuditSupportingMetric = {
  label: string;
  value: string;
  context?: string;
};

export type AuditFinding = {
  id: string;
  category: AuditCategoryId;
  categoryLabel: string;
  severity: AuditSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
  observedValue?: string;
  recommendedValue?: string;
  supportingMetric?: AuditSupportingMetric;
};

export type AuditSummary = {
  criticalIssues: number;
  improvements: number;
  opportunities: number;
  passedChecks: number;
};

export type WebsiteAuditResult = {
  id: string;
  status: "demo" | "complete";
  auditedUrl: string;
  createdAt: string;
  overallScore: NormalizedScore;
  overallSummary: string;
  categoryScores: AuditCategoryScore[];
  summary: AuditSummary;
  findings: AuditFinding[];
};

export const clampNormalizedScore = (score: number): NormalizedScore =>
  Math.min(100, Math.max(0, Math.round(score)));

export const getScoreInterpretation = (score: NormalizedScore) => {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 50) return "Needs improvement";
  return "Poor";
};
