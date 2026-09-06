import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "../../lib/website-audit/methodology";
import { normalizeAuditResult } from "../../lib/website-audit/result-schema";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import LegacyAuditNotice from "../../components/website-audit/LegacyAuditNotice";
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
  assert.equal(CURRENT_AUDIT_METHODOLOGY_VERSION, "v6");
  assert.equal(demoAuditResult.methodologyVersion, CURRENT_AUDIT_METHODOLOGY_VERSION);
  assert.ok(demoAuditResult.overallScore <= getWeakestCategoryHealthCap(Math.min(...demoAuditResult.categoryScores.map((category) => category.score!))));
  assert.doesNotMatch(JSON.stringify(demoAuditResult), /equal-looking|Four equal|difficult to find/);
});

test("saved v4 reports preserve historical scores and receive the legacy presentation", () => {
  const saved = normalizeAuditResult({
    ...demoAuditResult, methodologyVersion: "v4", overallScore: 84,
    categoryScores: demoAuditResult.categoryScores.map((category) =>
      category.id === "mobile-experience" ? { ...category, score: 36 } : category),
  });
  assert.equal(saved.methodologyVersion, "v4");
  assert.equal(saved.overallScore, 84);
  assert.equal(saved.categoryScores.find((category) => category.id === "mobile-experience")?.score, 36);
  assert.equal(getScoreInterpretation(saved.overallScore, saved.methodologyVersion), "Historical score");
  const notice = renderToStaticMarkup(createElement(LegacyAuditNotice, { methodologyVersion: saved.methodologyVersion }));
  assert.match(notice, /Legacy scoring methodology \(v4\)/);
  assert.match(notice, /Run a new audit/);
});

test("legacy methods render an update notice and a new-audit action, while the current method renders neither", () => {
  for (const version of ["v1", "v2", "v3", "v4", "v5", "v999"]) {
    const html = renderToStaticMarkup(createElement(LegacyAuditNotice, { methodologyVersion: version }));
    assert.match(html, /Legacy scoring methodology/);
    assert.ok(html.includes(version));
    assert.match(html, /Scoring has since been updated/);
    assert.match(html, /have not been recalculated/);
    assert.match(html, /href="\/website-audit"/);
    assert.match(html, /Run a new audit/);
  }
  assert.equal(renderToStaticMarkup(createElement(LegacyAuditNotice, { methodologyVersion: CURRENT_AUDIT_METHODOLOGY_VERSION })), "");
});

test("legacy scores are never interpreted using current health bands", () => {
  for (const version of ["v1", "v2", "v3", "v4", "v5", "v999"]) {
    for (const score of [0, 36, 66, 84, 100]) {
      assert.equal(getScoreInterpretation(score, version), "Historical score");
    }
  }
  assert.equal(getScoreInterpretation(84, CURRENT_AUDIT_METHODOLOGY_VERSION), "Generally strong foundations");
});

test("both report surfaces pass the saved methodology to scores and the legacy notice", async () => {
  for (const file of ["AuditResults", "AuditPreview"]) {
    const source = await readFile(new URL(`../../components/website-audit/${file}.tsx`, import.meta.url), "utf8");
    for (const component of ["LegacyAuditNotice", "OverallScore", "CategoryScores"]) {
      assert.match(source, new RegExp(`<${component}[^>]*methodologyVersion=\\{result.methodologyVersion\\}`));
    }
    assert.match(source, /score=\{result.overallScore\}/);
    assert.match(source, /scores=\{result.categoryScores\}/);
  }
  for (const file of ["OverallScore", "CategoryScores"]) {
    const source = await readFile(new URL(`../../components/website-audit/${file}.tsx`, import.meta.url), "utf8");
    assert.match(source, file === "CategoryScores"
      ? /getCategoryScorePresentation\(category, methodologyVersion\)/
      : /getScoreInterpretation\([^,]+, methodologyVersion\)/);
  }
});
