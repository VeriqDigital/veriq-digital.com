import assert from "node:assert/strict";
import test from "node:test";
import type {
  AuditCheckResult,
  AuditFindingImpact,
  AuditSeverity,
} from "../../lib/website-audit/model";
import type { AuditCategoryId } from "../../lib/website-audit/categories";
import { buildAuditResult } from "../../lib/website-audit/scoring";

const baseCheck = (
  overrides: Partial<AuditCheckResult> & Pick<AuditCheckResult, "id" | "category">,
): AuditCheckResult => ({
  weight: 10,
  status: "passed",
  score: 100,
  ...overrides,
});

const build = (checks: readonly AuditCheckResult[]) =>
  buildAuditResult({
    id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks,
  });

const withFinding = (
  severity: AuditSeverity,
  id: string,
  impact: AuditFindingImpact = "confirmed",
  category: AuditCategoryId = "seo",
): AuditCheckResult["finding"] => ({
  id,
  category,
  impact,
  severity,
  title: `${severity} finding`,
  explanation: "A measurable issue was detected.",
  whyItMatters: "The issue affects website health.",
  recommendation: "Correct the measurable issue and verify the result.",
});

const allCategories: readonly AuditCategoryId[] = [
  "seo",
  "performance",
  "mobile-experience",
  "accessibility",
  "conversion-ux",
  "technical-health",
];

const passingCategoryChecks = (prefix: string) =>
  allCategories.map((category) =>
    baseCheck({ id: `${prefix}-${category}`, category }),
  );

test("health is normalized from available evidence while coverage stays separate", () => {
  const result = build([
    baseCheck({ id: "seo-a", category: "seo" }),
    baseCheck({ id: "seo-b", category: "seo" }),
    baseCheck({ id: "seo-c", category: "seo" }),
  ]);
  const seo = result.categoryScores.find((category) => category.id === "seo");

  assert.equal(seo?.score, 100);
  assert.equal(seo?.evidenceLevel, "full");
  assert.equal(seo?.evidenceCoverage, 100);
  assert.equal(result.evidenceCoverage, 22);
  assert.equal(result.overallScore, 99);
});

test("partial evidence does not fabricate a penalty or a perfect confidence signal", () => {
  const sparse = build([baseCheck({ id: "seo-only", category: "seo" })]);
  const partial = build([
    baseCheck({ id: "seo-good", category: "seo", weight: 10 }),
    baseCheck({
      id: "seo-unavailable",
      category: "seo",
      status: "unavailable",
      score: null,
      weight: 90,
    }),
  ]);
  const sparseSeo = sparse.categoryScores.find((category) => category.id === "seo");
  const partialSeo = partial.categoryScores.find((category) => category.id === "seo");

  assert.equal(sparseSeo?.score, 100);
  assert.equal(partialSeo?.score, 100);
  assert.equal(partialSeo?.evidenceLevel, "partial");
  assert.equal(partialSeo?.evidenceCoverage, 10);
});

test("unavailable categories are null and reduce coverage rather than scoring zero", () => {
  const result = build([
    baseCheck({ id: "seo-a", category: "seo" }),
    baseCheck({ id: "seo-b", category: "seo" }),
    baseCheck({ id: "seo-c", category: "seo" }),
    baseCheck({
      id: "pagespeed",
      category: "performance",
      status: "unavailable",
      score: null,
      weight: 100,
    }),
  ]);
  const performance = result.categoryScores.find(
    (category) => category.id === "performance",
  );

  assert.equal(performance?.score, null);
  assert.equal(performance?.evidenceLevel, "unavailable");
  assert.equal(performance?.evidenceCoverage, 0);
  assert.ok(result.notices.some((notice) => notice.includes("Performance was unavailable")));
});

test("critical findings carry a much larger consequence than minor opportunities", () => {
  const critical = build([
    baseCheck({
      id: "critical",
      category: "seo",
      status: "failed",
      score: 0,
      categoryScoreCap: 49,
      overallScoreCap: 79,
      finding: withFinding("critical", "critical"),
    }),
    baseCheck({ id: "pass-a", category: "seo" }),
    baseCheck({ id: "pass-b", category: "seo" }),
  ]);
  const opportunity = build([
    baseCheck({
      id: "opportunity",
      category: "seo",
      status: "opportunity",
      score: 96,
      finding: withFinding("opportunity", "opportunity"),
    }),
    baseCheck({ id: "pass-a", category: "seo" }),
    baseCheck({ id: "pass-b", category: "seo" }),
  ]);

  assert.equal(
    critical.categoryScores.find((category) => category.id === "seo")?.score,
    49,
  );
  assert.equal(
    opportunity.categoryScores.find((category) => category.id === "seo")?.score,
    99,
  );
  assert.ok(critical.overallScore < opportunity.overallScore);
  assert.ok(critical.overallScore <= 79);
});

