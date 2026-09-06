import assert from "node:assert/strict";
import test from "node:test";
import { buildAuditChecks } from "../../lib/website-audit/checks";
import { CURRENT_AUDIT_METHODOLOGY_VERSION } from "../../lib/website-audit/methodology";
import { dynamicRestrictedHtml } from "./fixtures/restricted-render";
import { sanitizeRenderedHtml } from "../../lib/website-audit/providers/rendered-mobile";
import { assessRenderFidelity, createRenderFidelityMetrics } from "../../lib/website-audit/render-fidelity";
import type { CrawlAuditData } from "../../lib/website-audit/crawl-types";
import type {
  PageSpeedData,
  RenderedMobileData,
  RenderedMobileMetrics,
} from "../../lib/website-audit/model";
import type { PageSnapshot } from "../../lib/website-audit/page-analysis";
import { parsePageSnapshot } from "../../lib/website-audit/page-analysis";
import { bigUglyFoundationsHtml, strongFoundationsHtml } from "./fixtures/foundations";
import { buildAuditResult } from "../../lib/website-audit/scoring";

const makePage = (overrides: Partial<PageSnapshot> = {}): PageSnapshot => ({
  url: "https://example.com/",
  statusCode: 200,
  htmlBytes: 12_000,
  title: "Example Business | Helpful Local Service",
  metaDescription:
    "A clear description of the local service, who it helps, and how to get started today.",
  canonicalUrl: "https://example.com/",
  canonicalInvalid: false,
  robotsDirectives: [],
  headings: [
    { level: 1, text: "A clear primary heading" },
    { level: 2, text: "How we help" },
  ],
  h1s: ["A clear primary heading"],
  hasViewport: true,
  documentLanguage: "en",
  imageCount: 2,
  missingAltImageCount: 0,
  missingDimensionImageCount: 0,
  responsiveImageCount: 2,
  structuredDataCount: 1,
  formCount: 1,
  contactFormCount: 1,
  unverifiedContactFormCount: 0,
  formControlCount: 2,
  unlabeledFormControlCount: 0,
  contactLinkCount: 1,
  actionLinkCount: 1,
  unverifiedActionControlCount: 0,
  mixedContentCount: 0,
  internalLinks: ["https://example.com/contact"],
  ...overrides,
});

const makeCrawl = (primaryPage = makePage()): CrawlAuditData => ({
  submittedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  redirectCount: 0,
  primaryPage,
  pages: [primaryPage],
  robots: {
    status: "present",
    blocksPrimaryPage: false,
    blocksOptionalCrawl: false,
    sitemapUrl: "https://example.com/sitemap.xml",
  },
  sitemapStatus: "present",
  brokenLinks: { tested: 1, broken: [], unavailable: 0 },
});

const pageSpeed: PageSpeedData = {
  available: true,
  performanceScore: 95,
  accessibilityScore: 95,
  seoScore: 95,
  metrics: {},
  audits: {
    tapTargets: 100,
    contentWidth: 100,
    colorContrast: 100,
    linkName: 100,
    buttonName: 100,
  },
};

const makeRenderedMobile = (
  overrides: Partial<RenderedMobileMetrics> = {},
): RenderedMobileData => ({
  available: true,
  renderFidelity: assessRenderFidelity(createRenderFidelityMetrics()),
  metrics: {
    viewportWidth: 390,
    documentWidth: 390,
    horizontalOverflowPixels: 0,
    horizontalScrollPixels: 0,
    wideElementCount: 0,
    fixedWidthElementCount: 0,
    overflowingImageCount: 0,
    intentionallyClippedImageCount: 0,
    potentialOverflowElementCount: 0,
    clippedImportantElementCount: 0,
    potentiallyClippedImportantElementCount: 0,
    clippedNavigation: false,
    offscreenPrimaryActionCount: 0,
    primaryActionCount: 1,
    seriousPrimaryActionCount: 0,
    missingDimensionImageCount: 0,
    unreservedImageCount: 0,
    seriousTapTargetCount: 0,
    interactiveControlCount: 4,
    tinyTextCount: 0,
    textSampleCount: 20,
    ...overrides,
  },
});

const buildResultWithRenderedMobile = (renderedMobile: RenderedMobileData) => {
  const { checks, notices } = buildAuditChecks(
    makeCrawl(),
    pageSpeed,
    renderedMobile,
  );

  return {
    checks,
    result: buildAuditResult({
      id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2",
      auditedUrl: "https://example.com/",
      createdAt: "2026-08-12T12:00:00.000Z",
      completedAt: "2026-08-12T12:00:10.000Z",
      checks,
      notices,
    }),
  };
};

