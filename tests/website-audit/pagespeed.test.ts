import assert from "node:assert/strict";
import test from "node:test";
import { runPageSpeedAudit } from "../../lib/website-audit/providers/pagespeed";

test("PageSpeed is explicitly unavailable when its server key is absent", async () => {
  const result = await runPageSpeedAudit("https://example.com/");
  assert.deepEqual(result, { available: false, reason: "not_configured" });
});

test("PageSpeed provider failures degrade without failing the audit", async () => {
  let attempts = 0;
  const result = await runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key",
    retryDelayMs: 0,
    fetchImpl: async () => {
      attempts += 1;
      throw new TypeError("simulated network failure");
    },
  });

  assert.deepEqual(result, { available: false, reason: "provider_error" });
  assert.equal(attempts, 2);
});

test("PageSpeed retries one transient server failure inside the same request budget", async () => {
  let attempts = 0;
  const result = await runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key",
    retryDelayMs: 0,
    fetchImpl: async () => {
      attempts += 1;

      if (attempts === 1) {
        return new Response(null, { status: 503 });
      }

      return Response.json({
        lighthouseResult: {
          categories: { performance: { score: 0.9 } },
          audits: {},
        },
      });
    },
  });

  assert.equal(result.available, true);
  assert.equal(attempts, 2);
});

test("PageSpeed does not retry quota or non-transient client failures", async () => {
  for (const [status, reason] of [
    [429, "rate_limited"],
    [400, "provider_error"],
  ] as const) {
    let attempts = 0;
    const result = await runPageSpeedAudit("https://example.com/", {
      apiKey: "test-key",
      retryDelayMs: 0,
      fetchImpl: async () => {
        attempts += 1;
        return new Response(null, { status });
      },
    });

    assert.deepEqual(result, { available: false, reason });
    assert.equal(attempts, 1);
  }
});

test("PageSpeed retries within one total timeout rather than extending the request", async () => {
  let attempts = 0;
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(new DOMException("Timed out", "TimeoutError")),
    20,
  );

  try {
    const result = await runPageSpeedAudit("https://example.com/", {
      apiKey: "test-key",
      signal: controller.signal,
      timeoutMs: 1_000,
      retryDelayMs: 0,
      fetchImpl: async (_input, init) => {
        attempts += 1;

        if (attempts === 1) {
          return new Response(null, { status: 503 });
        }

        return new Promise<Response>((_resolve, reject) => {
          const signal = init?.signal;
          if (!signal) return;
          if (signal.aborted) {
            reject(signal.reason);
            return;
          }
          signal.addEventListener("abort", () => reject(signal.reason), {
            once: true,
          });
        });
      },
    });

    assert.deepEqual(result, { available: false, reason: "timeout" });
    assert.equal(attempts, 2);
    assert.ok(Date.now() - startedAt < 500);
  } finally {
    clearTimeout(timeout);
  }
});

test("PageSpeed logs a safe diagnostic for Lighthouse runtime failures", async () => {
  const warnings: unknown[][] = [];
  const previousWarn = console.warn;
  console.warn = (...values: unknown[]) => warnings.push(values);

  try {
    const result = await runPageSpeedAudit("https://private.example/path?secret=yes", {
      apiKey: "secret-key",
      fetchImpl: async () =>
        Response.json({ lighthouseResult: { runtimeError: { code: "ERRORED_DOCUMENT_REQUEST" } } }),
    });

    assert.deepEqual(result, { available: false, reason: "provider_error" });
  } finally {
    console.warn = previousWarn;
  }

  const serialized = JSON.stringify(warnings);
  assert.match(serialized, /lighthouse_runtime_error/);
  assert.doesNotMatch(serialized, /private\.example|secret-key|secret=yes|ERRORED_DOCUMENT_REQUEST/);
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
