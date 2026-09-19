import assert from "node:assert/strict";
import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import test from "node:test";
import { load } from "cheerio";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { getWebsiteAuditRuntimeConfig } from "../../lib/website-audit/runtime-config";

// Match the existing component-test approach: stub CSS, render real components.
const require = createRequire(import.meta.url);
require.extensions[".css"] = (module) => { module.exports = {}; };
const { resources, getResource } = require("../../data/resources") as typeof import("../../data/resources");
const { default: ResourcePage, generateMetadata, generateStaticParams } = require("../../app/resources/[slug]/page") as typeof import("../../app/resources/[slug]/page");
const { default: ResourceNextStep } = require("../../components/resources/ResourceNextStep") as typeof import("../../components/resources/ResourceNextStep");
const { default: BlogPage } = require("../../app/blog/page") as typeof import("../../app/blog/page");
const { default: sitemap } = require("../../app/sitemap") as typeof import("../../app/sitemap");
const { siteConfig } = require("../../config/site") as typeof import("../../config/site");
const cost = require("../../content/resources/small-business-website-cost") as typeof import("../../content/resources/small-business-website-cost");
const payment = require("../../content/resources/one-time-website-pricing-vs-monthly-plans") as typeof import("../../content/resources/one-time-website-pricing-vs-monthly-plans");
delete require.extensions[".css"];

const newSlug = "one-time-website-pricing-vs-monthly-plans";
const redesignSlug = "website-redesign-seo-checklist";
const builderSlug = "web-designer-vs-website-builder-for-small-business";
const refreshed = [
  ["website-looks-bad-on-mobile", "2026-08-12"],
  ["how-much-does-a-small-business-website-cost", "2026-08-11"],
  ["how-to-choose-a-web-designer-in-des-moines", "2026-08-09"],
] as const;

test("registry has unique articles, valid related guides, next steps, and complete TOCs", () => {
  const slugs = resources.map((article) => article.slug);
  assert.equal(new Set(slugs).size, slugs.length);
  assert.equal(slugs.filter((slug) => slug === newSlug).length, 1);
  assert.equal(slugs.filter((slug) => slug === redesignSlug).length, 1);
  for (const article of resources) {
    assert.equal(new Set(article.relatedSlugs).size, article.relatedSlugs.length);
    for (const slug of article.relatedSlugs) {
      assert.ok(getResource(slug), `${article.slug}: missing related ${slug}`);
      assert.notEqual(slug, article.slug);
    }
    if (typeof article.nextStep === "string" && article.nextStep.startsWith("/resources/")) {
      assert.ok(getResource(article.nextStep.slice("/resources/".length)));
    }
    const $ = load(renderToStaticMarkup(createElement(article.Content)));
    const ids = $("[id]").map((_, element) => $(element).attr("id")).get();
    assert.equal(new Set(ids).size, ids.length, `${article.slug}: duplicate section ID`);
    assert.deepEqual(article.tableOfContents.map((item) => item.id), $("section[id]").map((_, element) => $(element).attr("id")).get(), `${article.slug}: TOC order and coverage`);
    assert.equal($("h1").length, 0, `${article.slug}: body must not add an H1`);
  }
});

for (const newSlug of ["one-time-website-pricing-vs-monthly-plans", redesignSlug]) {
  test(`${newSlug} is registered in static routes, blog links, sitemap, and canonical metadata`, async () => {
    const path = `/resources/${newSlug}`;
    const article = getResource(newSlug)!;
    assert.ok(generateStaticParams().some(({ slug }) => slug === newSlug));
    const blog = load(renderToStaticMarkup(createElement(BlogPage)));
    assert.equal(blog(`a[href="${path}"]`).length, 1);
    const entry = sitemap().find(({ url }) => url === `${siteConfig.url}${path}`);
    assert.ok(entry);
    assert.equal(entry.lastModified, "2026-09-19");
    const metadata = await generateMetadata({ params: Promise.resolve({ slug: newSlug }) });
    assert.equal(metadata.alternates?.canonical, path);
    assert.deepEqual(metadata.title, { absolute: `${article.seoTitle} | Veriq` });
    assert.equal(metadata.description, article.description);
    assert.equal(metadata.openGraph?.url, path);
  });
}