test("representative direct checks cover every canonical category", () => {
  const { checks, notices } = buildAuditChecks(makeCrawl(), {
    available: false,
    reason: "not_configured",
  });
  const categories = new Set(checks.map((check) => check.category));

  assert.deepEqual(
    [...categories].sort(),
    [
      "accessibility",
      "conversion-ux",
      "mobile-experience",
      "performance",
      "seo",
      "technical-health",
    ].sort(),
  );
  assert.equal(new Set(checks.map((check) => check.id)).size, checks.length);
  assert.ok(notices.some((notice) => notice.includes("excluded")));
  assert.ok(
    checks
      .filter((check) => check.category === "performance")
      .every((check) => check.status === "unavailable"),
  );
});

test("missing objective page signals produce plain-English findings", () => {
  const page = makePage({
    title: "",
    metaDescription: "",
    h1s: [],
    headings: [],
    hasViewport: false,
    documentLanguage: "",
    imageCount: 2,
    missingAltImageCount: 2,
    formCount: 0,
    contactFormCount: 0,
    actionLinkCount: 0,
    contactLinkCount: 0,
  });
  const { checks } = buildAuditChecks(makeCrawl(page), {
    available: false,
    reason: "provider_error",
  });
  const byId = new Map(checks.map((check) => [check.id, check]));

  for (const id of [
    "seo-title",
    "seo-meta-description",
    "seo-h1",
    "mobile-viewport",
    "accessibility-image-alt",
    "accessibility-language",
  ]) {
    assert.equal(byId.get(id)?.status, "failed", id);
    assert.ok(byId.get(id)?.finding?.recommendation, id);
  }

  assert.equal(byId.get("conversion-action-path")?.status, "failed");
  assert.equal(byId.get("conversion-contact-path")?.status, "failed");
});

test("robots blocking and cross-page canonicals stay explicit and conservative", () => {
  const page = makePage({ canonicalUrl: "https://example.com/different-page" });
  const crawl: CrawlAuditData = {
    ...makeCrawl(page),
    robots: {
      status: "present",
      blocksPrimaryPage: true,
      blocksOptionalCrawl: true,
      sitemapUrl: null,
    },
  };
  const { checks } = buildAuditChecks(crawl, {
    available: false,
    reason: "not_configured",
  });
  const byId = new Map(checks.map((check) => [check.id, check]));

  assert.equal(byId.get("seo-robots-access")?.status, "failed");
  assert.equal(byId.get("seo-robots-access")?.finding?.severity, "high");
  assert.equal(byId.get("seo-robots-access")?.overallScoreCap, 69);
  assert.equal(byId.get("seo-canonical")?.status, "opportunity");
});

test("a responsive rendered page keeps the objective mobile checks healthy", () => {
  const { checks, result } = buildResultWithRenderedMobile(makeRenderedMobile());
  const renderedChecks = checks.filter((check) =>
    check.id.startsWith("mobile-rendered-"),
  );
  const mobile = result.categoryScores.find(
    (category) => category.id === "mobile-experience",
  );

  assert.ok(renderedChecks.every((check) => check.status === "passed"));
  assert.ok((mobile?.score ?? 0) >= 90);
});

test("catastrophic horizontal overflow cannot receive a 90+ mobile score", () => {
  const audit = buildResultWithRenderedMobile(
    makeRenderedMobile({
      documentWidth: 1_000,
      horizontalOverflowPixels: 610,
      horizontalScrollPixels: 610,
      wideElementCount: 2,
      fixedWidthElementCount: 1,
    }),
  );
  const widthCheck = audit.checks.find(
    (check) => check.id === "mobile-rendered-width",
  );
  const mobile = audit.result.categoryScores.find(
    (category) => category.id === "mobile-experience",
  );

  assert.equal(widthCheck?.finding?.severity, "critical");
  assert.ok((mobile?.score ?? 100) <= 49);
  assert.ok((mobile?.score ?? 100) < 90);
});

test("a fixed-width container wider than the viewport is a rendered failure", () => {
  const { checks } = buildResultWithRenderedMobile(
    makeRenderedMobile({
      documentWidth: 620,
      horizontalOverflowPixels: 230,
      horizontalScrollPixels: 230,
      wideElementCount: 1,
      fixedWidthElementCount: 1,
    }),
  );
  const widthCheck = checks.find(
    (check) => check.id === "mobile-rendered-width",
  );

  assert.equal(widthCheck?.status, "failed");
  assert.match(widthCheck?.finding?.observedValue ?? "", /fixed-width/);
});

