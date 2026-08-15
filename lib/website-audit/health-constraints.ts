// Central semantic ceilings for confirmed defects. Checks opt in explicitly;
// severity labels alone never activate an overall health constraint.
export const healthConstraintCaps = Object.freeze({
  catastrophic: 59,
  fundamentalVisibility: 79,
  majorCustomerExperience: 88,
  moderateMaterialDefect: 93,
  incompletePerfection: 99,
});

export const materialCategoryGuardrail = 89;

// Independent root causes tighten a non-catastrophic constraint modestly.
// Correlated findings share a penaltyGroup and therefore count only once.
export const independentMaterialGroupStep = 3;
export const maximumIndependentGroupAdjustment = 6;