test("refreshed publication dates are preserved and only substantive updates get dates", () => {
  for (const [slug, publishedAt] of refreshed) {
    assert.equal(getResource(slug)?.publishedAt, publishedAt);
    assert.equal(getResource(slug)?.dateModified, "2026-09-19");
  }
  assert.equal(getResource(newSlug)?.publishedAt, "2026-09-19");
  assert.equal(getResource(newSlug)?.dateModified, undefined);
  assert.equal(getResource("why-is-my-website-slow")?.dateModified, undefined);
  assert.equal(getResource(builderSlug)?.publishedAt, "2026-08-11");
  assert.equal(getResource(builderSlug)?.dateModified, "2026-09-19");
  assert.equal(getResource(redesignSlug)?.publishedAt, "2026-09-19");
  assert.equal(getResource(redesignSlug)?.dateModified, undefined);
  for (const [slug, publishedAt, dateModified] of [
    ["website-redesign-vs-rebuild", "2026-08-12", undefined],
    ["how-much-does-a-website-redesign-cost", "2026-08-12", "2026-08-30"],
    ["why-isnt-my-business-website-showing-up-on-google", "2026-08-09", undefined],
    ["signs-your-website-is-outdated", "2026-08-12", undefined],
  ] as const) {
    assert.equal(getResource(slug)?.publishedAt, publishedAt);
    assert.equal(getResource(slug)?.dateModified, dateModified);
  }
});

