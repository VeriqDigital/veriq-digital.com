import assert from "node:assert/strict";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { load } from "cheerio";
import { chromium } from "playwright-core";
import { siteConfig } from "../../config/site";

// Run against a local production server. Never submit forms or run an audit.
const origin = process.env.RESOURCE_TEST_ORIGIN ?? "http://127.0.0.1:3100";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname), "Use a local fixture server only");
const artifacts = path.resolve(".next/content-review");
const articles = [
  { slug: "website-looks-bad-on-mobile", section: "diagnostics", cta: "/website-redesign" },
  { slug: "how-much-does-a-small-business-website-cost", section: "budget", cta: "/small-business-web-design" },
  { slug: "how-to-choose-a-web-designer-in-des-moines", section: "proposal-worksheet", cta: "/des-moines-web-design" },
  { slug: "one-time-website-pricing-vs-monthly-plans", section: "worked-comparison", cta: "/pricing" },
  { slug: "web-designer-vs-website-builder-for-small-business", section: "comparison", cta: "/small-business-web-design" },
  { slug: "website-redesign-seo-checklist", section: "url-map", cta: "/website-redesign" },
];

test("production articles retain metadata, readable responsive layouts, keyboard tables, and working TOCs", { timeout: 180_000 }, async () => {
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results: object[] = [];
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    // Stop analytics, third-party assets, API mutations, and external navigation.
    await context.route("**/*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin !== origin || url.pathname.startsWith("/api/") || !["GET", "HEAD"].includes(request.method())) {
        return route.abort();
      }
      return route.continue();
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const width of [320, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      for (const article of articles) {
        const response = await page.goto(`${origin}/resources/${article.slug}`, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        const html = load(await response!.text());
        assert.equal(html("h1").length, 1);
        assert.equal(html("link[rel='canonical']").attr("href"), `${siteConfig.url}/resources/${article.slug}`);
        assert.ok(html("title").text().endsWith(" | Veriq"));
        assert.ok(html("meta[name='description']").attr("content"));
        assert.equal(html("meta[property='og:type']").attr("content"), "article");
        assert.ok(html("meta[property='article:published_time']").attr("content"));
        if (article.slug === "how-much-does-a-small-business-website-cost") {
          assert.deepEqual(html("#budget tbody tr").map((_, row) => html(row).find("td").last().text()).get(),
            ["$4,000", "$20", "$300", "$96", "$600", "$120", "$1,136", "$5,136"]);
        }
        if (article.slug === "one-time-website-pricing-vs-monthly-plans") {
          assert.deepEqual(html("#worked-comparison tbody tr").slice(0, 4).toArray().map((row) => html(row).find("td").map((_, cell) => html(cell).text()).get()), [
            ["$3,600", "$300"],
            ["$35 hosting only", "$200 hosting, maintenance, and limited edits"],
            ["$3,600 + 12 × $35 = $4,020", "$300 + 12 × $200 = $2,700"],
            ["$3,600 + 36 × $35 = $4,860", "$300 + 36 × $200 = $7,500"],
          ]);
        }
        if (!["one-time-website-pricing-vs-monthly-plans", "website-redesign-seo-checklist"].includes(article.slug)) {
          assert.equal(html("meta[property='article:modified_time']").attr("content"), "2026-09-19");
        } else {
          assert.equal(html("meta[property='article:published_time']").attr("content"), "2026-09-19");
          assert.equal(html("meta[property='article:modified_time']").attr("content"), undefined);
        }
        for (const script of html("script[type='application/ld+json']").toArray()) {
          JSON.parse(html(script).text());
        }
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        assert.ok(overflow <= 1, `${article.slug} at ${width}px: page overflow ${overflow}`);
        const title = page.locator("h1");
        assert.ok(await title.isVisible());
        assert.equal(await title.evaluate((node) => node.scrollWidth > node.clientWidth + 1), false);
        await page.screenshot({ path: path.join(artifacts, `${article.slug}-${width}-hero.png`) });

        // Check every TOC target and click one to exercise actual anchor navigation.
        const anchors = page.locator("aside a[href^='#']");
        for (const href of await anchors.evaluateAll((nodes) => nodes.map((node) => node.getAttribute("href")!))) {
          assert.equal(await page.locator(`[id='${href.slice(1)}']`).count(), 1);
        }
        await page.locator(`aside a[href='#${article.section}']`).click();
        await page.waitForURL(`**#${article.section}`);
        const sectionTop = await page.locator(`#${article.section}`).evaluate((node) => node.getBoundingClientRect().top);
        assert.ok(sectionTop >= 0 && sectionTop < 200, `anchor offset: ${sectionTop}`);

        const tableRegions = page.locator("article [role='region'][tabindex='0']");
        let scrollableTables = 0;
        for (const region of await tableRegions.all()) {
          await region.focus();
          await page.keyboard.press("Shift+Tab");
          await page.keyboard.press("Tab");
          assert.equal(await region.evaluate((node) => node === document.activeElement), true);
          assert.notEqual(await region.evaluate((node) => getComputedStyle(node).outlineStyle), "none");
          const before = await region.evaluate((node) => ({ left: node.scrollLeft, extra: node.scrollWidth - node.clientWidth }));
          if (before.extra > 1) {
            scrollableTables += 1;
            await page.keyboard.press("ArrowRight");
            await page.waitForFunction(() => document.activeElement && document.activeElement.scrollLeft > 0);
            // Let Chromium finish its keyboard-scroll animation before resetting
            // the table for a visual capture of its initial state.
            await page.waitForTimeout(200);
            await region.evaluate((node) => { node.scrollLeft = 0; });
          }
        }
        await page.locator(`#${article.section} [role='region']`).evaluate((node) => {
          window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top - 80, behavior: "instant" });
        });
        await page.screenshot({ path: path.join(artifacts, `${article.slug}-${width}-table.png`) });
        if (width < 700 && ["web-designer-vs-website-builder-for-small-business", "website-redesign-seo-checklist"].includes(article.slug)) {
          const region = page.locator(`#${article.section} [role='region']`);
          await region.evaluate((node) => { node.scrollLeft = node.scrollWidth; });
          await page.screenshot({ path: path.join(artifacts, `${article.slug}-${width}-table-end.png`) });
          await region.evaluate((node) => { node.scrollLeft = 0; });
        }
        if (article.slug === "website-looks-bad-on-mobile") {
          await page.locator("figure").screenshot({ path: path.join(artifacts, `mobile-illustration-${width}.png`) });
        }
        const cta = page.locator("section[aria-label='Next step']");
        const destination = await cta.locator("a").getAttribute("href");
        assert.ok(destination === article.cta || (article.slug === "website-looks-bad-on-mobile" && destination === "/website-audit"));
        assert.ok(await cta.locator("a").innerText());
        await cta.screenshot({ path: path.join(artifacts, `${article.slug}-${width}-cta.png`) });
        const reviewSection = article.slug === "website-redesign-seo-checklist" ? "launch-prep"
          : article.slug === "web-designer-vs-website-builder-for-small-business" ? "decision" : null;
        if (reviewSection) {
          await page.locator(`#${reviewSection}`).evaluate((node) => {
            window.scrollTo({ top: window.scrollY + node.getBoundingClientRect().top - 128, behavior: "instant" });
          });
          await page.screenshot({ path: path.join(artifacts, `${article.slug}-${width}-checklist.png`) });
        }
        // Verify commercial destination exists; do not follow the optional audit.
        if (destination !== "/website-audit") {
          const linked = await context.request.get(`${origin}${destination}`);
          assert.equal(linked.status(), 200);
        }
        results.push({ slug: article.slug, width, overflow, scrollableTables, destination });
      }
    }
    await page.goto(`${origin}/resources/why-is-my-website-slow`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("h1").textContent(), "Why Is My Website Slow?");
    assert.equal(errors.length, 0, errors.join("\n"));

    await page.goto(`${origin}/blog`, { waitUntil: "networkidle" });
    assert.equal(await page.locator("a[href='/resources/one-time-website-pricing-vs-monthly-plans']").count(), 1);
    const sitemap = await context.request.get(`${origin}/sitemap.xml`);
    const sitemapXml = await sitemap.text();
    for (const article of articles) {
      assert.equal(await page.locator(`main a[href='/resources/${article.slug}']`).count(), 1, `blog listing: ${article.slug}`);
      assert.ok(sitemapXml.includes(`${siteConfig.url}/resources/${article.slug}`));
    }
    const service = await context.request.get(`${origin}/website-redesign`);
    const serviceHtml = load(await service.text());
    assert.equal(serviceHtml("a[href='/resources/website-redesign-seo-checklist']").length, 1);
    await writeFile(path.join(artifacts, "results.json"), JSON.stringify(results, null, 2));
    console.info(`Verified ${results.length} article/viewport combinations; screenshots: ${artifacts}`);
  } finally {
    await browser.close();
  }
});
