import assert from "node:assert/strict";
import test from "node:test";
import { assessRenderFidelity, createRenderFidelityMetrics } from "../../lib/website-audit/render-fidelity";
import { sanitizeRenderedHtml } from "../../lib/website-audit/providers/rendered-mobile";
import type { RenderFidelityMetrics } from "../../lib/website-audit/model";
import { strongFoundationsHtml } from "./fixtures/foundations";

const fidelity = (overrides: Partial<RenderFidelityMetrics> = {}) =>
  assessRenderFidelity({ ...createRenderFidelityMetrics(), ...overrides });

test("intact static CSS is high fidelity; small CSS loss is moderate; substantial loss is low", () => {
  assert.equal(fidelity({ stylesheets: { requested: 8, fulfilled: 8, blocked: 0, failed: 0 } }).level, "high");
  assert.equal(fidelity({ stylesheets: { requested: 8, fulfilled: 7, blocked: 0, failed: 1 } }).level, "moderate");
  assert.equal(fidelity({ stylesheets: { requested: 8, fulfilled: 6, blocked: 1, failed: 1 } }).level, "low");
  const crossOrigin = fidelity({ stylesheets: { requested: 1, fulfilled: 0, blocked: 1, failed: 0 }, crossOriginStylesheetsBlocked: 1 });
  assert.equal(crossOrigin.level, "low");
  assert.ok(crossOrigin.reasons.includes("cross_origin_stylesheets"));
});

test("stylesheet count, per-file bytes, and CSS lost to total bytes degrade fidelity", () => {
  for (const overrides of [
    { stylesheetLimitReached: true },
    { stylesheetByteLimitReached: true },
    { totalByteLimitReached: true, stylesheets: { requested: 16, fulfilled: 15, blocked: 1, failed: 0 } },
  ]) assert.equal(fidelity(overrides).level, "low");
});

test("image limits alone do not make intact layout CSS low fidelity", () => {
  const images = { requested: 20, fulfilled: 6, blocked: 14, failed: 0 };
  assert.equal(fidelity({ images, imageLimitReached: true }).level, "high");
  assert.notEqual(fidelity({ images, imageByteLimitReached: true, totalByteLimitReached: true }).level, "low");
});

test("sanitization tracks bounded evidence without retaining upstream content", () => {
  const sanitized = sanitizeRenderedHtml(`<html><head><script src="https://secret.example/token"></script>
    <script type="application/ld+json">{"name":"Private"}</script></head><body>
    <button onclick="privateValue()">Book now</button><iframe srcdoc="private"></iframe>
    </body></html>`, "https://example.com/");
  assert.equal(sanitized.metrics.scriptsRemoved, 2);
  assert.equal(sanitized.metrics.executableScriptsRemoved, 1);
  assert.equal(sanitized.metrics.inlineHandlersRemoved, 1);
  assert.equal(sanitized.metrics.embeddedDocumentsRemoved, 1);
  assert.doesNotMatch(sanitized.html, /<script|<iframe|onclick=|privateValue|secret\.example/);
  assert.match(sanitized.html, /script-src 'none'/);
  assert.doesNotMatch(JSON.stringify(assessRenderFidelity(sanitized.metrics)), /https:|Private|privateValue/);
});

test("script-heavy shells are low but complete server markup with scripts is not automatically low", () => {
  const scripts = '<script src="/app.js"></script>'.repeat(20);
  const shell = sanitizeRenderedHtml(`<html><body><div id="app"></div>${scripts}</body></html>`, "https://example.com/");
  assert.equal(assessRenderFidelity(shell.metrics).level, "low");
  const complete = sanitizeRenderedHtml(strongFoundationsHtml.replace("</body>", `<p>${"Useful server-rendered content. ".repeat(12)}</p>${scripts}</body>`), "https://example.com/");
  assert.equal(complete.metrics.sourceStructurallyComplete, true);
  assert.equal(assessRenderFidelity(complete.metrics).level, "moderate");
  assert.equal(fidelity({ executableScriptsRemoved: 2 }).level, "moderate");
  assert.equal(fidelity({ scriptsRemoved: 20 }).level, "high", "inert JSON does not imply a dynamic layout");
});

test("substantial removed executable scripts or handlers downgrade complete SSR to moderate, shells to low", () => {
  for (const signals of [
    { executableScriptsRemoved: 8 },
    { inlineHandlersRemoved: 8 },
    { executableScriptsRemoved: 4, inlineHandlersRemoved: 4 },
    { executableScriptsRemoved: 100 },
  ]) {
    const complete = fidelity({ ...signals, sourceStructurallyComplete: true });
    assert.equal(complete.level, "moderate");
    assert.ok(complete.reasons.includes("dynamic_layout_uncertainty"));
    assert.equal(fidelity(signals).level, "low");
  }
  assert.equal(fidelity({ executableScriptsRemoved: 7, sourceStructurallyComplete: true }).level, "high");
  assert.equal(fidelity({ inlineHandlersRemoved: 7, sourceStructurallyComplete: true }).level, "high");
  assert.equal(fidelity({ executableScriptsRemoved: 7 }).level, "moderate");
});

test("one ordinary removed iframe is diagnostic without downgrading otherwise intact geometry", () => {
  const { metrics } = sanitizeRenderedHtml(strongFoundationsHtml.replace("</body>",
    '<iframe src="https://video.example.test/embed" width="300" height="200"></iframe></body>'), "https://example.com/");
  const result = assessRenderFidelity(metrics);
  assert.equal(result.metrics.embeddedDocumentsRemoved, 1);
  assert.ok(result.reasons.includes("embedded_content_removed"));
  assert.equal(result.level, "high");
  assert.equal(fidelity({ ...metrics, executableScriptsRemoved: 2 }).level, "moderate", "independent dynamic uncertainty still applies");
});

test("fidelity metrics are bounded and snapshotted", () => {
  const input = createRenderFidelityMetrics();
  input.scriptsRemoved = Infinity;
  input.inlineHandlersRemoved = -4;
  input.stylesheets.requested = 1e20;
  const result = assessRenderFidelity(input);
  input.stylesheets.requested = 0;
  assert.equal(result.metrics.scriptsRemoved, 0);
  assert.equal(result.metrics.inlineHandlersRemoved, 0);
  assert.equal(result.metrics.stylesheets.requested, 10_000_000);
});