test("overflowing images and clipped navigation produce specific findings", () => {
  const { checks, result } = buildResultWithRenderedMobile(
    makeRenderedMobile({
      documentWidth: 700,
      horizontalOverflowPixels: 310,
      horizontalScrollPixels: 310,
      wideElementCount: 1,
      fixedWidthElementCount: 1,
      overflowingImageCount: 2,
      clippedImportantElementCount: 2,
      clippedNavigation: true,
      offscreenPrimaryActionCount: 1,
    }),
  );
  const imageCheck = checks.find(
    (check) => check.id === "mobile-rendered-images",
  );
  const widthCheck = checks.find(
    (check) => check.id === "mobile-rendered-width",
  );
  const contentCheck = checks.find(
    (check) => check.id === "mobile-rendered-important-content",
  );
  const conversionCheck = checks.find(
    (check) => check.id === "conversion-mobile-action-usability",
  );
  const conversion = result.categoryScores.find(
    (category) => category.id === "conversion-ux",
  );

  assert.match(imageCheck?.finding?.title ?? "", /horizontal mobile scrolling/);
  assert.equal(contentCheck?.finding?.severity, "high");
  assert.ok((conversion?.score ?? 100) <= 79);
  assert.equal(widthCheck?.overallScoreCap, 69);
  assert.equal(contentCheck?.overallScoreCap, 69);
  assert.equal(conversionCheck?.overallScoreCap, 69);
  assert.equal(widthCheck?.penaltyGroup, conversionCheck?.penaltyGroup);
  assert.equal(result.overallScore, 66);
});

test("severe measured performance and form barriers declare independent material constraints", () => {
  const degradedPageSpeed: PageSpeedData = {
    ...pageSpeed,
    performanceScore: 30,
  };
  const { checks } = buildAuditChecks(
    makeCrawl(
      makePage({
        formControlCount: 4,
        unlabeledFormControlCount: 4,
      }),
    ),
    degradedPageSpeed,
    makeRenderedMobile(),
  );
  const performanceCheck = checks.find(
    (check) => check.id === "performance-pagespeed",
  );
  const formCheck = checks.find(
    (check) => check.id === "accessibility-form-labels",
  );

  assert.equal(performanceCheck?.overallScoreCap, 93);
  assert.equal(formCheck?.overallScoreCap, 93);
  assert.notEqual(performanceCheck?.penaltyGroup, formCheck?.penaltyGroup);
});

test("confirmed mobile and form failures cannot be hidden by otherwise strong categories", () => {
  const page = makePage({
    formControlCount: 4,
    unlabeledFormControlCount: 4,
  });
  const { checks, notices } = buildAuditChecks(
    makeCrawl(page),
    { available: false, reason: "provider_error" },
    makeRenderedMobile({
      documentWidth: 700,
      horizontalOverflowPixels: 310,
      horizontalScrollPixels: 310,
      wideElementCount: 2,
      fixedWidthElementCount: 1,
      overflowingImageCount: 2,
      clippedImportantElementCount: 2,
      clippedNavigation: true,
      offscreenPrimaryActionCount: 1,
    }),
  );
  const result = buildAuditResult({
    id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2",
    auditedUrl: "https://example.com/",
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks,
    notices,
  });
  const performance = result.categoryScores.find(
    (category) => category.id === "performance",
  );

  assert.equal(performance?.score, null);
  assert.ok(result.evidenceCoverage < 100);
  assert.ok(result.overallScore >= 50 && result.overallScore <= 66);
  assert.ok(result.overallScore < 90);
});

test("harmless tiny overflow stays within the rendered tolerance", () => {
  const { checks } = buildResultWithRenderedMobile(
    makeRenderedMobile({
      documentWidth: 396,
      horizontalOverflowPixels: 6,
      horizontalScrollPixels: 6,
    }),
  );
  const widthCheck = checks.find(
    (check) => check.id === "mobile-rendered-width",
  );

  assert.equal(widthCheck?.status, "passed");
});

test("clipped decoration and carousel geometry stay informational without horizontal scrolling", () => {
  const { checks, result } = buildResultWithRenderedMobile(
    makeRenderedMobile({
      documentWidth: 680,
      horizontalOverflowPixels: 290,
      horizontalScrollPixels: 0,
      potentialOverflowElementCount: 5,
      intentionallyClippedImageCount: 3,
      potentiallyClippedImportantElementCount: 1,
    }),
  );
  const widthCheck = checks.find(
    (check) => check.id === "mobile-rendered-width",
  );
  const imageCheck = checks.find(
    (check) => check.id === "mobile-rendered-images",
  );
  const mobile = result.categoryScores.find(
    (category) => category.id === "mobile-experience",
  );

  assert.equal(widthCheck?.status, "opportunity");
  assert.equal(widthCheck?.finding?.impact, "informational");
  assert.equal(imageCheck?.status, "passed");
  assert.ok((mobile?.score ?? 0) >= 95);
});

