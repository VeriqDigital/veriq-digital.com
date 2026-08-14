import { getAuditCategory } from "./categories";
import type { CrawlAuditData, ResourceDiscoveryStatus } from "./crawl-types";
import type {
  AuditCheckResult,
  AuditFinding,
  AuditSeverity,
  PageSpeedData,
  PageSpeedMetric,
} from "./model";
import { hasObviousHeadingSkip } from "./page-analysis";

type FindingInput = Omit<AuditFinding, "id" | "category">;

const finding = (
  id: string,
  category: AuditCheckResult["category"],
  input: FindingInput,
): AuditFinding => ({ id, category, ...input });

const check = (
  value: Omit<AuditCheckResult, "finding"> & { finding?: FindingInput },
): AuditCheckResult => ({
  ...value,
  finding: value.finding
    ? finding(value.id, value.category, value.finding)
    : undefined,
});

const unavailableCheck = (
  id: string,
  category: AuditCheckResult["category"],
  weight: number,
): AuditCheckResult => ({
  id,
  category,
  weight,
  status: "unavailable",
  score: null,
});

const metricCheck = ({
  id,
  metric,
  weight,
  good,
  needsImprovement,
  category = "performance",
  title,
  explanation,
  whyItMatters,
  recommendation,
  context,
  higherIsBetter = false,
}: {
  id: string;
  metric?: PageSpeedMetric;
  weight: number;
  good: number;
  needsImprovement: number;
  category?: AuditCheckResult["category"];
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
  context: string;
  higherIsBetter?: boolean;
}): AuditCheckResult => {
  if (!metric) return unavailableCheck(id, category, weight);

  const goodResult = higherIsBetter
    ? metric.numericValue >= good
    : metric.numericValue <= good;
  const needsImprovementResult = higherIsBetter
    ? metric.numericValue >= needsImprovement
    : metric.numericValue <= needsImprovement;

  if (goodResult) {
    return check({ id, category, weight, status: "passed", score: 100 });
  }

  const severity: AuditSeverity = needsImprovementResult ? "medium" : "high";

  return check({
    id,
    category,
    weight,
    status: "failed",
    score: needsImprovementResult ? 60 : 20,
    finding: {
      severity,
      title,
      explanation,
      whyItMatters,
      recommendation,
      supportingMetric: {
        label: context,
        value: metric.displayValue ?? String(metric.numericValue),
        context: "Google PageSpeed Insights mobile lab measurement. Values can vary between runs.",
      },
    },
  });
};

const resourceCheck = ({
  id,
  category,
  weight,
  status,
  title,
  explanation,
  whyItMatters,
  recommendation,
}: {
  id: string;
  category: AuditCheckResult["category"];
  weight: number;
  status: ResourceDiscoveryStatus;
  title: string;
  explanation: string;
  whyItMatters: string;
  recommendation: string;
}): AuditCheckResult => {
  if (status === "unavailable") {
    return unavailableCheck(id, category, weight);
  }

  if (status === "present") {
    return check({ id, category, weight, status: "passed", score: 100 });
  }

  return check({
    id,
    category,
    weight,
    status: "opportunity",
    score: 75,
    finding: {
      severity: "opportunity",
      title,
      explanation,
      whyItMatters,
      recommendation,
    },
  });
};

