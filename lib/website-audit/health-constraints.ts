// Central semantic ceilings for confirmed defects. Checks opt in explicitly;
// severity labels alone never activate an overall health constraint.
export const healthConstraintCaps = Object.freeze({
  catastrophic: 59,
  fundamentalVisibility: 79,
  majorCustomerExperience: 88,
  moderateMaterialDefect: 93,
  incompletePerfection: 99,
});

/**
 * Weighted scoring measures breadth, while this ceiling prevents a confirmed
 * failure in one major system from being hidden by unrelated perfect areas.
 */
export function getMaterialCategoryHealthCap(categoryScore: number): number {
  if (!Number.isFinite(categoryScore)) {
    throw new TypeError("Material category scores must be finite.");
  }

  if (categoryScore >= 90) return 100;
  if (categoryScore >= 80) return 94;
  if (categoryScore >= 70) return 89;
  if (categoryScore >= 60) return 84;
  if (categoryScore >= 50) return 79;
  return 74;
}

export function getAdditionalWeakCategoryAdjustment(
  categoryScore: number,
): number {
  if (categoryScore < 50) return 5;
  if (categoryScore < 60) return 4;
  if (categoryScore < 70) return 3;
  return 2;
}

export const maximumWeakCategoryBreadthAdjustment = 10;

// Independent root causes tighten a non-catastrophic constraint modestly.
// Correlated findings share a penaltyGroup and therefore count only once.
export const independentMaterialGroupStep = 3;
export const maximumIndependentGroupAdjustment = 6;
