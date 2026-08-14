import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { after, test } from "node:test";
import serverlessChromium from "@sparticuz/chromium";
import { chromium as playwrightChromium } from "playwright-core";
import type { PrimaryCrawlData } from "../../lib/website-audit/crawler";
import {
  closeRenderedMobileBrowserForTesting,
  runRenderedMobileAudit,
} from "../../lib/website-audit/providers/rendered-mobile";

const originalServerlessArgs = Object.getOwnPropertyDescriptor(
  serverlessChromium,
  "args",
);
const originalPlaywrightLaunch = Object.getOwnPropertyDescriptor(
  playwrightChromium,
  "launch",
);
const launchBrowser = playwrightChromium.launch.bind(playwrightChromium);
let launchDiagnostic = "";

const safeLaunchDiagnostic = (error: unknown) => {
  const errorName = error instanceof Error ? error.name : "UnknownError";
  const errorMessage = error instanceof Error ? error.message : String(error);

  return `${errorName}: ${errorMessage}`
    .replace(/https?:\/\/\S+/gi, "[URL omitted]")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "")
    .slice(0, 8_000);
};

// The production provider needs Sparticuz's serverless arguments. This isolated
// smoke-test process instead launches the GitHub runner's system Chromium with
// a minimal Linux CI profile and Playwright's normal headless defaults.
Object.defineProperty(serverlessChromium, "args", {
  configurable: true,
  get: () => [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
  ],
});
Object.defineProperty(playwrightChromium, "launch", {
  configurable: true,
  value: async (...args: Parameters<typeof playwrightChromium.launch>) => {
    try {
      return await launchBrowser(...args);
    } catch (error) {
      launchDiagnostic = safeLaunchDiagnostic(error);
      throw error;
    }
  },
});

after(async () => {
  await closeRenderedMobileBrowserForTesting();

  if (originalServerlessArgs) {
    Object.defineProperty(serverlessChromium, "args", originalServerlessArgs);
  }

  if (originalPlaywrightLaunch) {
    Object.defineProperty(
      playwrightChromium,
      "launch",
      originalPlaywrightLaunch,
    );
  } else {
    Reflect.deleteProperty(playwrightChromium, "launch");
  }
});

test(
  "renders one bounded mobile layout with the CI browser",
  { timeout: 12_000 },
  async () => {
    const executablePath =
      process.env.CI_RENDERED_MOBILE_CHROME_PATH?.trim();

    assert.ok(
      executablePath,
      "Browser smoke test requires CI_RENDERED_MOBILE_CHROME_PATH to identify the CI system browser.",
    );
    await access(executablePath);
    process.env.WEBSITE_AUDIT_CHROME_PATH = executablePath;

    const primary = {
      submittedUrl: "https://example.com/",
      finalUrl: "https://example.com/",
      redirectCount: 0,
      html: `<!doctype html>
        <html>
          <head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              html, body { margin: 0; }
              .tiny { display: inline-block; width: 12px; height: 12px; padding: 0; }
            </style>
          </head>
          <body>
            <nav style="width: 700px"><a href="/contact">Contact us</a></nav>
            <main style="width: 1000px">
              <h1>Broken mobile layout</h1>
              <img alt="Example" width="800" height="200"
                src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'/%3E">
              <button class="tiny" aria-label="Real action"></button>
            </main>
          </body>
        </html>`,
      primaryPage: {},
    } as PrimaryCrawlData;
    const result = await runRenderedMobileAudit(primary, { timeoutMs: 7_000 });

    assert.equal(
      result.available,
      true,
      [
        `System browser smoke failed (${result.available ? "unknown" : result.reason}) using ${executablePath}.`,
        launchDiagnostic ||
          "No Playwright launch error was captured; failure occurred after browser startup.",
      ].join("\n"),
    );
    if (!result.available) return;

    assert.equal(result.metrics.viewportWidth, 390);
    assert.ok(result.metrics.horizontalOverflowPixels >= 600);
    assert.ok(result.metrics.fixedWidthElementCount >= 1);
    assert.ok(result.metrics.overflowingImageCount >= 1);
    assert.equal(result.metrics.clippedNavigation, true);
    assert.equal(result.metrics.interactiveControlCount, 2);
    assert.equal(result.metrics.seriousTapTargetCount, 1);
  },
);