test("a skipped heading level is informational while a missing primary heading remains meaningful", () => {
  const skipped = buildAuditChecks(
    makeCrawl(
      makePage({
        headings: [
          { level: 1, text: "Primary" },
          { level: 3, text: "Supporting" },
        ],
      }),
    ),
    pageSpeed,
    makeRenderedMobile(),
  ).checks;
  const missing = buildAuditChecks(
    makeCrawl(makePage({ h1s: [], headings: [] })),
    pageSpeed,
    makeRenderedMobile(),
  ).checks;

  assert.equal(
    skipped.find((check) => check.id === "seo-heading-order")?.finding?.impact,
    "informational",
  );
  assert.equal(
    missing.find((check) => check.id === "seo-h1")?.finding?.severity,
    "high",
  );
});

test("large HTML uses a progressive low-impact curve instead of a cliff", () => {
  const justOver = buildAuditChecks(
    makeCrawl(makePage({ htmlBytes: 501 * 1024 })),
    pageSpeed,
    makeRenderedMobile(),
  ).checks.find((check) => check.id === "technical-html-size");
  const complex = buildAuditChecks(
    makeCrawl(makePage({ htmlBytes: 974 * 1024 })),
    pageSpeed,
    makeRenderedMobile(),
  ).checks.find((check) => check.id === "technical-html-size");

  assert.equal(justOver?.score, 99);
  assert.equal(complex?.score, 97);
  assert.equal(complex?.finding?.impact, "informational");
});

test("missing image attributes with reserved CSS space remain informational", () => {
  const { checks, result } = buildResultWithRenderedMobile(
    makeRenderedMobile({
      missingDimensionImageCount: 1,
      unreservedImageCount: 0,
    }),
  );
  const page = makePage({ imageCount: 1, missingDimensionImageCount: 1 });
  const stableChecks = buildAuditChecks(
    makeCrawl(page),
    pageSpeed,
    makeRenderedMobile({
      missingDimensionImageCount: 1,
      unreservedImageCount: 0,
    }),
  ).checks;
  const dimensionCheck = stableChecks.find(
    (check) => check.id === "technical-image-dimensions",
  );

  assert.ok(checks.length > 0 && result.overallScore > 0);
  assert.equal(dimensionCheck?.finding?.impact, "informational");
  assert.equal(dimensionCheck?.score, 100);
});

test("rendered-check unavailability reduces evidence without scoring failure", () => {
  const audit = buildResultWithRenderedMobile({
    available: false,
    reason: "render_error",
  });
  const renderedChecks = audit.checks.filter((check) =>
    check.id.startsWith("mobile-rendered-"),
  );
  const mobile = audit.result.categoryScores.find(
    (category) => category.id === "mobile-experience",
  );

  assert.ok(renderedChecks.every((check) => check.status === "unavailable"));
  assert.equal(mobile?.evidenceLevel, "partial");
  assert.ok(audit.result.notices.some((notice) => notice.includes("Rendered mobile")));
  assert.ok(audit.result.notices.length <= 8);
});

test("rendered mobile scoring remains deterministic", () => {
  const rendered = makeRenderedMobile({
    documentWidth: 700,
    horizontalOverflowPixels: 310,
    horizontalScrollPixels: 310,
    wideElementCount: 1,
  });

  assert.deepEqual(
    buildResultWithRenderedMobile(rendered),
    buildResultWithRenderedMobile(rendered),
  );
});

const scoreFixture = (html: string, rendered: RenderedMobileData, provider: PageSpeedData = pageSpeed) => {
  const page = parsePageSnapshot({ url: "https://example.com/", statusCode: 200, html });
  const { checks, notices } = buildAuditChecks(makeCrawl(page), provider, rendered);
  const result = buildAuditResult({
    id: "a6799d85-eab3-4fa7-aefd-131b0d9b2cb2",
    auditedUrl: page.url,
    createdAt: "2026-08-12T12:00:00.000Z",
    completedAt: "2026-08-12T12:00:10.000Z",
    checks, notices,
  });
  return { checks, result };
};

