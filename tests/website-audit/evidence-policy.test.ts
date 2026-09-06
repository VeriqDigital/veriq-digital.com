import assert from "node:assert/strict";
import test from "node:test";
import { getCategoryScorePresentation } from "../../components/website-audit/types";
import { auditCategoryRegistry } from "../../lib/website-audit/categories";
import { getCategoryScoreDisplay, getEffectiveCategoryWeight, getEvidenceAwareCategoryHealthCap, getEvidenceWeightedOverallScore } from "../../lib/website-audit/evidence-policy";
import { getWeakestCategoryHealthCap } from "../../lib/website-audit/health-constraints";
import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "../../lib/website-audit/methodology";
import type { AuditCategoryScore, AuditCheckResult } from "../../lib/website-audit/model";
import { normalizeAuditResult } from "../../lib/website-audit/result-schema";
import { buildAuditResult } from "../../lib/website-audit/scoring";

const build = (checks: readonly AuditCheckResult[]) => buildAuditResult({
  id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2", auditedUrl: "https://example.com/",
  createdAt: "2026-08-12T12:00:00.000Z", completedAt: "2026-08-12T12:00:10.000Z", checks,
});
const profileChecks = (scores: readonly number[], coverage: readonly number[]): AuditCheckResult[] =>
  auditCategoryRegistry.map((category, index) => ({
    id: category.id, category: category.id, weight: 10, status: "passed",
    score: scores[index], evidenceConfidence: coverage[index] / 100,
  }));
const mobileResult = (score: number, coverage: number, material = false) => {
  const checks = profileChecks([100, 100, score, 100, 100, 100], [100, 100, coverage, 100, 100, 100]);
  if (material) checks[2] = {
    ...checks[2], status: "failed", overallScoreCap: 49, categoryScoreCap: 49, penaltyGroup: "mobile-layout",
    finding: { id: "confirmed-overflow", category: "mobile-experience", severity: "critical", impact: "confirmed",
      title: "Confirmed catastrophic overflow", explanation: "Measured content exceeds the viewport.",
      whyItMatters: "Essential content cannot be reached.", recommendation: "Fix the layout and verify the viewport." },
  };
  return build(checks);
};
const presentation = (category: AuditCategoryScore) => getCategoryScorePresentation(category, CURRENT_AUDIT_METHODOLOGY_VERSION);

for (const [coverage, display] of [[100, "normal"], [75, "normal"], [55, "limited"], [25, "withheld"]] as const) {
  test(`a perfect completed-check score at ${coverage}% coverage has ${display} presentation and proportional influence`, () => {
    const result = mobileResult(100, coverage);
    const mobile = result.categoryScores[2];
    assert.equal(mobile.score, 100);
    assert.equal(mobile.available, true);
    const view = presentation(mobile);
    assert.equal(view.display, display);
    assert.equal(view.showNumeric, coverage >= 40);
    assert.equal(getEffectiveCategoryWeight(15, coverage), 15 * coverage / 100);
    if (display === "normal") assert.equal(view.interpretation, "Strong automated foundations");
    if (display === "limited") assert.equal(view.interpretation, "Strong results in completed checks · Limited evidence");
    if (display === "withheld") {
      assert.equal(view.interpretation, "Limited evidence");
      assert.match(view.summary, /completed checks performed well/);
    }
    assert.equal(getEvidenceWeightedOverallScore(result.categoryScores), 100);
    assert.equal(result.overallScore, coverage === 100 ? 100 : 99);
  });
}

test("display thresholds include exact boundaries and generic ceilings have no coverage cliffs", () => {
  assert.deepEqual([39, 40, 69, 70].map(getCategoryScoreDisplay), ["withheld", "limited", "limited", "normal"]);
  for (let coverage = 1; coverage <= 100; coverage++) {
    const change = getEvidenceAwareCategoryHealthCap(35, coverage - 1) - getEvidenceAwareCategoryHealthCap(35, coverage);
    assert.ok(change >= 0 && change <= 34 / 70 + 1e-10);
  }
  assert.equal(getEvidenceAwareCategoryHealthCap(35, 0), 100);
  assert.equal(getEvidenceAwareCategoryHealthCap(35, 70), 66);
  assert.equal(getEvidenceAwareCategoryHealthCap(35, 95), 66);
});

test("a sparse weak score without material evidence withholds judgment and softens only its generic ceiling", () => {
  const result = mobileResult(40, 25);
  const view = presentation(result.categoryScores[2]);
  assert.equal(view.showNumeric, false);
  assert.equal(view.interpretation, "Limited evidence");
  assert.doesNotMatch(view.summary, /Significant issues|Needs attention|confirmed issue/);
  assert.equal(result.categoryScores[2].score, 40);
  assert.equal(result.overallScore, 88);
  assert.equal(mobileResult(40, 95).overallScore, 66);
  assert.equal(presentation(mobileResult(60, 30).categoryScores[2]).interpretation, "Limited evidence");
});

test("sparse evidence preserves confirmed findings and independent material caps", () => {
  const result = mobileResult(40, 25, true);
  const mobile = result.categoryScores[2];
  assert.equal(mobile.score, 40);
  assert.equal(mobile.hasConfirmedMaterialIssue, true);
  assert.equal(presentation(mobile).showNumeric, false);
  assert.match(presentation(mobile).interpretation, /confirmed issue detected/);
  assert.match(presentation(mobile).summary, /confirmed issue/);
  assert.equal(result.findings[0].id, "confirmed-overflow");
  assert.equal(result.overallScore, 49);
});

