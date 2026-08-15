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

test(
  "distinguishes clipped visuals and off-canvas UI from unreachable content",
  { timeout: 30_000 },
  async () => {
    const executablePath = playwrightChromium.executablePath();
    await access(executablePath);
    const audit = async (body: string, styles: string) =>
      runRenderedMobileAudit(
        {
          submittedUrl: "https://example.com/",
          finalUrl: "https://example.com/",
          redirectCount: 0,
          html: `<!doctype html><html><head>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>html, body { margin: 0; } ${styles}</style>
          </head><body>${body}</body></html>`,
          primaryPage: {},
        } as PrimaryCrawlData,
        { browserExecutablePathForTesting: executablePath },
      );

    const decorative = await audit(
      `<section class="hero"><h1>Healthy hero</h1><img alt="" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='200'/%3E"></section>`,
      `.hero { position: relative; width: 100%; height: 220px; overflow: hidden; }
       .hero img { position: absolute; width: 800px; height: 200px; left: 40%; object-fit: cover; }`,
    );
    const offCanvas = await audit(
      `<main><h1>Page</h1></main><nav aria-hidden="true"><a href="/menu">Menu item</a></nav>`,
      `nav { position: fixed; left: 100vw; width: 280px; transform: translateX(100%); }`,
    );
    const carousel = await audit(
      `<main><h1>Products</h1><div class="carousel"><div class="track"><img alt="One" width="390" height="200"><img alt="Two" width="390" height="200"></div></div></main>`,
      `.carousel { width: 100%; overflow: hidden; }
       .track { display: flex; width: 780px; transform: translateX(0); }
       .track img { flex: 0 0 390px; }`,
    );
    const unreachableAction = await audit(
      `<main><h1>Book a service</h1><a class="cta" href="/contact">Get a quote</a></main>`,
      `.cta { position: fixed; left: 520px; top: 100px; width: 140px; height: 44px; }`,
    );
    const stableImage = await audit(
      `<main><h1>Stable image</h1><img class="stable" alt="Example" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='200'/%3E"></main>`,
      `.stable { display: block; width: 100%; aspect-ratio: 2 / 1; object-fit: cover; }`,
    );

    for (const result of [
      decorative,
      offCanvas,
      carousel,
      unreachableAction,
      stableImage,
    ]) {
      assert.equal(result.available, true);
    }
    if (
      !decorative.available ||
      !offCanvas.available ||
      !carousel.available ||
      !unreachableAction.available ||
      !stableImage.available
    ) {
      return;
    }

    assert.equal(decorative.metrics.horizontalScrollPixels, 0);
    assert.equal(decorative.metrics.overflowingImageCount, 0);
    assert.equal(offCanvas.metrics.clippedNavigation, false);
    assert.equal(carousel.metrics.overflowingImageCount, 0);
    assert.equal(unreachableAction.metrics.offscreenPrimaryActionCount, 1);
    assert.equal(stableImage.metrics.missingDimensionImageCount, 1);
    assert.equal(stableImage.metrics.unreservedImageCount, 0);
  },
);