const withFidelity = (rendered: RenderedMobileData, level: "moderate" | "low"): RenderedMobileData => {
  assert.ok(rendered.available);
  const metrics = sanitizeRenderedHtml(dynamicRestrictedHtml, "https://example.com/").metrics;
  metrics.stylesheets = { requested: 8, fulfilled: level === "low" ? 0 : 7, blocked: level === "low" ? 8 : 1, failed: 0 };
  // Isolate small CSS loss from substantial removed JavaScript in moderate fixtures.
  if (level === "moderate") {
    metrics.sourceStructurallyComplete = true;
    metrics.executableScriptsRemoved = 0;
  }
  return { ...rendered, renderFidelity: assessRenderFidelity(metrics) };
};

test("giant low-fidelity overflow reduces coverage without the confirmed catastrophic caps", () => {
  const geometry = makeRenderedMobile({ documentWidth: 2400, horizontalOverflowPixels: 2010, horizontalScrollPixels: 2060, wideElementCount: 78 });
  const unavailableProvider: PageSpeedData = { available: false, reason: "provider_error" };
  const before = scoreFixture(dynamicRestrictedHtml, geometry, unavailableProvider);
  const after = scoreFixture(dynamicRestrictedHtml, withFidelity(geometry, "low"), unavailableProvider);
  const width = (value: typeof after) => value.checks.find((check) => check.id === "mobile-rendered-width")!;
  assert.equal(width(before).finding?.impact, "confirmed");
  assert.equal(width(before).finding?.severity, "critical");
  assert.equal(width(before).categoryScoreCap, 49);
  assert.equal(before.result.overallScore, 66);
  assert.equal(width(after).status, "unavailable");
  assert.equal(width(after).score, null);
  assert.equal(width(after).finding?.impact, "informational");
  assert.match(width(after).finding!.explanation, /restricted mobile render.*enough fidelity/);
  assert.match(width(after).finding!.observedValue!, /2400px.*2060px.*78 rendered wide/);
  assert.equal(width(after).categoryScoreCap, undefined);
  assert.equal(width(after).overallScoreCap, undefined);
  assert.ok(after.result.overallScore > before.result.overallScore);
  assert.ok(after.result.evidenceCoverage < before.result.evidenceCoverage);
  assert.equal(after.result.categoryScores.find((category) => category.id === "mobile-experience")?.score, 100);
  assert.equal(after.result.notices.filter((notice) => notice.includes("secure rendering limits")).length, 1);
  assert.ok(!before.result.notices.some((notice) => notice.includes("secure rendering limits")));
  console.info("Synthetic dynamic fixture (trusted geometry -> assessed fidelity)", {
    beforeOverall: before.result.overallScore, afterOverall: after.result.overallScore,
    beforeCoverage: before.result.evidenceCoverage, afterCoverage: after.result.evidenceCoverage,
  });
});

test("all rendered defect families lose hard caps and confirmed impact at reduced fidelity", () => {
  const geometry = makeRenderedMobile({
    documentWidth: 2400, horizontalOverflowPixels: 2010, horizontalScrollPixels: 2010,
    fixedWidthElementCount: 3, wideElementCount: 78, clippedNavigation: true,
    clippedImportantElementCount: 3, offscreenPrimaryActionCount: 1,
    overflowingImageCount: 4, seriousPrimaryActionCount: 1,
    seriousTapTargetCount: 4, tinyTextCount: 20, unreservedImageCount: 1,
  });
  for (const level of ["moderate", "low"] as const) {
    const { checks } = buildAuditChecks(makeCrawl(makePage({ missingDimensionImageCount: 1 })), pageSpeed, withFidelity(geometry, level));
    const affected = checks.filter((check) => check.id.startsWith("mobile-rendered-") ||
      ["conversion-mobile-action-usability", "technical-image-dimensions"].includes(check.id));
    assert.equal(affected.length, 7);
    for (const check of affected) {
      assert.equal(check.categoryScoreCap, undefined, check.id);
      assert.equal(check.overallScoreCap, undefined, check.id);
      assert.notEqual(check.finding?.impact, "confirmed", check.id);
      assert.ok(check.evidenceConfidence! <= 0.7, check.id);
      if (level === "low") {
        if (check.id === "technical-image-dimensions") {
          assert.equal(check.status, "opportunity");
          assert.equal(check.finding?.impact, "informational");
          assert.equal(check.score, 99);
        } else {
          assert.equal(check.status, "unavailable", check.id);
          assert.equal(check.score, null, check.id);
        }
      }
    }
  }
});

