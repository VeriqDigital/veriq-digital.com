import type { AuditCategoryId } from "./categories";

export type AuditSeverity =
  | "critical"
  | "high"
  | "medium"
  | "low"
  | "opportunity"
  | "passed";

export type NormalizedScore = number;

export type AuditEvidenceLevel = "full" | "partial" | "unavailable";

export type AuditFindingImpact =
  | "confirmed"
  | "likely"
  | "informational";

export type AuditCategoryScore = Readonly<{
  id: AuditCategoryId;
  available: boolean;
  score: NormalizedScore | null;
  evidenceLevel: AuditEvidenceLevel;
  evidenceCoverage: NormalizedScore;
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
  impact: AuditFindingImpact;
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
  evidenceCoverage: NormalizedScore;
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
  evidenceConfidence?: number;
  penaltyGroup?: string;
  categoryScoreCap?: number;
  overallScoreCap?: number;
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

export type RenderedMobileMetrics = Readonly<{
  viewportWidth: number;
  documentWidth: number;
  horizontalOverflowPixels: number;
  horizontalScrollPixels: number;
  wideElementCount: number;
  fixedWidthElementCount: number;
  overflowingImageCount: number;
  intentionallyClippedImageCount: number;
  potentialOverflowElementCount: number;
  clippedImportantElementCount: number;
  potentiallyClippedImportantElementCount: number;
  clippedNavigation: boolean;
  offscreenPrimaryActionCount: number;
  primaryActionCount: number;
  seriousPrimaryActionCount: number;
  missingDimensionImageCount: number;
  unreservedImageCount: number;
  seriousTapTargetCount: number;
  interactiveControlCount: number;
  tinyTextCount: number;
  textSampleCount: number;
}>;

export type RenderResourceMetrics = {
  requested: number;
  fulfilled: number;
  blocked: number;
  failed: number;
};

export type RenderFidelityMetrics = {
  scriptsRemoved: number;
  executableScriptsRemoved: number;
  inlineHandlersRemoved: number;
  embeddedDocumentsRemoved: number;
  sourceTextCharacters: number;
  sourceStructurallyComplete: boolean;
  stylesheets: RenderResourceMetrics;
  images: RenderResourceMetrics;
  crossOriginStylesheetsBlocked: number;
  stylesheetLimitReached: boolean;
  imageLimitReached: boolean;
  stylesheetByteLimitReached: boolean;
  imageByteLimitReached: boolean;
  totalByteLimitReached: boolean;
  fulfilledBytes: number;
};

export type RenderFidelityReason =
  | "stylesheet_loss"
  | "cross_origin_stylesheets"
  | "stylesheet_count_limit"
  | "stylesheet_byte_limit"
  | "total_byte_limit"
  | "dynamic_layout_uncertainty"
  | "embedded_content_removed";

export type RenderFidelity = Readonly<{
  level: "high" | "moderate" | "low";
  reasons: readonly RenderFidelityReason[];
  metrics: Readonly<RenderFidelityMetrics>;
}>;

export type RenderedMobileData =
  | Readonly<{
      available: true;
      metrics: RenderedMobileMetrics;
      renderFidelity: RenderFidelity;
    }>
  | Readonly<{
      available: false;
      reason: "browser_unavailable" | "busy" | "timeout" | "render_error";
    }>;