test("overall scoring preserves explicit category weights", () => {
  const checks = [
    ...["a", "b", "c"].map((id) =>
      baseCheck({ id: `seo-${id}`, category: "seo", score: 100 }),
    ),
    ...["a", "b", "c"].map((id) =>
      baseCheck({
        id: `performance-${id}`,
        category: "performance",
        status: "failed",
        score: 50,
      }),
    ),
  ];
  const result = build(checks);

  assert.equal(
    result.categoryScores.find((category) => category.id === "seo")?.score,
    100,
  );
  assert.equal(
    result.categoryScores.find((category) => category.id === "performance")?.score,
    50,
  );
  assert.equal(result.evidenceCoverage, 42);
  assert.equal(result.overallScore, 76);
});

test("informational observations have only a tiny direct score effect", () => {
  const result = build([
    baseCheck({ id: "pass-a", category: "seo", weight: 10 }),
    baseCheck({ id: "pass-b", category: "seo", weight: 10 }),
    baseCheck({
      id: "heading-skip",
      category: "seo",
      weight: 10,
      status: "opportunity",
      score: 40,
      evidenceConfidence: 0.5,
      finding: withFinding(
        "opportunity",
        "heading-skip",
        "informational",
      ),
    }),
  ]);

  assert.ok(
    (result.categoryScores.find((category) => category.id === "seo")?.score ??
      0) >= 98,
  );
  assert.equal(
    result.categoryScores.find((category) => category.id === "seo")
      ?.evidenceCoverage,
    83,
  );
});

test("unavailable performance is excluded from health and lowers confidence", () => {
  const categories: readonly AuditCategoryId[] = [
    "seo",
    "mobile-experience",
    "accessibility",
    "conversion-ux",
    "technical-health",
  ];
  const checks = categories.flatMap((category) =>
    ["a", "b", "c"].map((suffix) =>
      baseCheck({ id: `${category}-${suffix}`, category }),
    ),
  );
  checks.push(
    baseCheck({
      id: "performance-unavailable",
      category: "performance",
      status: "unavailable",
      score: null,
      weight: 100,
    }),
  );
  const result = build(checks);

  assert.equal(result.overallScore, 99);
  assert.equal(result.evidenceCoverage, 80);
  assert.equal(
    result.categoryScores.find((category) => category.id === "performance")
      ?.score,
    null,
  );
});

test("a concentrated confirmed material failure cannot be averaged into Excellent", () => {
  const result = build([
    ...passingCategoryChecks("confirmed").filter(
      (check) => check.category !== "conversion-ux",
    ),
    baseCheck({ id: "conversion-pass", category: "conversion-ux" }),
    baseCheck({
      id: "primary-action-broken",
      category: "conversion-ux",
      status: "failed",
      score: 50,
      overallScoreCap: 88,
      penaltyGroup: "primary-action",
      finding: withFinding(
        "high",
        "primary-action-broken",
        "confirmed",
        "conversion-ux",
      ),
    }),
  ]);
  const conversion = result.categoryScores.find(
    (category) => category.id === "conversion-ux",
  );

  assert.equal(conversion?.score, 75);
  assert.equal(result.overallScore, 88);
  assert.ok(result.overallScore < 90);
});

test("a concentrated likely weakness remains governed by weighted scoring", () => {
  const result = build([
    ...passingCategoryChecks("likely").filter(
      (check) => check.category !== "conversion-ux",
    ),
    baseCheck({ id: "likely-conversion-pass", category: "conversion-ux" }),
    baseCheck({
      id: "likely-conversion-weakness",
      category: "conversion-ux",
      status: "failed",
      score: 0,
      overallScoreCap: 88,
      finding: withFinding(
        "medium",
        "likely-conversion-weakness",
        "likely",
        "conversion-ux",
      ),
    }),
  ]);
  const conversion = result.categoryScores.find(
    (category) => category.id === "conversion-ux",
  );

  assert.ok((conversion?.score ?? 100) < 80);
  assert.ok(result.overallScore >= 90);
});