test("low-fidelity healthy geometry cannot fabricate passes; moderate geometry remains partial", () => {
  for (const level of ["moderate", "low"] as const) {
    const { checks, result } = scoreFixture(strongFoundationsHtml, withFidelity(makeRenderedMobile(), level));
    for (const check of checks.filter((check) => check.id.startsWith("mobile-rendered-") || check.id === "conversion-mobile-action-usability")) {
      assert.equal(check.status, level === "low" ? "unavailable" : "passed");
      assert.equal(check.evidenceConfidence, level === "low" ? 0 : 0.7);
    }
    assert.equal(result.categoryScores.find((category) => category.id === "mobile-experience")?.evidenceLevel, "partial");
  }
});

test("low fidelity preserves missing source image dimensions independently of unreliable reservation measurements", () => {
  const page = makePage({ imageCount: 2, missingDimensionImageCount: 1 });
  for (const unreservedImageCount of [0, 1, 2]) {
    const rendered = withFidelity(makeRenderedMobile({ unreservedImageCount }), "low");
    const { checks } = buildAuditChecks(makeCrawl(page), pageSpeed, rendered);
    const dimensions = checks.find((check) => check.id === "technical-image-dimensions")!;
    assert.equal(dimensions.status, "opportunity");
    assert.equal(dimensions.score, 99);
    assert.equal(dimensions.evidenceConfidence, 0.65);
    assert.equal(dimensions.finding?.impact, "informational");
    assert.match(dimensions.finding!.title, /omit intrinsic width and height/);
    assert.match(dimensions.finding!.explanation, /1 of 2 images omit/);
    assert.match(dimensions.finding!.explanation, /reservation could not be verified because render fidelity was low/);
    assert.doesNotMatch(dimensions.finding!.explanation, /visible images also lacked/);
    assert.equal(dimensions.categoryScoreCap, undefined);
    assert.equal(dimensions.overallScoreCap, undefined);
  }
  const { checks } = buildAuditChecks(makeCrawl(page), pageSpeed, makeRenderedMobile({ unreservedImageCount: 1 }));
  const corroborated = checks.find((check) => check.id === "technical-image-dimensions")!;
  assert.equal(corroborated.finding?.impact, "likely");
  assert.ok(corroborated.score! < 99);
  assert.match(corroborated.finding!.explanation, /1 visible images also lacked/);
});

test("an ordinary embedded document does not strip unrelated confirmed mobile overflow caps", () => {
  const geometry = makeRenderedMobile({ documentWidth: 2400, horizontalScrollPixels: 2010 });
  assert.ok(geometry.available);
  const { checks } = buildAuditChecks(makeCrawl(), pageSpeed, {
    ...geometry,
    renderFidelity: assessRenderFidelity({ ...createRenderFidelityMetrics(), embeddedDocumentsRemoved: 1 }),
  });
  const width = checks.find((check) => check.id === "mobile-rendered-width")!;
  assert.equal(width.finding?.impact, "confirmed");
  assert.equal(width.finding?.severity, "critical");
  assert.equal(width.categoryScoreCap, 49);
  assert.equal(width.overallScoreCap, 69);
});

test("substantial removed JavaScript in complete SSR lowers rendered evidence confidence", () => {
  const geometry = makeRenderedMobile({ documentWidth: 2400, horizontalScrollPixels: 2010 });
  assert.ok(geometry.available);
  const { checks, notices } = buildAuditChecks(makeCrawl(), pageSpeed, {
    ...geometry,
    renderFidelity: assessRenderFidelity({ ...createRenderFidelityMetrics(),
      sourceStructurallyComplete: true, executableScriptsRemoved: 8 }),
  });
  const width = checks.find((check) => check.id === "mobile-rendered-width")!;
  assert.equal(width.finding?.impact, "likely");
  assert.equal(width.evidenceConfidence, 0.7);
  assert.equal(width.categoryScoreCap, undefined);
  assert.equal(width.overallScoreCap, undefined);
  assert.equal(notices.filter((notice) => notice.includes("secure rendering limits")).length, 1);
});

