import assert from "node:assert/strict";
import test from "node:test";
import type { Browser } from "playwright-core";
import type { PrimaryCrawlData } from "../../lib/website-audit/crawler";
import { runRenderedMobileAudit } from "../../lib/website-audit/providers/rendered-mobile";
import { classifyRenderFailure, logRenderedFailure, RenderStageError, runRenderedStage, type RenderStage } from "../../lib/website-audit/providers/rendered-diagnostics";

test("render failures carry precise stages and never propagate upstream content into diagnostics", async (t) => {
  const logs: unknown[][] = [];
  t.mock.method(console, "warn", (...args: unknown[]) => { logs.push(args); });
  const stages: RenderStage[] = ["executable_resolution", "browser_launch", "browser_connection", "context_creation", "page_creation", "sanitization", "route_setup", "navigation", "resource_fulfillment", "measurement", "context_close"];
  for (const stage of stages) {
    const upstream = new Error("https://private.example/?token=secret HTML cookies request body");
    upstream.name = "arbitrary-secret-name";
    try {
      await runRenderedStage(stage, async () => { throw upstream; });
      assert.fail("expected stage failure");
    } catch (error) {
      assert.ok(error instanceof RenderStageError);
      assert.equal(error.stage, stage);
      const reason = logRenderedFailure(error, 359);
      assert.equal(reason, ["executable_resolution", "browser_launch", "browser_connection"].includes(stage) ? "browser_unavailable" : "render_error");
    }
  }
  const output = JSON.stringify(logs);
  assert.doesNotMatch(output, /private|secret|https:|HTML|cookies|request body/);
  for (const stage of stages) assert.ok(output.includes(stage));
  assert.match(output, /"durationMs":359/);
});

test("known Chromium and OS failure classes are allowlisted", () => {
  for (const [message, code] of [
    ["Target page, context or browser has been closed https://private.example", "browser_closed"],
    ["page crashed", "browser_crashed"],
    ["Protocol error private contents", "protocol_error"],
    ["net::ERR_FAILED at https://private.example", "navigation_network_error"],
    ["ReferenceError: __name is not defined", "evaluation_reference_error"],
    ["error while loading shared libraries: private-file", "missing_runtime_library"],
  ] as const) assert.equal(classifyRenderFailure(new Error(message)), code);
  assert.equal(classifyRenderFailure(Object.assign(new Error("private-path"), { code: "ENOENT" })), "executable_missing");
  assert.equal(classifyRenderFailure(Object.assign(new Error("private-path"), { code: "secret-code" })), "operation_failed");
});

test("nested browser startup errors preserve launch stage instead of becoming connection failures", async () => {
  await assert.rejects(runRenderedStage("browser_connection", () =>
    runRenderedStage("browser_launch", async () => { throw new Error("launch failed"); })),
  (error: unknown) => error instanceof RenderStageError && error.stage === "browser_launch");
});

test("provider classifies page/context/navigation/measurement failures and closes created contexts", async (t) => {
  const logs: unknown[][] = [];
  t.mock.method(console, "warn", (...args: unknown[]) => { logs.push(args); });
  for (const failingStage of ["context_creation", "page_creation", "route_setup", "navigation", "measurement"] as const) {
    let closes = 0;
    const failAt = (stage: string) => {
      if (stage === failingStage) throw new Error("upstream https://private.example/ secret page contents");
    };
    const browser = {
      newContext: async () => {
        failAt("context_creation");
        return {
          close: async () => {
            closes += 1;
            if (failingStage === "page_creation") throw new Error("private cleanup contents");
          },
          newPage: async () => {
            failAt("page_creation");
            return {
              addInitScript: async () => { failAt("route_setup"); },
              route: async () => {},
              goto: async () => { failAt("navigation"); },
              waitForTimeout: async () => {},
              evaluate: async () => { failAt("measurement"); },
            };
          },
        };
      },
    } as unknown as Browser;
    const result = await runRenderedMobileAudit({
      finalUrl: "https://private.example/", html: "<html><body>private content</body></html>",
    } as PrimaryCrawlData, { browserForTesting: browser });
    assert.deepEqual(result, { available: false, reason: "render_error" });
    assert.equal(closes, failingStage === "context_creation" ? 0 : 1);
    assert.equal((logs.at(-1)![1] as { stage: string }).stage, failingStage);
  }
  assert.doesNotMatch(JSON.stringify(logs), /private|secret|https:|upstream/);
  assert.match(JSON.stringify(logs), /cleanup failed/);
});

test("an actual browser launch failure is classified separately from rendered page failures", async (t) => {
  const logs: unknown[][] = [];
  t.mock.method(console, "warn", (...args: unknown[]) => { logs.push(args); });
  const result = await runRenderedMobileAudit({ finalUrl: "https://private.example/", html: "private" } as PrimaryCrawlData,
    { browserExecutablePathForTesting: "Z:\\private-missing-browser\\chrome.exe" });
  assert.deepEqual(result, { available: false, reason: "browser_unavailable" });
  assert.equal((logs.at(-1)![1] as { stage: string }).stage, "browser_launch");
  assert.doesNotMatch(JSON.stringify(logs), /private|chrome.exe|https:/);
});
