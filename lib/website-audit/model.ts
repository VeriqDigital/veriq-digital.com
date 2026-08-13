import type { AuditCategoryId } from "./categories";

export type AuditSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "opportunity"
  | "passed";

export type NormalizedScore = number;

export type AuditCategoryScore = Readonly<{
  id: AuditCategoryId;
  available: boolean;
  score: NormalizedScore | null;
  summary: string;
  checksRun: number;
  checksUnavailable: number;
}>;

export type AuditSupportingMetric = Readonly<{
  label: string;
  value: string;
  context?: string;
}>;

export type AuditFinding = Readonly<{
  id: string;
  category: AuditCategoryId;
  severity: AuditSeverity;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
  observedValue?: string;
  recommendedValue?: string;
  supportingMetric?: AuditSupportingMetric;
}>;

export type AuditSummary = Readonly<{
  criticalIssues: number;
  improvements: number;
  opportunities: number;
  passedChecks: number;
}>;

export type WebsiteAuditResult = Readonly<{
  id: string;
  status: "demo" | "complete";
  auditedUrl: string;
  createdAt: string;
  completedAt?: string;
  overallScore: NormalizedScore;
  overallSummary: string;
  categoryScores: readonly AuditCategoryScore[];
  summary: AuditSummary;
  findings: readonly AuditFinding[];
  notices: readonly string[];
  methodologyVersion: string;
}>;

export type AuditCheckStatus =
  | "passed"
  | "failed"
  | "opportunity"
  | "unavailable";

export type AuditCheckResult = Readonly<{
  id: string;
  category: AuditCategoryId;
  weight: number;
  status: AuditCheckStatus;
  score: number | null;
  finding?: AuditFinding;
}>;

export type PageSpeedMetric = Readonly<{
  numericValue: number;
  displayValue?: string;
}>;

export type PageSpeedAuditData = Readonly<{
  available: true;
  performanceScore: number;
  accessibilityScore: number | null;
  seoScore: number | null;
  metrics: Readonly<{
    lcp?: PageSpeedMetric;
    cls?: PageSpeedMetric;
    inp?: PageSpeedMetric;
    fcp?: PageSpeedMetric;
    tbt?: PageSpeedMetric;
    speedIndex?: PageSpeedMetric;
  }>;
  audits: Readonly<Record<string, number | null>>;
}>;

export type PageSpeedUnavailable = Readonly<{
  available: false;
  reason: "not_configured" | "timeout" | "rate_limited" | "provider_error";
}>;

export type PageSpeedData = PageSpeedAuditData | PageSpeedUnavailable;

