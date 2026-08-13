import assert from "node:assert/strict";
import test from "node:test";
import { buildAuditChecks } from "../../lib/website-audit/checks";
import type { CrawlAuditData } from "../../lib/website-audit/crawl-types";
import type { PageSnapshot } from "../../lib/website-audit/page-analysis";

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