test("informational complexity stays very high without rounding to perfect", () => {
  const result = build(
    allCategories.flatMap((category) => [
      baseCheck({ id: `informational-${category}-pass`, category }),
      baseCheck({
        id: `informational-${category}-finding`,
        category,
        status: "opportunity",
        score: 40,
        finding: withFinding(
          "opportunity",
          `informational-${category}-finding`,
          "informational",
          category,
        ),
      }),
    ]),
  );

  assert.ok(result.overallScore >= 96);
  assert.ok(result.overallScore < 100);
});

test("a true perfect score requires full evidence and no findings", () => {
  const result = build(passingCategoryChecks("perfect"));

  assert.equal(result.evidenceCoverage, 100);
  assert.equal(result.findings.length, 0);
  assert.equal(result.overallScore, 100);
});

test("correlated manifestations cannot multiply one root penalty", () => {
  const single = build([
    baseCheck({
      id: "overflow-width",
      category: "mobile-experience",
      status: "failed",
      score: 20,
      weight: 25,
      penaltyGroup: "mobile-overflow",
      finding: withFinding(
        "high",
        "overflow-width",
        "confirmed",
        "mobile-experience",
      ),
    }),
    baseCheck({ id: "mobile-pass", category: "mobile-experience", weight: 25 }),
  ]);
  const duplicated = build([
    ...[
      ["overflow-width", 25, 20],
      ["overflow-image", 10, 30],
      ["overflow-content", 15, 25],
    ].map(([id, weight, score]) =>
      baseCheck({
        id: String(id),
        category: "mobile-experience",
        status: "failed",
        score: Number(score),
        weight: Number(weight),
        penaltyGroup: "mobile-overflow",
        finding: withFinding(
          "high",
          String(id),
          "confirmed",
          "mobile-experience",
        ),
      }),
    ),
    baseCheck({ id: "mobile-pass", category: "mobile-experience", weight: 25 }),
  ]);

  assert.equal(
    single.categoryScores.find((category) => category.id === "mobile-experience")
      ?.score,
    duplicated.categoryScores.find(
      (category) => category.id === "mobile-experience",
    )?.score,
  );
});

test("duplicate material manifestations share one overall constraint", () => {
  const single = build([
    ...passingCategoryChecks("single"),
    baseCheck({
      id: "mobile-root",
      category: "mobile-experience",
      status: "failed",
      score: 50,
      penaltyGroup: "mobile-layout",
      overallScoreCap: 88,
      finding: withFinding(
        "high",
        "mobile-root",
        "confirmed",
        "mobile-experience",
      ),
    }),
  ]);
  const duplicated = build([
    ...passingCategoryChecks("duplicate"),
    baseCheck({
      id: "mobile-width",
      category: "mobile-experience",
      status: "failed",
      score: 50,
      penaltyGroup: "mobile-layout",
      overallScoreCap: 88,
      finding: withFinding(
        "high",
        "mobile-width",
        "confirmed",
        "mobile-experience",
      ),
    }),
    baseCheck({
      id: "mobile-action",
      category: "conversion-ux",
      status: "failed",
      score: 50,
      penaltyGroup: "mobile-layout",
      overallScoreCap: 88,
      finding: withFinding(
        "high",
        "mobile-action",
        "confirmed",
        "conversion-ux",
      ),
    }),
  ]);

  assert.equal(single.overallScore, 88);
  assert.equal(duplicated.overallScore, 88);
});

test("independent confirmed material failures strengthen the constraint", () => {
  const result = build([
    ...passingCategoryChecks("independent"),
    baseCheck({
      id: "independent-mobile",
      category: "mobile-experience",
      status: "failed",
      score: 50,
      penaltyGroup: "mobile-layout",
      overallScoreCap: 88,
      finding: withFinding(
        "high",
        "independent-mobile",
        "confirmed",
        "mobile-experience",
      ),
    }),
    baseCheck({
      id: "independent-form",
      category: "accessibility",
      status: "failed",
      score: 50,
      penaltyGroup: "form-accessibility",
      overallScoreCap: 93,
      finding: withFinding(
        "high",
        "independent-form",
        "confirmed",
        "accessibility",
      ),
    }),
  ]);

  assert.equal(result.overallScore, 85);
});

test("a low category with a confirmed material check cannot remain Excellent", () => {
  const result = build([
    ...passingCategoryChecks("guardrail").filter(
      (check) => check.category !== "accessibility",
    ),
    baseCheck({ id: "guardrail-accessibility-pass", category: "accessibility" }),
    baseCheck({
      id: "guardrail-accessibility-defect",
      category: "accessibility",
      status: "failed",
      score: 50,
      overallScoreCap: 93,
      finding: withFinding(
        "high",
        "guardrail-accessibility-defect",
        "confirmed",
        "accessibility",
      ),
    }),
  ]);

  assert.equal(
    result.categoryScores.find((category) => category.id === "accessibility")
      ?.score,
    75,
  );
  assert.equal(result.overallScore, 89);
});