test("independent width and tap failures strengthen only matching low-fidelity claims", () => {
  const rendered = withFidelity(makeRenderedMobile({ documentWidth: 2400,
    horizontalScrollPixels: 2010, horizontalOverflowPixels: 2010,
    seriousTapTargetCount: 4, offscreenPrimaryActionCount: 1 }), "low");
  const { checks } = buildAuditChecks(makeCrawl(), {
    ...pageSpeed, audits: { ...pageSpeed.audits, contentWidth: 0, tapTargets: 0 },
  }, rendered);
  for (const id of ["mobile-rendered-width", "mobile-rendered-controls"]) {
    const check = checks.find((check) => check.id === id)!;
    assert.equal(check.status, "failed");
    assert.equal(check.finding?.impact, "likely");
    assert.equal(check.evidenceConfidence, 0.5);
    assert.match(check.finding!.explanation, /independent PageSpeed.*does not verify its rendered magnitude/);
    assert.equal(check.overallScoreCap, undefined);
    assert.equal(check.categoryScoreCap, undefined);
  }
  assert.equal(checks.find((check) => check.id === "conversion-mobile-action-usability")?.status, "unavailable");
  assert.ok(checks.find((check) => check.id === "mobile-content-width")?.overallScoreCap);
});

test("healthy PageSpeed width cannot corroborate giant low-fidelity overflow", () => {
  const { checks } = scoreFixture(strongFoundationsHtml, withFidelity(makeRenderedMobile({ documentWidth: 2400, horizontalScrollPixels: 2010 }), "low"));
  assert.equal(checks.find((check) => check.id === "mobile-content-width")?.status, "passed");
  assert.equal(checks.find((check) => check.id === "mobile-rendered-width")?.status, "unavailable");
});

test("missing source viewport remains material and corroborates low-fidelity desktop width without PageSpeed", () => {
  const { checks } = scoreFixture(strongFoundationsHtml.replace(/<meta name="viewport"[^>]+>/, ""),
    withFidelity(makeRenderedMobile({ documentWidth: 2400, horizontalScrollPixels: 2010 }), "low"),
    { available: false, reason: "provider_error" });
  const width = checks.find((check) => check.id === "mobile-rendered-width")!;
  assert.equal(width.finding?.impact, "likely");
  assert.match(width.finding!.explanation, /Source HTML also lacks/);
  assert.equal(width.overallScoreCap, undefined);
  assert.ok(checks.find((check) => check.id === "mobile-viewport")?.overallScoreCap);
});

test("a modern site with strong measured foundations can still score 90+", () => {
  const { result } = scoreFixture(strongFoundationsHtml, makeRenderedMobile());
  assert.ok(result.overallScore >= 90);
  assert.ok(result.categoryScores.every((category) => (category.score ?? 0) >= 90));
});

test("Big Ugly style HTML cannot hide absent customer routes and mobile failures behind speed", () => {
  const { checks, result } = scoreFixture(bigUglyFoundationsHtml, makeRenderedMobile({
    documentWidth: 1000, horizontalOverflowPixels: 610, horizontalScrollPixels: 610,
    wideElementCount: 2, fixedWidthElementCount: 1,
    primaryActionCount: 0, tinyTextCount: 18, textSampleCount: 20,
  }), { ...pageSpeed, performanceScore: 100, accessibilityScore: 60,
    audits: { ...pageSpeed.audits, colorContrast: 0 } });
  const category = (id: string) => result.categoryScores.find((entry) => entry.id === id)!.score!;
  assert.equal(category("performance"), 100);
  assert.ok(category("mobile-experience") < 50);
  assert.ok(category("conversion-ux") <= 59);
  assert.ok(category("accessibility") < 80);
  assert.ok(result.overallScore <= 66);
  assert.equal(result.methodologyVersion, CURRENT_AUDIT_METHODOLOGY_VERSION);
  const pathChecks = checks.filter((entry) => entry.id.startsWith("conversion-") && entry.id.endsWith("-path"));
  assert.equal(new Set(pathChecks.map((entry) => entry.penaltyGroup)).size, 1);
  assert.equal(pathChecks.find((entry) => entry.id === "conversion-customer-path")?.finding?.severity, "high");
});

test("one source action without contact or rendered evidence does not earn a nineties conversion score", () => {
  const { result } = scoreFixture('<html><body><a href="/shop">Shop now</a></body></html>',
    { available: false, reason: "render_error" });
  const conversion = result.categoryScores.find((entry) => entry.id === "conversion-ux")!;
  assert.ok(conversion.score! < 90);
  assert.equal(conversion.evidenceLevel, "partial");
});

test("a source action absent from the render cannot pass mobile action usability", () => {
  const { checks } = scoreFixture(strongFoundationsHtml, makeRenderedMobile({ primaryActionCount: 0 }));
  assert.equal(checks.find((entry) => entry.id === "conversion-mobile-action-usability")?.status, "unavailable");
});

