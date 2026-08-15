import assert from "node:assert/strict";
import { after, test } from "node:test";
import type { PrimaryCrawlData } from "../../lib/website-audit/crawler";
import {
  closeRenderedMobileBrowserForTesting,
  interpretRenderedMobileMeasurement,
  runRenderedMobileAudit,
  type RenderedControlMeasurement,
  type RenderedMobileMeasurement,
} from "../../lib/website-audit/providers/rendered-mobile";

const primary = (body: string): PrimaryCrawlData =>
  ({
    submittedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    redirectCount: 0,
    html: `<!doctype html><html><body>${body}</body></html>`,
    primaryPage: {},
  }) as PrimaryCrawlData;

const measurement = (
  overrides: Partial<RenderedMobileMeasurement> = {},
): RenderedMobileMeasurement => ({
  viewportWidth: 390,
  documentWidth: 390,
  horizontalOverflowPixels: 0,
  horizontalScrollPixels: 0,
  wideElementCount: 0,
  fixedWidthElementCount: 0,
  overflowingImageCount: 0,
  intentionallyClippedImageCount: 0,
  potentialOverflowElementCount: 0,
  clippedBaseImportantElementCount: 0,
  potentiallyClippedImportantElementCount: 0,
  navigationMateriallyOutside: false,
  missingDimensionImageCount: 0,
  unreservedImageCount: 0,
  controls: [],
  tinyTextCount: 0,
  textSampleCount: 12,
  ...overrides,
});

const control = (
  overrides: Partial<RenderedControlMeasurement>,
): RenderedControlMeasurement => ({
  elementKind: "other",
  href: null,
  role: null,
  tabIndex: -1,
  disabled: false,
  hiddenInput: false,
  blocked: false,
  width: 12,
  height: 12,
  hasAdequateLabelTarget: false,
  primaryAction: false,
  materiallyOutside: false,
  potentiallyOutside: false,
  intentionallyOffCanvas: false,
  insideNavigation: false,
  importantElement: false,
  ...overrides,
});

after(() => closeRenderedMobileBrowserForTesting());

test("interprets responsive, catastrophic, image, clipped, and harmless-overflow fixtures", () => {
  const responsive = interpretRenderedMobileMeasurement(measurement());
  const severeOverflow = interpretRenderedMobileMeasurement(
    measurement({
      documentWidth: 1_000,
      horizontalOverflowPixels: 610,
      horizontalScrollPixels: 610,
      wideElementCount: 2,
      fixedWidthElementCount: 1,
    }),
  );
  const overflowingImage = interpretRenderedMobileMeasurement(
    measurement({ overflowingImageCount: 1 }),
  );
  const clippedNavigation = interpretRenderedMobileMeasurement(
    measurement({
      clippedBaseImportantElementCount: 2,
      navigationMateriallyOutside: true,
      controls: [
        control({
          elementKind: "anchor",
          href: "/contact",
          primaryAction: true,
          materiallyOutside: true,
          insideNavigation: true,
        }),
      ],
    }),
  );
  const tinyOverflow = interpretRenderedMobileMeasurement(
    measurement({
      documentWidth: 396,
      horizontalOverflowPixels: 6,
      horizontalScrollPixels: 6,
    }),
  );

  assert.equal(responsive.horizontalOverflowPixels, 0);
  assert.equal(severeOverflow.horizontalOverflowPixels, 610);
  assert.equal(severeOverflow.fixedWidthElementCount, 1);
  assert.equal(overflowingImage.overflowingImageCount, 1);
  assert.equal(clippedNavigation.clippedNavigation, true);
  assert.equal(clippedNavigation.clippedImportantElementCount, 3);
  assert.equal(clippedNavigation.offscreenPrimaryActionCount, 1);
  assert.equal(tinyOverflow.horizontalOverflowPixels, 6);
});

test("counts only genuinely interactive controls as extremely small", () => {
  const metrics = interpretRenderedMobileMeasurement(
    measurement({
      controls: [
        control({ elementKind: "button" }),
        control({ elementKind: "button", disabled: true }),
        control({ elementKind: "button", blocked: true }),
        control({ role: "button", tabIndex: 0, blocked: true }),
        control({ role: "button" }),
        control({ elementKind: "anchor", href: "/ignored", blocked: true }),
        control({
          elementKind: "input",
          hasAdequateLabelTarget: true,
        }),
      ],
    }),
  );

  assert.equal(metrics.interactiveControlCount, 2);
  assert.equal(metrics.seriousTapTargetCount, 1);
});

test("does not promote clipped decoration, closed navigation, or carousel neighbors to confirmed defects", () => {
  const metrics = interpretRenderedMobileMeasurement(
    measurement({
      intentionallyClippedImageCount: 3,
      potentialOverflowElementCount: 4,
      potentiallyClippedImportantElementCount: 1,
      controls: [
        control({
          elementKind: "anchor",
          href: "/menu",
          insideNavigation: true,
          potentiallyOutside: true,
          intentionallyOffCanvas: true,
        }),
      ],
    }),
  );

  assert.equal(metrics.horizontalScrollPixels, 0);
  assert.equal(metrics.overflowingImageCount, 0);
  assert.equal(metrics.clippedImportantElementCount, 0);
  assert.equal(metrics.offscreenPrimaryActionCount, 0);
  assert.equal(metrics.intentionallyClippedImageCount, 3);
  assert.equal(metrics.potentialOverflowElementCount, 4);
});

test("confirms a meaningful action that is outside and unreachable", () => {
  const metrics = interpretRenderedMobileMeasurement(
    measurement({
      controls: [
        control({
          elementKind: "anchor",
          href: "/contact",
          primaryAction: true,
          materiallyOutside: true,
          potentiallyOutside: true,
        }),
      ],
    }),
  );

  assert.equal(metrics.offscreenPrimaryActionCount, 1);
  assert.equal(metrics.clippedImportantElementCount, 1);
});

test("keeps missing image attributes separate from rendered layout reservation", () => {
  const stableCssRatio = interpretRenderedMobileMeasurement(
    measurement({
      missingDimensionImageCount: 1,
      unreservedImageCount: 0,
    }),
  );
  const unreserved = interpretRenderedMobileMeasurement(
    measurement({
      missingDimensionImageCount: 1,
      unreservedImageCount: 1,
    }),
  );

  assert.equal(stableCssRatio.unreservedImageCount, 0);
  assert.equal(unreserved.unreservedImageCount, 1);
});

test(
  "degrades immediately when the configured browser executable is unavailable",
  { timeout: 2_000 },
  async () => {
    const previousChromePath = process.env.WEBSITE_AUDIT_CHROME_PATH;

    try {
      process.env.WEBSITE_AUDIT_CHROME_PATH = "Z:\\missing\\chrome.exe";
      const unavailable = await runRenderedMobileAudit(
        primary("<main><h1>Provider fallback</h1></main>"),
        { timeoutMs: 500 },
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
  },
);
