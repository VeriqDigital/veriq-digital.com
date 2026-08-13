import assert from "node:assert/strict";
import test from "node:test";
import type { AuditCheckResult } from "../../lib/website-audit/model";
import { buildAuditResult } from "../../lib/website-audit/scoring";

const baseCheck = (
  overrides: Partial<AuditCheckResult> & Pick<AuditCheckResult, "id" | "category">,
): AuditCheckResult => ({
  weight: 10,
  status: "passed",
  score: 100,
  ...overrides,
});

test("scoring uses explicit weights and excludes unavailable checks", () => {
  const result = buildAuditResult({
    id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks: [
      baseCheck({ id: "seo-good", category: "seo", score: 100 }),
      baseCheck({
        id: "seo-missing",
        category: "seo",
        status: "unavailable",
        score: null,
        weight: 100,
      }),
      baseCheck({
        id: "performance-poor",
        category: "performance",
        status: "failed",
        score: 20,
      }),
    ],
  });

  assert.equal(
    result.categoryScores.find((category) => category.id === "seo")?.score,
    100,
  );
  assert.equal(
    result.categoryScores.find((category) => category.id === "performance")
      ?.score,
    20,
  );
  assert.equal(result.overallScore, 62);
  assert.equal(
    result.categoryScores.find((category) => category.id === "accessibility")
      ?.score,
    null,
  );
});

test("scoring normalizes finite values and rejects non-finite scores", () => {
  const rounded = buildAuditResult({
    id: "58e8b41f-cc15-4191-8751-c5cb84594591",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks: [baseCheck({ id: "rounded", category: "seo", score: 88.6 })],
  });

  assert.equal(rounded.overallScore, 89);
  assert.throws(() =>
    buildAuditResult({
      id: "6d0e9360-8bda-48f8-a551-4aa10f908323",
      auditedUrl: "https://example.com/",
      createdAt: "2026-08-12T12:00:00.000Z",
      completedAt: "2026-08-12T12:00:10.000Z",
      checks: [baseCheck({ id: "invalid", category: "seo", score: Number.NaN })],
    }),
  );
});

test("representative failed checks generate prioritized summary counts", () => {
  const result = buildAuditResult({
    id: "3b487015-b754-4570-8287-7e490c8f31e0",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks: [
      baseCheck({
        id: "title-missing",
        category: "seo",
        status: "failed",
        score: 0,
        finding: {
          id: "title-missing",
          category: "seo",
          severity: "high",
          title: "Your homepage does not have a page title",
          explanation: "No title element was found.",
          whyItMatters: "A title helps describe the page.",
          recommendation: "Add a concise, descriptive title.",
        },
      }),
      baseCheck({ id: "https", category: "technical-health" }),
    ],
  });

  assert.equal(result.summary.improvements, 1);
  assert.equal(result.summary.passedChecks, 1);
  assert.equal(result.findings[0]?.id, "title-missing");
});

test("summary counts include findings beyond the displayed top fifteen", () => {
  const checks = Array.from({ length: 18 }, (_, index) => ({
    id: `opportunity-${index}`,
    category: "seo" as const,
    weight: 1,
    status: "opportunity" as const,
    score: 75,
    finding: {
      id: `opportunity-${index}`,
      category: "seo" as const,
      severity: "opportunity" as const,
      title: `Opportunity ${index}`,
      explanation: "A representative opportunity was detected.",
      whyItMatters: "This exercises the uncapped summary count.",
      recommendation: "Review the representative opportunity.",
    },
  }));
  const result = buildAuditResult({
    id: "11111111-1111-4111-8111-111111111111",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:30.000Z",
    checks,
  });

  assert.equal(result.findings.length, 15);
  assert.equal(result.summary.opportunities, 18);
});
