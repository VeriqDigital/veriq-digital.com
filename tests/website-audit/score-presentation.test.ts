import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { automatedScoreScope, getScoreInterpretation } from "../../components/website-audit/types";
import { getAuditCategory } from "../../lib/website-audit/categories";
import { demoAuditResult } from "../../components/website-audit/demo-audit";
import { getWeakestCategoryHealthCap } from "../../lib/website-audit/health-constraints";

test("score bands describe automated foundations rather than comprehensive quality", () => {
  for (const [score, label] of [[100, "Strong automated foundations"], [90, "Strong automated foundations"], [89, "Generally strong foundations"], [80, "Generally strong foundations"], [79, "Mixed foundations"], [70, "Mixed foundations"], [69, "Needs attention"], [50, "Needs attention"], [49, "Significant issues detected"], [0, "Significant issues detected"]] as const) {
    assert.equal(getScoreInterpretation(score), label);
  }
  assert.match(automatedScoreScope, /does not grade visual design, branding, copy quality, or overall persuasiveness/);
  assert.equal(getAuditCategory("conversion-ux").label, "Conversion foundations");
  assert.match(getAuditCategory("conversion-ux").description, /does not assess messaging/);
});

test("the score component exposes scope in both preview and full report", async () => {
  const source = await readFile(new URL("../../components/website-audit/OverallScore.tsx", import.meta.url), "utf8");
  assert.match(source, /<p>Automated website health<\/p>/);
  assert.match(source, /<p className=\{styles.scoreScope\}>\{automatedScoreScope\}<\/p>/);
  assert.doesNotMatch(source, /Excellent/);
});

test("demo data follows the current health ceiling and avoids subjective CTA judgments", () => {
  assert.equal(demoAuditResult.methodologyVersion, "v4");
  assert.ok(demoAuditResult.overallScore <= getWeakestCategoryHealthCap(Math.min(...demoAuditResult.categoryScores.map((category) => category.score!))));
  assert.doesNotMatch(JSON.stringify(demoAuditResult), /equal-looking|Four equal|difficult to find/);
});