test("forms are optional, while unlabeled forms and tiny customer actions affect foundations", () => {
  const healthy = scoreFixture('<html><body><a href="/book">Book now</a><a href="tel:+15555550100">Call us</a></body></html>', makeRenderedMobile());
  assert.equal(healthy.result.categoryScores.find((entry) => entry.id === "conversion-ux")?.score, 100);
  const tiny = scoreFixture(strongFoundationsHtml, makeRenderedMobile({ seriousPrimaryActionCount: 1, seriousTapTargetCount: 1 }));
  assert.ok(tiny.result.categoryScores.find((entry) => entry.id === "conversion-ux")!.score! <= 69);
  const unlabeled = scoreFixture(strongFoundationsHtml.replaceAll(/<label[^>]*>.*?<\/label>/g, ""), makeRenderedMobile());
  assert.ok(unlabeled.result.categoryScores.find((entry) => entry.id === "conversion-ux")!.score! <= 69);
  const forms = unlabeled.checks.filter((entry) => entry.id.endsWith("form-labels"));
  assert.equal(new Set(forms.map((entry) => entry.penaltyGroup)).size, 1);
});

test("missing viewport is material even when rendering is unavailable", () => {
  const { checks, result } = scoreFixture(strongFoundationsHtml.replace(/<meta name="viewport"[^>]+>/, ""),
    { available: false, reason: "render_error" });
  assert.ok(result.categoryScores.find((entry) => entry.id === "mobile-experience")!.score! <= 59);
  assert.ok(result.overallScore <= 69);
  assert.ok(checks.find((entry) => entry.id === "mobile-viewport")?.overallScoreCap);
});

test("clipped navigation alone and serious control failures remain material without overflow", () => {
  for (const metrics of [
    { clippedNavigation: true },
    { seriousTapTargetCount: 3, interactiveControlCount: 4 },
    { tinyTextCount: 15, textSampleCount: 20 },
  ]) {
    const { result } = buildResultWithRenderedMobile(makeRenderedMobile(metrics));
    assert.ok(result.overallScore < 80);
  }
});

test("a minor isolated overflow warning does not crater otherwise strong foundations", () => {
  const { result } = buildResultWithRenderedMobile(makeRenderedMobile({ horizontalScrollPixels: 12, horizontalOverflowPixels: 12 }));
  assert.ok(result.overallScore >= 90);
});

test("overflow, clipped content and offscreen CTA retain one overall mobile root", () => {
  const overflow = { documentWidth: 1000, horizontalOverflowPixels: 610, horizontalScrollPixels: 610, wideElementCount: 1 };
  const single = buildResultWithRenderedMobile(makeRenderedMobile(overflow));
  const correlated = buildResultWithRenderedMobile(makeRenderedMobile({
    ...overflow, clippedImportantElementCount: 2, clippedNavigation: true,
    offscreenPrimaryActionCount: 1, overflowingImageCount: 1,
  }));
  assert.equal(single.result.overallScore, correlated.result.overallScore);
  assert.equal(single.result.categoryScores.find((entry) => entry.id === "mobile-experience")?.score,
    correlated.result.categoryScores.find((entry) => entry.id === "mobile-experience")?.score);
});

test("unverified JS customer controls reduce evidence without passing or failing customer paths", () => {
  for (const html of ['<button>Book now</button>', '<form><input type="email" aria-label="Email"><button>Continue</button></form>']) {
    const { checks, result } = scoreFixture(html, { available: false, reason: "render_error" });
    for (const id of ["conversion-action-path", "conversion-contact-path"]) {
      const check = checks.find((entry) => entry.id === id)!;
      assert.equal(check.status, "unavailable");
      assert.equal(check.score, null);
      assert.equal(check.finding, undefined);
      assert.equal(check.overallScoreCap, undefined);
    }
    assert.ok(!checks.some((entry) => entry.id === "conversion-customer-path"));
    const conversion = result.categoryScores.find((entry) => entry.id === "conversion-ux")!;
    assert.ok(conversion.evidenceCoverage < 100);
    assert.notEqual(conversion.evidenceLevel, "full");
    assert.ok(result.notices.some((notice) => notice.includes("could not be verified")));
  }
});

test("a JS-heavy otherwise strong page is not capped as broken solely by uncertain behavior", () => {
  const html = strongFoundationsHtml.replace(/<a[\s\S]*<\/form>/, '<button>Book now</button>');
  const { result, checks } = scoreFixture(html, makeRenderedMobile());
  assert.ok(result.overallScore >= 90);
  assert.ok(result.evidenceCoverage < 100);
  assert.equal(checks.find((entry) => entry.id === "conversion-action-path")?.status, "unavailable");
  assert.ok(!checks.some((entry) => entry.id === "conversion-customer-path"));
});
