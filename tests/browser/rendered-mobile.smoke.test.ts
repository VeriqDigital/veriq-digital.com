import assert from "node:assert/strict";
import { access } from "node:fs/promises";
import { after, test } from "node:test";
import { chromium as playwrightChromium } from "playwright-core";
import type { PrimaryCrawlData } from "../../lib/website-audit/crawler";
import {
  closeRenderedMobileBrowserForTesting,
  runRenderedMobileAudit,
} from "../../lib/website-audit/providers/rendered-mobile";

after(() => closeRenderedMobileBrowserForTesting());

test(
  "renders one bounded mobile layout with Playwright Chromium",
  { timeout: 15_000 },
  async () => {
    const executablePath = playwrightChromium.executablePath();
    await access(executablePath);
    console.info("Playwright Chromium executable", { executablePath });

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
    const result = await runRenderedMobileAudit(primary, {
      browserExecutablePathForTesting: executablePath,
    });

    assert.equal(
      result.available,
      true,
      `Playwright Chromium smoke failed (${result.available ? "unknown" : result.reason}) using ${executablePath}.`,
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