test("catastrophic explicit constraints remain effective", () => {
  const result = build([
    ...passingCategoryChecks("catastrophic"),
    baseCheck({
      id: "http-failure",
      category: "technical-health",
      status: "failed",
      score: 0,
      overallScoreCap: 59,
      finding: withFinding(
        "critical",
        "http-failure",
        "confirmed",
        "technical-health",
      ),
    }),
  ]);

  assert.equal(result.overallScore, 59);
});

test("representative website health collections occupy defensible score bands", () => {
  const categories: readonly AuditCategoryId[] = [
    "seo",
    "performance",
    "mobile-experience",
    "accessibility",
    "conversion-ux",
    "technical-health",
  ];
  const scenario = (
    name: string,
    failedCategories: ReadonlySet<AuditCategoryId>,
    failedScore: number,
    impact: AuditFindingImpact,
  ) =>
    build(
      categories.flatMap((category) => [
        baseCheck({ id: `${name}-${category}-pass`, category, weight: 10 }),
        baseCheck({
          id: `${name}-${category}-observation`,
          category,
          weight: 10,
          status: failedCategories.has(category) ? "failed" : "opportunity",
          score: failedCategories.has(category) ? failedScore : 70,
          finding: withFinding(
            failedCategories.has(category) ? "high" : "opportunity",
            `${name}-${category}-observation`,
            failedCategories.has(category) ? impact : "informational",
            category,
          ),
        }),
        baseCheck(
          failedCategories.has(category)
            ? {
                id: `${name}-${category}-second-issue`,
                category,
                weight: 10,
                status: "failed",
                score: failedScore,
                finding: withFinding(
                  "high",
                  `${name}-${category}-second-issue`,
                  impact,
                  category,
                ),
              }
            : { id: `${name}-${category}-pass-2`, category, weight: 10 },
        ),
      ]),
    );

  const excellent = scenario("excellent", new Set(), 100, "confirmed");
  const good = scenario(
    "good",
    new Set<AuditCategoryId>([
      "technical-health",
      "seo",
      "mobile-experience",
      "accessibility",
    ]),
    40,
    "likely",
  );
  const mediocre = scenario(
    "mediocre",
    new Set<AuditCategoryId>([
      "seo",
      "mobile-experience",
      "accessibility",
      "conversion-ux",
    ]),
    30,
    "confirmed",
  );
  const poor = scenario(
    "poor",
    new Set<AuditCategoryId>(categories),
    0,
    "confirmed",
  );

  assert.ok(excellent.overallScore >= 90);
  assert.ok(good.overallScore >= 80 && good.overallScore < 95);
  assert.ok(mediocre.overallScore >= 60 && mediocre.overallScore < 80);
  assert.ok(poor.overallScore < 60);
});

test("scoring normalizes finite values and rejects non-finite scores", () => {
  const rounded = build([
    baseCheck({ id: "one", category: "seo", score: 88.6 }),
    baseCheck({ id: "two", category: "seo", score: 88.6 }),
    baseCheck({ id: "three", category: "seo", score: 88.6 }),
  ]);

  assert.equal(
    rounded.categoryScores.find((category) => category.id === "seo")?.score,
    89,
  );
  assert.throws(() =>
    build([baseCheck({ id: "invalid", category: "seo", score: Number.NaN })]),
  );
});

test("identical inputs produce deterministic results", () => {
  const checks = [
    baseCheck({ id: "seo-a", category: "seo", score: 84 }),
    baseCheck({ id: "seo-b", category: "seo", score: 92 }),
    baseCheck({ id: "seo-c", category: "seo", score: 76 }),
  ];

  assert.deepEqual(build(checks), build(checks));
});

test("summary counts include findings beyond the displayed top fifteen", () => {
  const checks = Array.from({ length: 18 }, (_, index) =>
    baseCheck({
      id: `opportunity-${index}`,
      category: "seo",
      weight: 1,
      status: "opportunity",
      score: 75,
      finding: withFinding("opportunity", `opportunity-${index}`),
    }),
  );
  const result = build(checks);

  assert.equal(result.findings.length, 15);
  assert.equal(result.summary.opportunities, 18);
});