test("all article routes, including unaffected guides, render with accurate schema and internal links", async () => {
  for (const article of resources) {
    const { slug } = article;
    const $ = load(renderToStaticMarkup(await ResourcePage({ params: Promise.resolve({ slug }) })));
    assert.equal($("h1").length, 1);
    assert.equal($("h1").text(), article.title);
    assert.ok($("article").text().length > 1000);
    const graph = JSON.parse($("script[type='application/ld+json']").text())["@graph"];
    assert.deepEqual(graph.map((item: { "@type": string }) => item["@type"]), ["BlogPosting", "BreadcrumbList"]);
    assert.equal(graph[0].url, `${siteConfig.url}/resources/${slug}`);
    assert.equal(graph[0].datePublished, article.publishedAt);
    assert.equal(graph[0].dateModified, article.dateModified);
    assert.ok(graph[0].author.name);
    assert.equal(graph[1].itemListElement.at(-1).item, graph[0].url);
    for (const table of $("table").toArray()) {
      assert.ok($(table).find("caption").text());
      assert.equal($(table).find("thead th[scope='col']").length, 3);
      assert.equal($(table).parent().attr("tabindex"), "0");
      assert.equal($(table).parent().attr("role"), "region");
      assert.ok($(table).parent().attr("aria-label"));
    }
    for (const anchor of $("article a[href^='/']").toArray()) {
      const href = $(anchor).attr("href")!;
      if (!href.startsWith("/resources/")) {
        const pathname = href.split(/[?#]/)[0];
        assert.ok(existsSync(`app${pathname}/page.tsx`) || sitemap().some(({ url }) => url === `${siteConfig.url}${pathname}`), `${slug}: broken internal link ${href}`);
        continue;
      }
      const [target, fragment] = href.slice("/resources/".length).split("#");
      const linkedArticle = getResource(target);
      assert.ok(linkedArticle, `broken article link: ${target}`);
      if (fragment) {
        const targetHtml = load(renderToStaticMarkup(createElement(linkedArticle.Content)));
        assert.equal(targetHtml(`[id='${fragment}']`).length, 1);
      }
    }
  }
});

test("Batch 2 guides retain distinct service next steps and reciprocal redesign links", async () => {
  for (const [slug, destination, label] of [
    [builderSlug, "/small-business-web-design", "Explore small business web design"],
    [redesignSlug, "/website-redesign", "Explore website redesign services"],
  ]) {
    const $ = load(renderToStaticMarkup(await ResourcePage({ params: Promise.resolve({ slug }) })));
    const cta = $("section[aria-label='Next step'] a");
    assert.equal(cta.attr("href"), destination);
    assert.equal(cta.text().replace("↗", "").trim(), label);
  }
  for (const slug of [builderSlug, "website-redesign-vs-rebuild", "how-much-does-a-website-redesign-cost", "why-isnt-my-business-website-showing-up-on-google"]) {
    const $ = load(renderToStaticMarkup(createElement(getResource(slug)!.Content)));
    assert.equal($(`a[href='/resources/${redesignSlug}']`).length, 1);
  }
});

test("commercial and resource CTAs retain truthful labels and destinations", () => {
  const cases = [
    ["/pricing", "View website pricing"],
    ["/des-moines-web-design", "Explore Des Moines web design"],
    ["/small-business-web-design", "Explore small business web design"],
    ["/website-redesign", "Explore website redesign services"],
    ["/resources/why-is-my-website-slow", "Read the next guide"],
  ] as const;
  for (const [nextStep, label] of cases) {
    const $ = load(renderToStaticMarkup(createElement(ResourceNextStep, { nextStep })));
    assert.equal($("a").attr("href"), nextStep);
    assert.equal($("a").text().replace("↗", "").trim(), label);
  }
});

test("optional audit CTA respects discovery and retains the intended redesign fallback", () => {
  const nextStep = { type: "audit", fallback: "/website-redesign" } as const;
  for (const [environment, visible] of [
    [{ NODE_ENV: "test", WEBSITE_AUDIT_DISCOVERY_ENABLED: "true" }, true],
    [{ NODE_ENV: "test", WEBSITE_AUDIT_DISCOVERY_ENABLED: "false" }, false],
    [{ NODE_ENV: "production", WEBSITE_AUDIT_DISCOVERY_ENABLED: "true", WEBSITE_AUDIT_ENABLED: "true" }, false],
  ] as const) {
    const auditDiscoverable = getWebsiteAuditRuntimeConfig(environment).discoverable;
    assert.equal(auditDiscoverable, visible);
    const $ = load(renderToStaticMarkup(createElement(ResourceNextStep, { nextStep, auditDiscoverable })));
    assert.equal($("a").attr("href"), visible ? "/website-audit" : "/website-redesign");
    assert.equal($("a").text().replace("↗", "").trim(), visible ? "Audit Your Website" : "Explore website redesign services");
    if (visible) assert.match($("p").text(), /cannot assess the complete customer experience/);
    else assert.doesNotMatch($.html(), /href="\/website-audit"/);
  }
});

test("worked budget totals and every rendered budget amount are correct", () => {
  assert.equal(cost.firstYearOperatingTotal, 1136);
  assert.equal(cost.firstYearBudgetTotal, 5136);
  const $ = load(renderToStaticMarkup(createElement(cost.default)));
  const rows = $("#budget tbody tr").map((_, row) => $(row).find("td").last().text()).get();
  assert.deepEqual(rows, ["$4,000", "$20", "$300", "$96", "$600", "$120", "$1,136", "$5,136"]);
  assert.match($("#budget").text(), /Hypothetical example/);
  assert.match($("#where-veriq-fits").text(), /\$1,000 for/);
});

test("worked payment comparison computes and renders all 12- and 36-month amounts", () => {
  assert.equal(payment.paymentExampleTotal("project", 12), 4020);
  assert.equal(payment.paymentExampleTotal("project", 36), 4860);
  assert.equal(payment.paymentExampleTotal("managed", 12), 2700);
  assert.equal(payment.paymentExampleTotal("managed", 36), 7500);
  const $ = load(renderToStaticMarkup(createElement(payment.default)));
  const rows = $("#worked-comparison tbody tr").toArray().map((row) => $(row).find("td").map((_, cell) => $(cell).text()).get());
  assert.deepEqual(rows.slice(0, 4), [
    ["$3,600", "$300"],
    ["$35 hosting only", "$200 hosting, maintenance, and limited edits"],
    ["$3,600 + 12 × $35 = $4,020", "$300 + 12 × $200 = $2,700"],
    ["$3,600 + 36 × $35 = $4,860", "$300 + 36 × $200 = $7,500"],
  ]);
  const text = $("#worked-comparison").text();
  assert.match(text, /hypothetical planning example/);
  assert.match(text, /not a market average, an actual offer, or Veriq pricing/);
  assert.match(text, /12-month minimum/);
});
