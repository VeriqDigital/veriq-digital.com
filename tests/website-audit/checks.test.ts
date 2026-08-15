import assert from "node:assert/strict";
import test from "node:test";
import { buildAuditChecks } from "../../lib/website-audit/checks";
import type { CrawlAuditData } from "../../lib/website-audit/crawl-types";
import type {
  PageSpeedData,
  RenderedMobileData,
  RenderedMobileMetrics,
} from "../../lib/website-audit/model";
import type { PageSnapshot } from "../../lib/website-audit/page-analysis";
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
  formControlCount: 2,
  unlabeledFormControlCount: 0,
  contactLinkCount: 1,
  actionLinkCount: 1,
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

  assert.equal(byId.get("conversion-action-path")?.status, "opportunity");
  assert.equal(byId.get("conversion-contact-path")?.status, "opportunity");
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
      overflowingImageCount: 2,
      clippedImportantElementCount: 2,
      clippedNavigation: true,
      offscreenPrimaryActionCount: 1,
    }),
  );
  const imageCheck = checks.find(
    (check) => check.id === "mobile-rendered-images",
  );
  const contentCheck = checks.find(
    (check) => check.id === "mobile-rendered-important-content",
  );
  const conversion = result.categoryScores.find(
    (category) => category.id === "conversion-ux",
  );

  assert.match(imageCheck?.finding?.title ?? "", /horizontal mobile scrolling/);
  assert.equal(contentCheck?.finding?.severity, "high");
  assert.ok((conversion?.score ?? 100) <= 79);
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