function buildSeoChecks(
  crawl: CrawlAuditData,
  pageSpeed: PageSpeedData,
): AuditCheckResult[] {
  const page = crawl.primaryPage;
  const titleLength = page.title.length;
  const descriptionLength = page.metaDescription.length;
  const hasNoindex =
    page.robotsDirectives.includes("noindex") ||
    page.robotsDirectives.includes("none");
  const hasNofollow =
    page.robotsDirectives.includes("nofollow") ||
    page.robotsDirectives.includes("none");
  const pageUrl = new URL(page.url);
  const pageOrigin = pageUrl.origin;
  const duplicateTitle =
    page.title.length > 0 &&
    crawl.pages.some(
      (candidate) => candidate.url !== page.url && candidate.title === page.title,
    );
  const duplicateDescription =
    page.metaDescription.length > 0 &&
    crawl.pages.some(
      (candidate) =>
        candidate.url !== page.url &&
        candidate.metaDescription === page.metaDescription,
    );
  const checks: AuditCheckResult[] = [];

  if (!page.title) {
    checks.push(
      check({
        id: "seo-title",
        category: "seo",
        weight: 18,
        status: "failed",
        score: 0,
        finding: {
          severity: "high",
          title: "The audited page does not have a page title",
          explanation: "No usable title element was found in the page HTML.",
          whyItMatters:
            "The title helps search engines understand the page and helps people decide whether a search result is relevant.",
          recommendation:
            "Add a concise title that describes the primary service or purpose of the page and includes the business name where useful.",
        },
      }),
    );
  } else if (titleLength < 15 || titleLength > 70) {
    checks.push(
      check({
        id: "seo-title",
        category: "seo",
        weight: 18,
        status: "opportunity",
        score: 78,
        finding: {
          severity: "opportunity",
          title: "The audited page title may be difficult to use in search results",
          explanation: `The title is ${titleLength} characters long. Extremely short titles can lack context, while long titles may be shortened in search results.`,
          whyItMatters:
            "A clear title gives people and search engines a concise description of the page.",
          recommendation:
            "Review the title for clarity and specificity rather than targeting an exact character count.",
          observedValue: page.title,
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-title", category: "seo", weight: 18, status: "passed", score: 100 }));
  }

  if (!page.metaDescription) {
    checks.push(
      check({
        id: "seo-meta-description",
        category: "seo",
        weight: 12,
        status: "failed",
        score: 35,
        finding: {
          severity: "medium",
          title: "The audited page does not have a meta description",
          explanation: "No non-empty meta description was found in the page HTML.",
          whyItMatters:
            "Search engines may use a meta description as the search-result summary. It does not directly determine rankings, but it can help people understand the page.",
          recommendation:
            "Add an accurate summary of the page and its value to a potential customer.",
        },
      }),
    );
  } else if (descriptionLength < 50 || descriptionLength > 180) {
    checks.push(
      check({
        id: "seo-meta-description",
        category: "seo",
        weight: 12,
        status: "opportunity",
        score: 82,
        finding: {
          severity: "opportunity",
          title: "Your meta description could communicate the page more clearly",
          explanation: `The description is ${descriptionLength} characters long. Search engines may shorten long descriptions or replace descriptions that do not fit a query.`,
          whyItMatters:
            "A useful description can help searchers understand what they will find before clicking.",
          recommendation:
            "Review the description for a clear, accurate summary rather than writing to an exact character target.",
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-meta-description", category: "seo", weight: 12, status: "passed", score: 100 }));
  }

  if (page.h1s.length === 0) {
    checks.push(
      check({
        id: "seo-h1",
        category: "seo",
        weight: 14,
        status: "failed",
        score: 20,
        finding: {
          severity: "high",
          title: "The audited page does not have a primary heading",
          explanation: "No H1 heading was found in the server-returned HTML.",
          whyItMatters:
            "A clear primary heading helps visitors and search engines understand the page's main subject.",
          recommendation:
            "Add one descriptive H1 that communicates the page's primary purpose in plain language.",
        },
      }),
    );
  } else if (page.h1s.length > 1) {
    checks.push(
      check({
        id: "seo-h1",
        category: "seo",
        weight: 14,
        status: "failed",
        score: 65,
        finding: {
          severity: "medium",
          title: "The audited page has multiple primary headings",
          explanation: `${page.h1s.length} H1 headings were found. Multiple H1s can be valid in some document structures, but they can signal an unclear hierarchy on a business page.`,
          whyItMatters:
            "A predictable heading structure makes the page easier to scan and understand.",
          recommendation:
            "Confirm that one heading represents the page's main subject and use lower-level headings for supporting sections.",
          observedValue: `${page.h1s.length} H1 headings`,
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-h1", category: "seo", weight: 14, status: "passed", score: 100 }));
  }

  const headingSkip = hasObviousHeadingSkip(page.headings);
  checks.push(
    headingSkip
      ? check({
          id: "seo-heading-order",
          category: "seo",
          weight: 6,
          status: "failed",
          score: 60,
          finding: {
            severity: "medium",
            title: "The page skips a heading level",
            explanation:
              "At least one heading jumps by more than one level, such as from H2 directly to H4.",
            whyItMatters:
              "A logical heading outline helps people scan the page and helps assistive technology communicate its structure.",
            recommendation:
              "Review the heading outline and use the next appropriate level for nested sections.",
          },
        })
      : check({ id: "seo-heading-order", category: "seo", weight: 6, status: "passed", score: 100 }),
  );

  if (page.canonicalInvalid) {
    checks.push(
      check({
        id: "seo-canonical",
        category: "seo",
        weight: 10,
        status: "failed",
        score: 20,
        finding: {
          severity: "high",
          title: "The canonical URL is invalid",
          explanation: "The page includes a canonical value that could not be resolved as a valid URL.",
          whyItMatters:
            "Search engines use a canonical URL as a strong hint about which version of a page should be indexed.",
          recommendation: "Replace it with the intended absolute public URL for this page.",
        },
      }),
    );
  } else if (!page.canonicalUrl) {
    checks.push(
      check({
        id: "seo-canonical",
        category: "seo",
        weight: 10,
        status: "opportunity",
        score: 78,
        finding: {
          severity: "opportunity",
          title: "The audited page does not declare a canonical URL",
          explanation: "No canonical link was found in the page HTML.",
          whyItMatters:
            "A canonical can clarify the preferred URL when the same content is reachable through multiple addresses.",
          recommendation:
            "Add a self-referencing canonical if the page can appear under multiple URL variations.",
        },
      }),
    );
  } else if (new URL(page.canonicalUrl).origin !== pageOrigin) {
    checks.push(
      check({
        id: "seo-canonical",
        category: "seo",
        weight: 10,
        status: "failed",
        score: 55,
        finding: {
          severity: "medium",
          title: "The canonical points to a different website",
          explanation: "The audited page canonical resolves to another origin.",
          whyItMatters:
            "A cross-domain canonical can tell search engines to prefer a different website's page.",
          recommendation:
            "Confirm this is intentional. Otherwise, point the canonical to the preferred URL on this website.",
          observedValue: page.canonicalUrl,
        },
      }),
    );
  } else if (new URL(page.canonicalUrl).pathname !== pageUrl.pathname) {
    checks.push(
      check({
        id: "seo-canonical",
        category: "seo",
        weight: 10,
        status: "opportunity",
        score: 72,
        finding: {
          severity: "opportunity",
          title: "The canonical points to a different page",
          explanation:
            "The canonical URL uses a different path from the audited page.",
          whyItMatters:
            "A canonical is a strong hint that another URL should be treated as the preferred version of this content.",
          recommendation:
            "Confirm this is intentional. Otherwise, point the canonical to the preferred version of the audited page.",
          observedValue: page.canonicalUrl,
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-canonical", category: "seo", weight: 10, status: "passed", score: 100 }));
  }

  if (hasNoindex) {
    checks.push(
      check({
        id: "seo-indexing-directives",
        category: "seo",
        weight: 18,
        status: "failed",
        score: 0,
        finding: {
          severity: "critical",
          title: "The page tells search engines not to index it",
          explanation: "A noindex directive was found in the page-level robots metadata.",
          whyItMatters:
            "A page excluded from the index cannot appear as a normal result in Google Search.",
          recommendation:
            "Confirm whether noindex is intentional. If it is not, remove the directive and request indexing after publishing the correction.",
          observedValue: page.robotsDirectives.join(", "),
          recommendedValue: "index, follow",
        },
      }),
    );
  } else if (hasNofollow) {
    checks.push(
      check({
        id: "seo-indexing-directives",
        category: "seo",
        weight: 18,
        status: "failed",
        score: 60,
        finding: {
          severity: "medium",
          title: "The page tells search engines not to follow its links",
          explanation: "A nofollow directive was found in the page-level robots metadata.",
          whyItMatters:
            "This can limit how search engines discover and interpret linked pages from this page.",
          recommendation: "Remove the directive if restricting link discovery is not intentional.",
          observedValue: page.robotsDirectives.join(", "),
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-indexing-directives", category: "seo", weight: 18, status: "passed", score: 100 }));
  }

  if (crawl.robots.status === "unavailable") {
    checks.push(unavailableCheck("seo-robots-access", "seo", 12));
  } else if (crawl.robots.blocksPrimaryPage) {
    checks.push(
      check({
        id: "seo-robots-access",
        category: "seo",
        weight: 12,
        status: "failed",
        score: 0,
        finding: {
          severity: "high",
          title: "Robots.txt blocks crawling of the audited page",
          explanation:
            "The applicable robots.txt rules disallow this page for the audit crawler.",
          whyItMatters:
            "A disallow rule can prevent compliant search crawlers from retrieving the page, although a blocked URL can sometimes still appear without a useful snippet.",
          recommendation:
            "Confirm the rule is intentional. If search crawlers should access this page, narrow or remove the applicable disallow rule.",
        },
      }),
    );
  } else {
    checks.push(
      check({
        id: "seo-robots-access",
        category: "seo",
        weight: 12,
        status: "passed",
        score: 100,
      }),
    );
  }

  checks.push(
    resourceCheck({
      id: "seo-sitemap",
      category: "seo",
      weight: 7,
      status: crawl.sitemapStatus,
      title: "No XML sitemap was discovered",
      explanation:
        "The audit did not find a usable sitemap at the standard location or in robots.txt.",
      whyItMatters:
        "A sitemap can help search engines discover important URLs, especially on newer or larger sites.",
      recommendation:
        "Publish a current XML sitemap and reference it from robots.txt or Search Console.",
    }),
  );

  if (crawl.pages.length <= 1) {
    checks.push(unavailableCheck("seo-duplicate-metadata", "seo", 5));
  } else if (duplicateTitle || duplicateDescription) {
    checks.push(
      check({
        id: "seo-duplicate-metadata",
        category: "seo",
        weight: 5,
        status: "failed",
        score: 55,
        finding: {
          severity: "medium",
          title: "Sampled pages reuse the same search metadata",
          explanation:
            "At least two of the small sample of crawled pages share the same title or meta description.",
          whyItMatters:
            "Distinct metadata helps visitors and search engines distinguish pages with different purposes.",
          recommendation:
            "Give important pages titles and descriptions that accurately reflect their individual content.",
        },
      }),
    );
  } else {
    checks.push(check({ id: "seo-duplicate-metadata", category: "seo", weight: 5, status: "passed", score: 100 }));
  }

  checks.push(
    page.structuredDataCount > 0
      ? check({ id: "seo-structured-data", category: "seo", weight: 2, status: "passed", score: 100 })
      : check({
          id: "seo-structured-data",
          category: "seo",
          weight: 2,
          status: "opportunity",
          score: 96,
          finding: {
            severity: "opportunity",
            title: "No JSON-LD structured data was detected",
            explanation:
              "The audited page does not include JSON-LD markup that this automated check could identify.",
            whyItMatters:
              "Structured data is not required for every page, but valid markup can help search engines understand eligible business or content details.",
            recommendation:
              "Add only schema types that accurately represent visible page content and validate the markup before publishing.",
          },
        }),
  );

  checks.push(
    pageSpeed.available && pageSpeed.seoScore !== null
      ? check({
          id: "seo-pagespeed",
          category: "seo",
          weight: 8,
          status: pageSpeed.seoScore >= 90 ? "passed" : "failed",
          score: pageSpeed.seoScore,
          finding:
            pageSpeed.seoScore >= 90
              ? undefined
              : {
                  severity: pageSpeed.seoScore < 70 ? "high" : "medium",
                  title: "Google's automated SEO checks found issues",
                  explanation: `The mobile Lighthouse SEO category scored ${pageSpeed.seoScore} out of 100.`,
                  whyItMatters:
                    "Lighthouse checks a focused set of technical search fundamentals, not rankings or overall content quality.",
                  recommendation:
                    "Review the direct findings in this report first, then inspect the Lighthouse SEO diagnostics for any remaining failed audits.",
                  supportingMetric: {
                    label: "Lighthouse SEO score",
                    value: `${pageSpeed.seoScore}/100`,
                    context: "Google PageSpeed Insights mobile lab audit.",
                  },
                },
        })
      : unavailableCheck("seo-pagespeed", "seo", 8),
  );

  return checks;
}

function buildPerformanceChecks(pageSpeed: PageSpeedData): AuditCheckResult[] {
  if (!pageSpeed.available) {
    return [unavailableCheck("performance-pagespeed", "performance", 100)];
  }

  return [
    check({
      id: "performance-pagespeed",
      category: "performance",
      weight: 40,
      status: pageSpeed.performanceScore >= 75 ? "passed" : "failed",
      score: pageSpeed.performanceScore,
      finding:
        pageSpeed.performanceScore >= 75
          ? undefined
          : {
              severity: pageSpeed.performanceScore < 50 ? "high" : "medium",
              title: "Mobile page performance needs attention",
              explanation: `Google's mobile Lighthouse performance score was ${pageSpeed.performanceScore} out of 100.`,
              whyItMatters:
                "Slow or unresponsive pages create friction before a visitor can understand the offer or take action.",
              recommendation:
                "Start with the largest measured loading or responsiveness issue below and retest after each focused change.",
              supportingMetric: {
                label: "Lighthouse performance score",
                value: `${pageSpeed.performanceScore}/100`,
                context: "Lab measurements can vary between runs.",
              },
            },
    }),
    metricCheck({
      id: "performance-lcp",
      metric: pageSpeed.metrics.lcp,
      weight: 20,
      good: 2500,
      needsImprovement: 4000,
      title: "Your main content loads slowly on mobile",
      explanation:
        "The largest visible content took longer than the recommended range to appear in the mobile lab test.",
      whyItMatters:
        "Visitors may leave before they can understand the page when its main content is slow to appear.",
      recommendation:
        "Optimize the largest above-the-fold image or content block, reduce blocking resources, and retest the page.",
      context: "Largest Contentful Paint",
    }),
    metricCheck({
      id: "performance-cls",
      metric: pageSpeed.metrics.cls,
      weight: 15,
      good: 0.1,
      needsImprovement: 0.25,
      title: "Page content shifts while loading",
      explanation:
        "The mobile lab test measured more unexpected layout movement than the recommended range.",
      whyItMatters:
        "Moving text and controls can cause reading disruption and accidental clicks.",
      recommendation:
        "Reserve space for images, embeds, banners, and late-loading content so the layout remains stable.",
      context: "Cumulative Layout Shift",
    }),
    metricCheck({
      id: "performance-tbt",
      metric: pageSpeed.metrics.tbt,
      weight: 15,
      good: 200,
      needsImprovement: 600,
      title: "The page stays busy before it can respond",
      explanation:
        "The mobile lab test found a meaningful amount of main-thread blocking during page load.",
      whyItMatters:
        "A busy main thread can delay taps, typing, navigation, and other interactions.",
      recommendation:
        "Reduce or defer nonessential JavaScript, split long tasks, and remove scripts the page does not need.",
      context: "Total Blocking Time",
    }),
    metricCheck({
      id: "performance-fcp",
      metric: pageSpeed.metrics.fcp,
      weight: 10,
      good: 1800,
      needsImprovement: 3000,
      title: "Visitors wait too long for the first visible content",
      explanation:
        "The mobile lab test took longer than the recommended range to display the first text or image.",
      whyItMatters:
        "Early visual feedback reassures visitors that the page is loading and usable.",
      recommendation:
        "Reduce render-blocking styles and scripts, improve server response time, and prioritize above-the-fold content.",
      context: "First Contentful Paint",
    }),
  ];
}

function buildMobileChecks(
  crawl: CrawlAuditData,
  pageSpeed: PageSpeedData,
): AuditCheckResult[] {
  const page = crawl.primaryPage;
  const responsiveRatio =
    page.imageCount === 0 ? 1 : page.responsiveImageCount / page.imageCount;
  const checks: AuditCheckResult[] = [
    page.hasViewport
      ? check({ id: "mobile-viewport", category: "mobile-experience", weight: 35, status: "passed", score: 100 })
      : check({
          id: "mobile-viewport",
          category: "mobile-experience",
          weight: 35,
          status: "failed",
          score: 15,
          finding: {
            severity: "high",
            title: "The page is missing mobile viewport settings",
            explanation: "No usable viewport meta tag was found in the page HTML.",
            whyItMatters:
              "Without viewport settings, mobile browsers may render the page as a scaled-down desktop layout.",
            recommendation:
              "Add a viewport meta tag that uses the device width and an initial scale of 1.",
          },
        }),
    responsiveRatio >= 0.5
      ? check({ id: "mobile-responsive-images", category: "mobile-experience", weight: 10, status: "passed", score: 100 })
      : check({
          id: "mobile-responsive-images",
          category: "mobile-experience",
          weight: 10,
          status: "opportunity",
          score: 75,
          finding: {
            severity: "opportunity",
            title: "Most images do not advertise responsive alternatives",
            explanation: `${page.responsiveImageCount} of ${page.imageCount} images use srcset or picture markup. CSS sizing may still be responsive, but the browser has fewer source-size choices.`,
            whyItMatters:
              "Responsive image sources can reduce unnecessary downloads on smaller screens.",
            recommendation:
              "Provide appropriately sized source candidates for large content images where the implementation supports them.",
          },
        }),
  ];

  if (!pageSpeed.available) {
    checks.push(
      unavailableCheck("mobile-pagespeed-performance", "mobile-experience", 35),
      unavailableCheck("mobile-tap-targets", "mobile-experience", 10),
      unavailableCheck("mobile-content-width", "mobile-experience", 10),
    );
    return checks;
  }

  checks.push(
    check({
      id: "mobile-pagespeed-performance",
      category: "mobile-experience",
      weight: 35,
      status: pageSpeed.performanceScore >= 75 ? "passed" : "failed",
      score: pageSpeed.performanceScore,
    }),
  );

  for (const [id, score, title] of [
    ["mobile-tap-targets", pageSpeed.audits.tapTargets, "Some mobile controls may be difficult to tap"],
    ["mobile-content-width", pageSpeed.audits.contentWidth, "Page content may extend beyond the mobile viewport"],
  ] as const) {
    if (score === null || score === undefined) {
      checks.push(unavailableCheck(id, "mobile-experience", 10));
    } else if (score >= 90) {
      checks.push(check({ id, category: "mobile-experience", weight: 10, status: "passed", score }));
    } else {
      checks.push(
        check({
          id,
          category: "mobile-experience",
          weight: 10,
          status: "failed",
          score,
          finding: {
            severity: score < 50 ? "high" : "medium",
            title,
            explanation:
              "Google's mobile Lighthouse test detected a measurable layout or control-sizing issue.",
            whyItMatters:
              "Mobile visitors need content and controls that fit the viewport and work comfortably by touch.",
            recommendation:
              "Review the affected elements at common phone widths and with enlarged text, then rerun the mobile audit.",
          },
        }),
      );
    }
  }

  return checks;
}

function buildAccessibilityChecks(
  crawl: CrawlAuditData,
  pageSpeed: PageSpeedData,
): AuditCheckResult[] {
  const page = crawl.primaryPage;
  const altScore =
    page.imageCount === 0
      ? 100
      : ((page.imageCount - page.missingAltImageCount) / page.imageCount) * 100;
  const labelScore =
    page.formControlCount === 0
      ? null
      : ((page.formControlCount - page.unlabeledFormControlCount) /
          page.formControlCount) *
        100;
  const checks: AuditCheckResult[] = [
    page.missingAltImageCount === 0
      ? check({ id: "accessibility-image-alt", category: "accessibility", weight: 20, status: "passed", score: 100 })
      : check({
          id: "accessibility-image-alt",
          category: "accessibility",
          weight: 20,
          status: "failed",
          score: altScore,
          finding: {
            severity: altScore < 60 ? "high" : "medium",
            title: "Some images do not have alt attributes",
            explanation: `${page.missingAltImageCount} of ${page.imageCount} images are missing the alt attribute. Decorative images may use an empty alt value, but the attribute should still be present.`,
            whyItMatters:
              "People using screen readers need a text alternative for meaningful images and a clear signal when an image is decorative.",
            recommendation:
              "Add concise alt text to meaningful images and alt=\"\" to images that are purely decorative.",
          },
        }),
    page.documentLanguage
      ? check({ id: "accessibility-language", category: "accessibility", weight: 10, status: "passed", score: 100 })
      : check({
          id: "accessibility-language",
          category: "accessibility",
          weight: 10,
          status: "failed",
          score: 30,
          finding: {
            severity: "medium",
            title: "The page does not declare its language",
            explanation: "The HTML element does not include a non-empty lang attribute.",
            whyItMatters:
              "Assistive technology uses the page language to choose appropriate pronunciation and reading rules.",
            recommendation: "Add the correct language code to the HTML element, such as lang=\"en\" for English.",
          },
        }),
    hasObviousHeadingSkip(page.headings)
      ? check({
          id: "accessibility-heading-order",
          category: "accessibility",
          weight: 5,
          status: "failed",
          score: 60,
          finding: {
            severity: "medium",
            title: "The heading structure skips a level",
            explanation: "The page contains an obvious jump in heading levels.",
            whyItMatters:
              "A consistent heading outline helps screen-reader users navigate and understand the page.",
            recommendation: "Use headings in a logical nested order without choosing levels only for visual size.",
          },
        })
      : check({ id: "accessibility-heading-order", category: "accessibility", weight: 5, status: "passed", score: 100 }),
  ];

  if (labelScore === null) {
    checks.push(unavailableCheck("accessibility-form-labels", "accessibility", 15));
  } else if (page.unlabeledFormControlCount === 0) {
    checks.push(check({ id: "accessibility-form-labels", category: "accessibility", weight: 15, status: "passed", score: 100 }));
  } else {
    checks.push(
      check({
        id: "accessibility-form-labels",
        category: "accessibility",
        weight: 15,
        status: "failed",
        score: labelScore,
        finding: {
          severity: labelScore < 60 ? "high" : "medium",
          title: "Some form fields do not have detectable labels",
          explanation: `${page.unlabeledFormControlCount} of ${page.formControlCount} relevant form controls do not have an associated label or accessible name detectable from the HTML.`,
          whyItMatters:
            "A field label explains what information is expected and gives assistive technology essential context.",
          recommendation:
            "Connect each visible label to its field or provide an accurate accessible name where a visible label is not appropriate.",
        },
      }),
    );
  }

  if (!pageSpeed.available) {
    checks.push(
      unavailableCheck("accessibility-pagespeed", "accessibility", 35),
      unavailableCheck("accessibility-contrast", "accessibility", 15),
    );
  } else {
    if (pageSpeed.accessibilityScore === null) {
      checks.push(unavailableCheck("accessibility-pagespeed", "accessibility", 35));
    } else {
      checks.push(
        check({
          id: "accessibility-pagespeed",
          category: "accessibility",
          weight: 35,
          status: pageSpeed.accessibilityScore >= 90 ? "passed" : "failed",
          score: pageSpeed.accessibilityScore,
          finding:
            pageSpeed.accessibilityScore >= 90
              ? undefined
              : {
                  severity: pageSpeed.accessibilityScore < 70 ? "high" : "medium",
                  title: "Automated accessibility checks found issues",
                  explanation: `Google's mobile Lighthouse accessibility category scored ${pageSpeed.accessibilityScore} out of 100.`,
                  whyItMatters:
                    "Automated checks can identify detectable barriers, though they cannot determine full accessibility or legal compliance.",
                  recommendation:
                    "Address the specific automated failures, then perform keyboard, screen-reader, zoom, and human review.",
                  supportingMetric: {
                    label: "Lighthouse accessibility score",
                    value: `${pageSpeed.accessibilityScore}/100`,
                    context: "Automated result; not a WCAG certification.",
                  },
                },
        }),
      );
    }

    const contrastScore = pageSpeed.audits.colorContrast;
    checks.push(
      contrastScore === null || contrastScore === undefined
        ? unavailableCheck("accessibility-contrast", "accessibility", 15)
        : contrastScore >= 90
          ? check({ id: "accessibility-contrast", category: "accessibility", weight: 15, status: "passed", score: contrastScore })
          : check({
              id: "accessibility-contrast",
              category: "accessibility",
              weight: 15,
              status: "failed",
              score: contrastScore,
              finding: {
                severity: "high",
                title: "Some text does not have enough color contrast",
                explanation: "Google's automated mobile test detected text/background combinations that failed its contrast audit.",
                whyItMatters: "Low contrast can make content difficult or impossible to read for many visitors.",
                recommendation: "Increase contrast for the affected text while preserving visible hover, focus, and disabled states.",
              },
            }),
    );
  }

  return checks;
}

function buildConversionChecks(crawl: CrawlAuditData): AuditCheckResult[] {
  const page = crawl.primaryPage;
  const hasContactPath = page.contactLinkCount > 0 || page.formCount > 0;

  return [
    page.actionLinkCount > 0
      ? check({ id: "conversion-action-path", category: "conversion-ux", weight: 55, status: "passed", score: 100 })
      : check({
          id: "conversion-action-path",
          category: "conversion-ux",
          weight: 55,
          status: "opportunity",
          score: 68,
          finding: {
            severity: "opportunity",
            title: "No obvious action link was detected on the audited page",
            explanation:
              "The page did not contain a link or button whose visible text clearly matched common customer actions such as contact, book, request, call, or quote.",
            whyItMatters:
              "Visitors benefit from a clear next step once they understand the offer. This text-based check cannot judge visual prominence.",
            recommendation:
              "Confirm that the page has one plainly worded primary action that matches how a ready customer should proceed.",
          },
        }),
    hasContactPath
      ? check({ id: "conversion-contact-path", category: "conversion-ux", weight: 45, status: "passed", score: 100 })
      : check({
          id: "conversion-contact-path",
          category: "conversion-ux",
          weight: 45,
          status: "opportunity",
          score: 70,
          finding: {
            severity: "opportunity",
            title: "No direct contact path was detected on the audited page",
            explanation:
              "The HTML did not contain a form, telephone link, or email link. A separate contact page may still exist.",
            whyItMatters:
              "A direct contact path can reduce friction for visitors who are ready to ask a question or start a project.",
            recommendation:
              "Consider adding a relevant contact, booking, quote, phone, or email path where customers reach a decision.",
          },
        }),
  ];
}

function buildTechnicalChecks(crawl: CrawlAuditData): AuditCheckResult[] {
  const page = crawl.primaryPage;
  const finalUrl = new URL(crawl.finalUrl);
  const linkScore =
    crawl.brokenLinks.tested === 0
      ? null
      : ((crawl.brokenLinks.tested - crawl.brokenLinks.broken.length) /
          crawl.brokenLinks.tested) *
        100;
  const dimensionScore =
    page.imageCount === 0
      ? 100
      : ((page.imageCount - page.missingDimensionImageCount) / page.imageCount) *
        100;
  const checks: AuditCheckResult[] = [
    page.statusCode >= 200 && page.statusCode < 400
      ? check({ id: "technical-http-status", category: "technical-health", weight: 22, status: "passed", score: 100 })
      : check({
          id: "technical-http-status",
          category: "technical-health",
          weight: 22,
          status: "failed",
          score: 0,
          finding: {
            severity: "critical",
            title: "The submitted page did not return a successful response",
            explanation: `The final page response used HTTP status ${page.statusCode}.`,
            whyItMatters: "Visitors and search engines may not be able to use a page that returns an error response.",
            recommendation: "Restore a successful page response or redirect the URL to the correct working page.",
          },
        }),
    finalUrl.protocol === "https:"
      ? check({ id: "technical-https", category: "technical-health", weight: 18, status: "passed", score: 100 })
      : check({
          id: "technical-https",
          category: "technical-health",
          weight: 18,
          status: "failed",
          score: 20,
          finding: {
            severity: "high",
            title: "The website does not resolve over HTTPS",
            explanation: "The final audited URL uses an unencrypted HTTP connection.",
            whyItMatters: "HTTPS protects data in transit and is a basic trust and platform requirement.",
            recommendation: "Install a valid TLS certificate and redirect HTTP requests to the HTTPS version.",
          },
        }),
    crawl.redirectCount <= 1
      ? check({ id: "technical-redirect-chain", category: "technical-health", weight: 8, status: "passed", score: 100 })
      : check({
          id: "technical-redirect-chain",
          category: "technical-health",
          weight: 8,
          status: "failed",
          score: crawl.redirectCount === 2 ? 75 : 45,
          finding: {
            severity: crawl.redirectCount > 2 ? "medium" : "low",
            title: "The submitted URL follows a redirect chain",
            explanation: `${crawl.redirectCount} redirects occurred before the final page loaded.`,
            whyItMatters: "Each extra redirect adds delay and another point of failure.",
            recommendation: "Update important links to point directly to the final preferred URL where possible.",
          },
        }),
    resourceCheck({
      id: "technical-robots-txt",
      category: "technical-health",
      weight: 8,
      status: crawl.robots.status,
      title: "No robots.txt file was discovered",
      explanation: "The standard robots.txt location did not return a usable file.",
      whyItMatters: "A robots.txt file provides crawl guidance and a conventional place to reference the XML sitemap.",
      recommendation: "Publish a simple robots.txt file with deliberate rules and the preferred sitemap location.",
    }),
    page.htmlBytes <= 500 * 1024
      ? check({ id: "technical-html-size", category: "technical-health", weight: 8, status: "passed", score: 100 })
      : check({
          id: "technical-html-size",
          category: "technical-health",
          weight: 8,
          status: "failed",
          score: page.htmlBytes <= 800 * 1024 ? 65 : 30,
          finding: {
            severity: page.htmlBytes > 800 * 1024 ? "high" : "medium",
            title: "The HTML response is unusually large",
            explanation: `The downloaded HTML was approximately ${Math.round(page.htmlBytes / 1024)} KB before images, styles, and scripts.`,
            whyItMatters: "Large documents take longer to transfer and parse, especially on mobile devices.",
            recommendation: "Remove repeated or unused markup and avoid embedding large data payloads directly in the document.",
          },
        }),
    page.mixedContentCount === 0
      ? check({ id: "technical-mixed-content", category: "technical-health", weight: 10, status: "passed", score: 100 })
      : check({
          id: "technical-mixed-content",
          category: "technical-health",
          weight: 10,
          status: "failed",
          score: 30,
          finding: {
            severity: "high",
            title: "The HTTPS page references insecure resources",
            explanation: `${page.mixedContentCount} resource references use http:// on an HTTPS page.`,
            whyItMatters: "Browsers may block insecure resources or weaken visitor trust in the connection.",
            recommendation: "Serve every image, script, stylesheet, frame, and media resource over HTTPS.",
          },
        }),
    page.missingDimensionImageCount === 0
      ? check({ id: "technical-image-dimensions", category: "technical-health", weight: 6, status: "passed", score: 100 })
      : check({
          id: "technical-image-dimensions",
          category: "technical-health",
          weight: 6,
          status: "opportunity",
          score: Math.max(60, dimensionScore),
          finding: {
            severity: "opportunity",
            title: "Some images do not declare width and height",
            explanation: `${page.missingDimensionImageCount} of ${page.imageCount} images omit one or both intrinsic dimension attributes. CSS may still reserve space, so this is an opportunity rather than a confirmed layout problem.`,
            whyItMatters: "Known dimensions help browsers reserve space and reduce avoidable layout movement.",
            recommendation: "Declare intrinsic dimensions or otherwise reserve a stable aspect ratio for content images.",
          },
        }),
  ];

  if (linkScore === null) {
    checks.push(unavailableCheck("technical-broken-links", "technical-health", 20));
  } else if (crawl.brokenLinks.broken.length === 0) {
    checks.push(check({ id: "technical-broken-links", category: "technical-health", weight: 20, status: "passed", score: 100 }));
  } else {
    checks.push(
      check({
        id: "technical-broken-links",
        category: "technical-health",
        weight: 20,
        status: "failed",
        score: linkScore,
        finding: {
          severity: linkScore < 60 ? "high" : "medium",
          title: "Some sampled first-party links are broken",
          explanation: `${crawl.brokenLinks.broken.length} of ${crawl.brokenLinks.tested} sampled same-origin links returned an error response.`,
          whyItMatters: "Broken links interrupt customer tasks and make important pages harder for search engines to discover.",
          recommendation: "Repair or redirect the affected URLs and retest the links in production.",
          observedValue: crawl.brokenLinks.broken
            .slice(0, 3)
            .map((link) => `${new URL(link.url).pathname} (${link.statusCode})`)
            .join(", "),
        },
      }),
    );
  }

  return checks;
}

export function buildAuditChecks(
  crawl: CrawlAuditData,
  pageSpeed: PageSpeedData,
): { checks: readonly AuditCheckResult[]; notices: readonly string[] } {
  const notices = [
    "Automated accessibility checks identify detectable issues but do not certify WCAG conformance or legal compliance.",
    "Conversion / UX checks are limited to detectable action and contact paths; they are recommendations, not a visual design review.",
  ];

  if (!pageSpeed.available) {
    const reason =
      pageSpeed.reason === "not_configured"
        ? "Google PageSpeed Insights was not configured"
        : pageSpeed.reason === "rate_limited"
          ? "Google PageSpeed Insights was rate limited"
          : pageSpeed.reason === "timeout"
            ? "Google PageSpeed Insights timed out"
            : "Google PageSpeed Insights was unavailable";
    notices.unshift(
      `${reason}. Provider-dependent checks were excluded and available evidence was reweighted rather than scored as zero.`,
    );
  }

  return {
    checks: [
      ...buildSeoChecks(crawl, pageSpeed),
      ...buildPerformanceChecks(pageSpeed),
      ...buildMobileChecks(crawl, pageSpeed),
      ...buildAccessibilityChecks(crawl, pageSpeed),
      ...buildConversionChecks(crawl),
      ...buildTechnicalChecks(crawl),
    ],
    notices,
  };
}

export function getCategoryLabelForCheck(check: AuditCheckResult) {
  return getAuditCategory(check.category).label;
}
