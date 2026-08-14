import { z } from "zod";
import { auditCategoryIds } from "./categories";
import type { AuditCategoryId } from "./categories";
import type { WebsiteAuditResult } from "./model";

const scoreSchema = z.number().finite().int().min(0).max(100);
const boundedText = (maximum: number) => z.string().trim().min(1).max(maximum);
const categorySchema = z.enum(auditCategoryIds as [AuditCategoryId, ...AuditCategoryId[]]);
const severitySchema = z.enum([
  "critical",
  "high",
  "medium",
  "low",
  "opportunity",
  "passed",
]);

const categoryScoreSchema = z
  .object({
    id: categorySchema,
    available: z.boolean(),
    score: scoreSchema.nullable(),
    evidenceLevel: z.enum(["full", "partial", "unavailable"]),
    evidenceCoverage: scoreSchema,
    summary: boundedText(240),
    checksRun: z.number().finite().int().min(0).max(100),
    checksUnavailable: z.number().finite().int().min(0).max(100),
  })
  .superRefine((value, context) => {
    if (value.available !== (value.score !== null)) {
      context.addIssue({
        code: "custom",
        message: "Available category scores must contain a score.",
      });
    }

    if (
      (value.evidenceLevel === "unavailable") !==
      (value.evidenceCoverage === 0)
    ) {
      context.addIssue({
        code: "custom",
        message: "Unavailable categories must have zero evidence coverage.",
      });
    }

    if (value.evidenceLevel === "full" && value.evidenceCoverage !== 100) {
      context.addIssue({
        code: "custom",
        message: "Fully evaluated categories must have full evidence coverage.",
      });
    }
  });

const findingSchema = z.object({
  id: z.string().regex(/^[a-z0-9][a-z0-9._-]{0,99}$/),
  category: categorySchema,
  severity: severitySchema,
  title: boundedText(180),
  explanation: boundedText(700),
  whyItMatters: boundedText(700),
  recommendation: boundedText(900),
  observedValue: boundedText(500).optional(),
  recommendedValue: boundedText(500).optional(),
  supportingMetric: z
    .object({
      label: boundedText(100),
      value: boundedText(120),
      context: boundedText(260).optional(),
    })
    .optional(),
});

const resultIdSchema = z.union([
  z.uuid(),
  z.string().regex(/^demo_[A-Za-z0-9_-]{6,80}$/),
]);

export const websiteAuditResultSchema = z
  .object({
    id: resultIdSchema,
    status: z.enum(["demo", "complete"]),
    auditedUrl: z.url().max(2048),
    createdAt: z.iso.datetime(),
    completedAt: z.iso.datetime().optional(),
    overallScore: scoreSchema,
    evidenceCoverage: scoreSchema,
    overallSummary: boundedText(400),
    categoryScores: z.array(categoryScoreSchema).length(auditCategoryIds.length),
    summary: z.object({
      criticalIssues: z.number().finite().int().min(0).max(100),
      improvements: z.number().finite().int().min(0).max(100),
      opportunities: z.number().finite().int().min(0).max(100),
      passedChecks: z.number().finite().int().min(0).max(200),
    }),
    findings: z.array(findingSchema).max(24),
    notices: z.array(boundedText(500)).max(8),
    methodologyVersion: z.string().regex(/^v\d+$/),
  })
  .superRefine((value, context) => {
    const categoryIds = value.categoryScores.map((category) => category.id);
    const uniqueCategoryIds = new Set(categoryIds);

    if (
      uniqueCategoryIds.size !== auditCategoryIds.length ||
      auditCategoryIds.some((id) => !uniqueCategoryIds.has(id))
    ) {
      context.addIssue({
        code: "custom",
        message: "The result must contain each registered audit category once.",
        path: ["categoryScores"],
      });
    }

    const findingIds = value.findings.map((finding) => finding.id);

    if (new Set(findingIds).size !== findingIds.length) {
      context.addIssue({
        code: "custom",
        message: "Finding IDs must be unique.",
        path: ["findings"],
      });
    }
  });

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);

    for (const nestedValue of Object.values(value)) {
      deepFreeze(nestedValue);
    }
  }

  return value;
}

export function normalizeAuditResult(input: unknown): WebsiteAuditResult {
  const result = websiteAuditResultSchema.parse(input);
  const categoryOrder = new Map(
    auditCategoryIds.map((categoryId, index) => [categoryId, index]),
  );

  result.categoryScores.sort(
    (left, right) =>
      (categoryOrder.get(left.id) ?? 0) - (categoryOrder.get(right.id) ?? 0),
  );

  return deepFreeze(result) as WebsiteAuditResult;
}

export function toNormalizedScore(value: number): number {
  if (!Number.isFinite(value)) {
    throw new TypeError("Audit scores must be finite numbers.");
  }

  return Math.min(100, Math.max(0, Math.round(value)));
}
