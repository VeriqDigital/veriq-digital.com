import assert from "node:assert/strict";
import test from "node:test";
import type { AuditCheckResult, AuditSeverity } from "../../lib/website-audit/model";
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
): AuditCheckResult["finding"] => ({
  id,
  category: "seo",
  severity,
  title: `${severity} finding`,
  explanation: "A measurable issue was detected.",
  whyItMatters: "The issue affects website health.",
  recommendation: "Correct the measurable issue and verify the result.",
});

test("full evidence can earn 100 only across several strong checks", () => {
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
  assert.ok(result.overallScore < 90);
});

test("sparse or partial evidence cannot accidentally produce a perfect score", () => {
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

  assert.equal(sparseSeo?.score, 89);
  assert.equal(partialSeo?.score, 69);
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
  assert.equal(result.overallScore, 70);
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
