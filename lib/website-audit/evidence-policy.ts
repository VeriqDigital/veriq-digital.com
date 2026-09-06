import { getAuditCategory } from "./categories";
import { getWeakestCategoryHealthCap } from "./health-constraints";
import type { AuditCategoryScore } from "./model";

export const categoryEvidenceThresholds = Object.freeze({ normal: 70, numeric: 40 });

export function getCategoryScoreDisplay(coverage: number): "normal" | "limited" | "withheld" {
  if (coverage >= categoryEvidenceThresholds.normal) return "normal";
  if (coverage >= categoryEvidenceThresholds.numeric) return "limited";
  return "withheld";
}

export const getEvidenceCoverageFactor = (coverage: number) =>
  Number.isFinite(coverage) ? Math.min(1, Math.max(0, coverage / 100)) : 0;

export const getEffectiveCategoryWeight = (configuredWeight: number, coverage: number) =>
  configuredWeight * getEvidenceCoverageFactor(coverage);

/** Missing evidence reduces voting weight, never a category's measured score. */
export function getEvidenceWeightedOverallScore(categories: readonly AuditCategoryScore[]): number {
  let weight = 0;
  let weightedScore = 0;
  for (const category of categories) {
    if (!category.available || category.score === null) continue;
    const effectiveWeight = getEffectiveCategoryWeight(getAuditCategory(category.id).overallWeight, category.evidenceCoverage);
    weight += effectiveWeight;
    weightedScore += category.score * effectiveWeight;
  }
  if (weight === 0) throw new TypeError("An audit result requires at least one scored category with nonzero evidence coverage.");
  return weightedScore / weight;
}

/** Generic ceilings reach their existing strength at normal-rating coverage.
 * Below it, interpolate continuously from no constraint (100). Explicit
 * confirmed material caps and their root-group constraints do not use this.
 */
export function getEvidenceAwareCategoryHealthCap(score: number, coverage: number): number {
  const strength = Math.min(1, getEvidenceCoverageFactor(coverage) * 100 / categoryEvidenceThresholds.normal);
  return 100 - (100 - getWeakestCategoryHealthCap(score)) * strength;
}
