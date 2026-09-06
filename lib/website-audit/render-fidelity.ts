import type {
  AuditCheckResult, RenderFidelity, RenderFidelityMetrics, RenderFidelityReason,
} from "./model";

export const renderEvidenceConfidence = Object.freeze({
  high: 1, moderate: 0.7, lowCorroborated: 0.5,
});

// Eight removed executable scripts/handlers indicate substantial client behavior.
// This counts dependency signals, not code complexity or proven layout changes.
const substantialRemovedJavaScriptCount = 8;

export const renderFidelityNotice =
  "Some rendered mobile checks have reduced confidence because the site could not be fully reproduced within the audit's secure rendering limits.";

export const createRenderFidelityMetrics = (): RenderFidelityMetrics => ({
  scriptsRemoved: 0, executableScriptsRemoved: 0, inlineHandlersRemoved: 0,
  embeddedDocumentsRemoved: 0, sourceTextCharacters: 0,
  sourceStructurallyComplete: false,
  stylesheets: { requested: 0, fulfilled: 0, blocked: 0, failed: 0 },
  images: { requested: 0, fulfilled: 0, blocked: 0, failed: 0 },
  crossOriginStylesheetsBlocked: 0,
  stylesheetLimitReached: false, imageLimitReached: false,
  stylesheetByteLimitReached: false, imageByteLimitReached: false,
  totalByteLimitReached: false, fulfilledBytes: 0,
});

/** CSS requests include imports. Missing images alone cannot establish CSS loss.
 * Source completeness is a conservative proxy, not proof of hydration behavior.
 * Neither overflow magnitude nor PageSpeed availability determines fidelity.
 */
export function assessRenderFidelity(input: RenderFidelityMetrics): RenderFidelity {
  const bounded = (value: number) => Number.isFinite(value)
    ? Math.min(10_000_000, Math.max(0, Math.round(value))) : 0;
  const resource = (value: RenderFidelityMetrics["stylesheets"]) => ({
    requested: bounded(value.requested), fulfilled: bounded(value.fulfilled),
    blocked: bounded(value.blocked), failed: bounded(value.failed),
  });
  const metrics = Object.fromEntries(Object.entries(input).map(([key, value]) => [
    key, typeof value === "number" ? bounded(value) : value,
  ])) as RenderFidelityMetrics;
  metrics.stylesheets = resource(input.stylesheets);
  metrics.images = resource(input.images);
  const reasons: RenderFidelityReason[] = [];
  const cssLost = Math.max(0, metrics.stylesheets.requested - metrics.stylesheets.fulfilled);
  const cssLossShare = cssLost / Math.max(1, metrics.stylesheets.requested);
  if (cssLost > 0) reasons.push("stylesheet_loss");
  if (metrics.crossOriginStylesheetsBlocked > 0) reasons.push("cross_origin_stylesheets");
  if (metrics.stylesheetLimitReached) reasons.push("stylesheet_count_limit");
  if (metrics.stylesheetByteLimitReached) reasons.push("stylesheet_byte_limit");
  if (metrics.totalByteLimitReached) reasons.push("total_byte_limit");
  const removedJavaScriptCount = metrics.executableScriptsRemoved + metrics.inlineHandlersRemoved;
  const substantialJavaScript = removedJavaScriptCount >= substantialRemovedJavaScriptCount;
  const dynamicUncertainty = substantialJavaScript ||
    (!metrics.sourceStructurallyComplete && removedJavaScriptCount > 0);
  if (dynamicUncertainty) reasons.push("dynamic_layout_uncertainty");
  if (metrics.embeddedDocumentsRemoved > 0) reasons.push("embedded_content_removed");
  const low = metrics.stylesheetLimitReached || metrics.stylesheetByteLimitReached ||
    (cssLost > 0 && (cssLossShare >= 0.25 || metrics.totalByteLimitReached)) ||
    (!metrics.sourceStructurallyComplete && substantialJavaScript) ||
    (dynamicUncertainty && cssLost > 0);
  // An embedded document has its own layout. Its removal alone does not prove
  // that unrelated top-level geometry is unrepresentative; retain the diagnostic.
  const globallyUncertain = reasons.some((reason) => reason !== "embedded_content_removed");
  // Image-only total-byte exhaustion is at most moderate, never low.
  return { level: low ? "low" : globallyUncertain ? "moderate" : "high", reasons, metrics };
}

const potentialTitles: Record<string, string> = {
  "mobile-rendered-width": "Potential horizontal overflow in the restricted mobile render",
  "mobile-rendered-important-content": "Potential clipped content in the restricted mobile render",
  "mobile-rendered-images": "Potential image overflow in the restricted mobile render",
  "mobile-rendered-controls": "Potential small controls in the restricted mobile render",
  "mobile-rendered-text-size": "Potential small text in the restricted mobile render",
  "conversion-mobile-action-usability": "Potential customer action difficulty in the restricted mobile render",
  "technical-image-dimensions": "Image layout space could not be verified reliably",
};

/** Apply only to render-dependent checks. Independent source/provider checks keep
 * their existing scores and caps. Corroboration supports a likely defect, never
 * the synthetic magnitude or a hard cap on a reconstruction with uncertain CSS.
 */
export function applyRenderFidelity(
  check: AuditCheckResult,
  fidelity: RenderFidelity,
  corroboration?: string,
): AuditCheckResult {
  if (!(check.id in potentialTitles) || fidelity.level === "high" || check.status === "unavailable") return check;
  const supportedFailure = check.status === "failed" && Boolean(corroboration);
  const unavailable = fidelity.level === "low" && !supportedFailure;
  const context = check.id === "mobile-rendered-width"
    ? "The restricted mobile render showed potential horizontal overflow, but the page could not be reproduced with enough fidelity to confirm this as a user-facing defect."
    : "The restricted mobile render showed a potential issue, but reproduction fidelity is insufficient to confirm it as a user-facing defect.";
  return {
    ...check,
    status: unavailable ? "unavailable" : check.status,
    score: unavailable ? null : check.score,
    evidenceConfidence: unavailable ? 0 : Math.min(check.evidenceConfidence ?? 1,
      fidelity.level === "moderate" ? renderEvidenceConfidence.moderate : renderEvidenceConfidence.lowCorroborated),
    categoryScoreCap: undefined,
    overallScoreCap: undefined,
    finding: check.finding ? {
      ...check.finding,
      impact: unavailable || check.finding.impact === "informational" ? "informational" : "likely",
      severity: unavailable ? "opportunity" : check.finding.severity === "critical" || check.finding.severity === "high" ? "medium" : check.finding.severity,
      title: potentialTitles[check.id],
      explanation: `${context} Render fidelity: ${fidelity.level}.${supportedFailure ? ` ${corroboration} This supports a likely issue, but does not verify its rendered magnitude.` : ""}`,
      observedValue: (check.finding.observedValue ?? check.finding.explanation).replaceAll("confirmed", "rendered"),
      recommendation: "Check this measurement on the live page at common phone widths before deciding whether a layout fix is needed.",
    } : undefined,
  };
}
