import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { demoAuditResult } from "../../components/website-audit/demo-audit";
import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "../../lib/website-audit/methodology";

// Node has no CSS-module loader. Only the stylesheet is stubbed; these tests
// render the production React components and verify their actual accessible markup.
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => { module.exports = {}; };
const { default: CategoryScores } = require("../../components/website-audit/CategoryScores") as typeof import("../../components/website-audit/CategoryScores");
const { default: OverallScore } = require("../../components/website-audit/OverallScore") as typeof import("../../components/website-audit/OverallScore");
delete require.extensions[".css"];

for (const compact of [false, true]) {
  test(`${compact ? "preview" : "full report"} markup withholds sparse ratings and qualifies partial numeric meters`, () => {
    const category = { ...demoAuditResult.categoryScores[2], score: 100, evidenceCoverage: 25, hasConfirmedMaterialIssue: false };
    const render = (coverage: number, material = false, version = CURRENT_AUDIT_METHODOLOGY_VERSION) => renderToStaticMarkup(createElement(CategoryScores, {
      scores: [{ ...category, evidenceCoverage: coverage, hasConfirmedMaterialIssue: material }], methodologyVersion: version, compact,
    }));
    const sparse = render(25);
    assert.match(sparse, /Limited evidence/);
    assert.match(sparse, /Only 25%/);
    assert.match(sparse, /completed checks performed well/);
    assert.doesNotMatch(sparse, /<meter|\/100|out of 100|Strong automated|Generally strong/);
    assert.match(render(25, true), /confirmed issue was detected/);
    const limited = render(55);
    assert.match(limited, /<strong>100<\/strong>/);
    assert.match(limited, /<meter[^>]+aria-label="[^"]*completed checks[^"]*Limited evidence/);
    assert.match(limited, /<small>Strong results in completed checks · Limited evidence<\/small>/);
    assert.match(render(75), /<meter[^>]+Strong automated foundations/);
    const legacy = render(25, false, "v5");
    assert.match(legacy, /<strong>100<\/strong>/);
    assert.match(legacy, /Historical score/);
    assert.doesNotMatch(legacy, /Limited evidence/);
  });
}

test("only current overall scores explain evidence-weighted influence", () => {
  const render = (version: string) => renderToStaticMarkup(createElement(OverallScore, {
    score: 86, evidenceCoverage: 55, methodologyVersion: version,
  }));
  assert.match(render(CURRENT_AUDIT_METHODOLOGY_VERSION), /Category influence is scaled by evidence coverage/);
  assert.match(render(CURRENT_AUDIT_METHODOLOGY_VERSION), /Unavailable checks do not count as failures/);
  assert.doesNotMatch(render("v5"), /Category influence is scaled/);
});
