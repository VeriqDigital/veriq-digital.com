import assert from "node:assert/strict";
import test from "node:test";
import { runPageSpeedAudit } from "../../lib/website-audit/providers/pagespeed";

test("PageSpeed is explicitly unavailable when its server key is absent", async () => {
  const result = await runPageSpeedAudit("https://example.com/");
  assert.deepEqual(result, { available: false, reason: "not_configured" });
});

test("PageSpeed provider failures degrade without failing the audit", async () => {
  const result = await runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key",
    fetchImpl: async () => {
      throw new TypeError("simulated network failure");
    },
  });

  assert.deepEqual(result, { available: false, reason: "provider_error" });
});

test("PageSpeed requests only the official endpoint and normalizes scores", async () => {
  let requestedUrl = "";
  const result = await runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key",
    fetchImpl: async (input) => {
      requestedUrl = input.toString();
      return Response.json({
        lighthouseResult: {
          categories: {
            performance: { score: 0.91 },
            accessibility: { score: 0.88 },
            seo: { score: 0.97 },
          },
          audits: {
            "largest-contentful-paint": {
              numericValue: 2100,
              displayValue: "2.1 s",
            },
            "cumulative-layout-shift": { numericValue: 0.04 },
            "first-contentful-paint": { numericValue: 1200 },
            "total-blocking-time": { numericValue: 80 },
            "speed-index": { numericValue: 1800 },
            viewport: { score: 1 },
            "tap-targets": { score: 0.9 },
            "content-width": { score: 1 },
            "color-contrast": { score: 0.8 },
            "link-name": { score: 1 },
            "button-name": { score: 1 },
          },
        },
      });
    },
  });

  assert.ok(result.available);
  if (!result.available) return;
  assert.equal(result.performanceScore, 91);
  assert.equal(result.accessibilityScore, 88);
  assert.equal(result.seoScore, 97);
  assert.equal(result.metrics.lcp?.numericValue, 2100);
  const parsedRequestUrl = new URL(requestedUrl);
  assert.equal(parsedRequestUrl.origin, "https://pagespeedonline.googleapis.com");
  assert.equal(parsedRequestUrl.pathname, "/pagespeedonline/v5/runPagespeed");
  assert.equal(parsedRequestUrl.searchParams.get("strategy"), "MOBILE");
  assert.deepEqual(parsedRequestUrl.searchParams.getAll("category"), [
    "PERFORMANCE",
    "ACCESSIBILITY",
    "SEO",
  ]);
});
