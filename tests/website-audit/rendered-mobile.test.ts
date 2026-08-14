import assert from "node:assert/strict";
import { after, test } from "node:test";
import type { PrimaryCrawlData } from "../../lib/website-audit/crawler";
import {
  closeRenderedMobileBrowserForTesting,
  runRenderedMobileAudit,
} from "../../lib/website-audit/providers/rendered-mobile";

const primary = (body: string): PrimaryCrawlData =>
  ({
    submittedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    redirectCount: 0,
    html: `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1"><style>html,body{margin:0}</style></head><body>${body}</body></html>`,
    primaryPage: {},
  }) as PrimaryCrawlData;

after(() => closeRenderedMobileBrowserForTesting());

test("measures responsive and broken mobile layouts at one bounded viewport", async () => {
  const responsive = await runRenderedMobileAudit(
    primary('<main style="max-width:100%"><h1>Responsive page</h1></main>'),
  );
  const severeOverflow = await runRenderedMobileAudit(
    primary('<main style="width:1000px"><h1>Broken page</h1></main>'),
  );
  const overflowingImage = await runRenderedMobileAudit(
    primary(
      '<main><img alt="Example" width="800" height="200" src="data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'800\' height=\'200\'/%3E"></main>',
    ),
  );
  const clippedNavigation = await runRenderedMobileAudit(
    primary(
      '<nav style="width:700px"><a href="/contact">Contact us</a></nav><main><h1>Page</h1></main>',
    ),
  );
  const tinyOverflow = await runRenderedMobileAudit(
    primary('<main style="width:396px"><h1>Small rounding difference</h1></main>'),
  );

  for (const result of [
    responsive,
    severeOverflow,
    overflowingImage,
    clippedNavigation,
    tinyOverflow,
  ]) {
    assert.equal(result.available, true);
  }

  if (
    !responsive.available ||
    !severeOverflow.available ||
    !overflowingImage.available ||
    !clippedNavigation.available ||
    !tinyOverflow.available
  ) {
    return;
  }

  assert.equal(responsive.metrics.horizontalOverflowPixels, 0);
  assert.ok(severeOverflow.metrics.horizontalOverflowPixels >= 600);
  assert.ok(severeOverflow.metrics.fixedWidthElementCount >= 1);
  assert.ok(overflowingImage.metrics.overflowingImageCount >= 1);
  assert.equal(clippedNavigation.metrics.clippedNavigation, true);
  assert.ok(tinyOverflow.metrics.horizontalOverflowPixels <= 8);

  const previousChromePath = process.env.WEBSITE_AUDIT_CHROME_PATH;

  try {
    await closeRenderedMobileBrowserForTesting();
    process.env.WEBSITE_AUDIT_CHROME_PATH = "Z:\\missing\\chrome.exe";
    const unavailable = await runRenderedMobileAudit(
      primary("<main><h1>Provider fallback</h1></main>"),
    );

    assert.deepEqual(unavailable, {
      available: false,
      reason: "browser_unavailable",
    });
  } finally {
    if (previousChromePath === undefined) {
      delete process.env.WEBSITE_AUDIT_CHROME_PATH;
    } else {
      process.env.WEBSITE_AUDIT_CHROME_PATH = previousChromePath;
    }
  }
});

test("counts only genuinely interactive controls as extremely small", async () => {
  const result = await runRenderedMobileAudit(
    primary(`
      <style>.tiny { display: inline-block; width: 12px; height: 12px; padding: 0; }</style>
      <button class="tiny" aria-label="Real action"></button>
      <button class="tiny" disabled aria-label="Disabled action"></button>
      <button class="tiny" aria-disabled="true" aria-label="ARIA-disabled action"></button>
      <span class="tiny" role="button" aria-hidden="true"></span>
      <span class="tiny" role="button">Non-focusable decorative role</span>
      <a class="tiny" href="/ignored" style="pointer-events:none" aria-label="Decorative link"></a>
      <input id="consent" type="checkbox"><label for="consent">I agree</label>
    `),
  );

  assert.equal(result.available, true);
  if (!result.available) return;

  assert.equal(result.metrics.interactiveControlCount, 2);
  assert.equal(result.metrics.seriousTapTargetCount, 1);
});
