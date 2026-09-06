import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { auditTimeBudgets, remainingBudgetMs } from "../../lib/website-audit/time-budgets";
import { runPageSpeedAudit } from "../../lib/website-audit/providers/pagespeed";

const successfulResponse = () => Response.json({ lighthouseResult: {
  categories: { performance: { score: 0.9 } }, audits: {}, timing: { total: 36000 },
} });

test("budgets reserve scoring, persistence and platform headroom, including preflight and slow crawl", async () => {
  assert.ok(auditTimeBudgets.pageSpeedMs < auditTimeBudgets.engineMs - auditTimeBudgets.scoringReserveMs);
  assert.ok(auditTimeBudgets.routeMs - auditTimeBudgets.engineMs >= 4000);
  assert.ok(auditTimeBudgets.platformMs - auditTimeBudgets.routeMs >= 5000);
  const providerDeadline = auditTimeBudgets.engineMs - auditTimeBudgets.scoringReserveMs;
  assert.equal(remainingBudgetMs(providerDeadline, auditTimeBudgets.pageSpeedMs, 8000), 41000);
  assert.equal(remainingBudgetMs(providerDeadline, auditTimeBudgets.pageSpeedMs, 1800), 44000);
  assert.equal(remainingBudgetMs(providerDeadline, auditTimeBudgets.pageSpeedMs, 60000), 0);
  const route = await readFile(new URL("../../app/api/website-audits/[id]/run/route.ts", import.meta.url), "utf8");
  assert.match(route, new RegExp(`export const maxDuration = ${auditTimeBudgets.platformMs / 1000};`));
  assert.match(route, /deadlineAt: routeStartedAt \+ auditTimeBudgets.engineMs/);
});

test("PageSpeed can finish after the old 36-second boundary within the new shared deadline", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  let requestSignal: AbortSignal | null | undefined;
  const pending = runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key", fetchImpl: async (_input, init) => {
      requestSignal = init?.signal;
      return new Promise<Response>((resolve, reject) => {
        const timer = setTimeout(() => resolve(successfulResponse()), 36500);
        requestSignal!.addEventListener("abort", () => { clearTimeout(timer); reject(requestSignal!.reason); }, { once: true });
      });
    },
  });
  t.mock.timers.tick(36000);
  assert.equal(requestSignal?.aborted, false);
  t.mock.timers.tick(500);
  const result = await pending;
  assert.ok(result.available);
  assert.equal(result.performanceScore, 90);
});

test("a reduced parent deadline aborts PSI and never returns a zero performance score", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  let attempts = 0;
  const pending = runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key", deadlineAt: 37000,
    fetchImpl: async (_input, init) => {
      attempts += 1;
      return new Promise<Response>((_resolve, reject) => {
        init!.signal!.addEventListener("abort", () => reject(init!.signal!.reason), { once: true });
      });
    },
  });
  t.mock.timers.tick(37000);
  assert.deepEqual(await pending, { available: false, reason: "timeout" });
  assert.equal(attempts, 1);
});

test("late server failures cannot start a retry without 20 seconds remaining", async (t) => {
  t.mock.timers.enable({ apis: ["setTimeout", "Date"], now: 0 });
  let attempts = 0;
  const pending = runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key", fetchImpl: async () => {
      attempts += 1;
      return new Promise<Response>((resolve) => setTimeout(() => resolve(new Response(null, { status: 503 })), 30000));
    },
  });
  t.mock.timers.tick(30000);
  assert.deepEqual(await pending, { available: false, reason: "provider_error" });
  assert.equal(attempts, 1);
});

test("abort during network-error retry delay stays a graceful unavailable result", async () => {
  const controller = new AbortController();
  const pending = runPageSpeedAudit("https://example.com/", {
    apiKey: "test-key", signal: controller.signal,
    fetchImpl: async () => { throw new TypeError("private upstream data"); },
  });
  await Promise.resolve();
  controller.abort();
  assert.deepEqual(await pending, { available: false, reason: "timeout" });
});

test("provider logs successful duration and allowlisted failure details without sensitive data", async (t) => {
  const logs: unknown[][] = [];
  t.mock.method(console, "info", (...args: unknown[]) => { logs.push(args); });
  t.mock.method(console, "warn", (...args: unknown[]) => { logs.push(args); });
  await runPageSpeedAudit("https://private.example/?token=secret", { apiKey: "private-key", fetchImpl: async () => successfulResponse() });
  const failure = new Error("private.example secret cookies body");
  failure.name = "private-key";
  await runPageSpeedAudit("https://private.example/?token=secret", { apiKey: "private-key", fetchImpl: async () => { throw failure; } });
  const output = JSON.stringify(logs);
  assert.match(output, /provider completed/);
  assert.match(output, /durationMs/);
  assert.match(output, /responseBytes/);
  assert.match(output, /network_error/);
  assert.doesNotMatch(output, /private|secret|cookies|https:|token=/);
});
