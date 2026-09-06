// Central semantic ceilings for confirmed defects. Checks opt in explicitly;
// severity labels alone never activate an overall health constraint.
export const healthConstraintCaps = Object.freeze({
  catastrophic: 49,
  fundamentalVisibility: 69,
  fundamentalUsability: 69,
  majorCustomerExperience: 79,
  moderateMaterialDefect: 93,
  incompletePerfection: 99,
});

/**
 * A measured weak category constrains overall health even without an explicit
 * material cap. Apply only to available scores; evidence coverage stays separate.
 * These monotonic bands are ceilings, never bonuses or minimum-category scores.
 */
export function getWeakestCategoryHealthCap(categoryScore: number): number {
  if (!Number.isFinite(categoryScore)) {
    throw new TypeError("Category scores must be finite.");
  }

  if (categoryScore >= 90) return 100;
  if (categoryScore >= 80) return 92;
  if (categoryScore >= 70) return 86;
  if (categoryScore >= 60) return 79;
  if (categoryScore >= 50) return 72;
  return 66;
}

export const categoryConstraintCaps = Object.freeze({
  fundamentalMobile: 49,
  missingViewport: 59,
  missingCustomerPath: 59,
  majorUsability: 69,
});

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