test("98 with strong evidence carries 3.8 times the influence of a sparse perfect score", () => {
  const sparse = mobileResult(100, 25).categoryScores[2];
  const measured = mobileResult(98, 95).categoryScores[2];
  assert.equal(presentation(sparse).showNumeric, false);
  assert.equal(presentation(measured).interpretation, "Strong automated foundations");
  assert.equal(getEffectiveCategoryWeight(15, 95) / getEffectiveCategoryWeight(15, 25), 3.8);
});

test("evidence-weighted averaging changes the persisted overall score when no ceiling binds", () => {
  const checks = profileChecks([90, 100, 100, 100, 100, 100], [100, 25, 25, 25, 25, 25]);
  const result = build(checks);
  // 90 × 22 plus 100 × (78 × 0.25), divided by 22 + 19.5.
  assert.ok(Math.abs(getEvidenceWeightedOverallScore(result.categoryScores) - 94.6987951807229) < 1e-10);
  assert.equal(result.overallScore, 95);
  assert.equal(build(checks.map((check) => ({ ...check, evidenceConfidence: 1 }))).overallScore, 98);
});

test("a confirmed high finding remains flagged without an explicit cap, while uncertain findings do not", () => {
  const checks = profileChecks([100, 100, 40, 100, 100, 100], [100, 100, 25, 100, 100, 100]);
  const finding = mobileResult(40, 25, true).findings[0];
  checks[2] = { ...checks[2], status: "failed", finding: { ...finding, severity: "high" } };
  const result = build(checks);
  assert.equal(result.categoryScores[2].hasConfirmedMaterialIssue, true);
  assert.match(presentation(result.categoryScores[2]).summary, /confirmed issue/);
  assert.equal(result.overallScore, 88, "severity alone must not invent an explicit semantic cap");
  checks[2] = { ...checks[2], finding: { ...finding, impact: "likely" } };
  assert.equal(build(checks).categoryScores[2].hasConfirmedMaterialIssue, false);
});

const profiles = [
  { name: "Plato", scores: [49, 78, 100, 100, 100, 100], coverage: [96, 100, 25, 84, 69, 100], overall: 66, mobileDisplay: "withheld" },
  { name: "Veriq", scores: [100, 75, 98, 81, 100, 100], coverage: [100, 100, 67, 100, 90, 98], overall: 86, mobileDisplay: "limited" },
  // The supplied high-coverage values are represented by 96% SEO and 95% accessibility.
  { name: "Stripe", scores: [99, 71, 100, 100, 85, 100], coverage: [96, 100, 25, 95, 50, 98], overall: 86, mobileDisplay: "withheld" },
];
for (const profile of profiles) {
  test(`${profile.name}-like evidence profile reduces sparse-category influence while retaining supported ceilings`, () => {
    const result = build(profileChecks(profile.scores, profile.coverage));
    const oldRaw = profile.scores.reduce((sum, score, index) => sum + score * auditCategoryRegistry[index].overallWeight / 100, 0);
    const effectiveWeights = profile.coverage.map((coverage, index) => auditCategoryRegistry[index].overallWeight * coverage / 100);
    const expectedRaw = profile.scores.reduce((sum, score, index) => sum + score * effectiveWeights[index], 0) / effectiveWeights.reduce((sum, weight) => sum + weight, 0);
    assert.ok(Math.abs(getEvidenceWeightedOverallScore(result.categoryScores) - expectedRaw) < 1e-10);
    assert.ok(expectedRaw < oldRaw);
    assert.deepEqual(result.categoryScores.map((category) => category.score), profile.scores);
    assert.equal(presentation(result.categoryScores[2]).display, profile.mobileDisplay);
    assert.equal(result.overallScore, profile.overall);
    assert.equal(Math.round(Math.min(oldRaw, getWeakestCategoryHealthCap(Math.min(...profile.scores)))), profile.overall);
  });
}

test("unavailable categories have no rating or effective vote and keep coverage separate", () => {
  const checks = profileChecks([90, 100, 100, 100, 100, 100], [100, 100, 100, 100, 100, 100]);
  checks[1] = { ...checks[1], status: "unavailable", score: null };
  const result = build(checks);
  const unavailable = result.categoryScores[1];
  assert.equal(unavailable.score, null);
  assert.equal(unavailable.available, false);
  assert.equal(unavailable.evidenceCoverage, 0);
  assert.equal(presentation(unavailable).display, "unavailable");
  assert.equal(getEffectiveCategoryWeight(20, unavailable.evidenceCoverage), 0);
  assert.equal(result.evidenceCoverage, 80);
  assert.equal(getEvidenceWeightedOverallScore(result.categoryScores), 97.25);
  assert.throws(() => build(checks.map((check) => ({ ...check, status: "unavailable", score: null }))));
});

test("saved v5 scores remain historical, readable, and numerically unchanged without new metadata", () => {
  const current = mobileResult(100, 25);
  const saved = normalizeAuditResult({ ...current, methodologyVersion: "v5", overallScore: 84,
    categoryScores: current.categoryScores.map((category) => {
      const historical = { ...category };
      delete historical.hasConfirmedMaterialIssue;
      return historical;
    }),
  });
  assert.equal(saved.overallScore, 84);
  assert.equal(saved.categoryScores[2].score, 100);
  const view = getCategoryScorePresentation(saved.categoryScores[2], saved.methodologyVersion);
  assert.equal(view.showNumeric, true);
  assert.equal(view.interpretation, "Historical score");
});
