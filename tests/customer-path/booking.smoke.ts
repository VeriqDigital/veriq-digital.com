import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium, type Locator, type Page } from "playwright-core";

const origin = process.env.CUSTOMER_PATH_TEST_ORIGIN ?? "http://127.0.0.1:3100";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname), "Local fixture server only");
const artifacts = path.resolve(process.env.CUSTOMER_PATH_ARTIFACTS ?? ".next/customer-path");
const bookingSelector = ".floating-booking-cta, .floating-booking-cta-mobile";

async function positionNearBottom(target: Locator, bottom = 45) {
  await target.evaluate((element, inset) => {
    window.scrollTo({ top: scrollY + element.getBoundingClientRect().bottom - innerHeight + inset, behavior: "instant" });
  }, bottom);
}

async function assertUnobscured(page: Page, target: Locator, label: string) {
  // Sample the actual intersection, rather than assuming the button is absent
  // or checking only a CTA's centre (which can miss partially covered labels).
  await page.waitForTimeout(300);
  const covered = await target.evaluate((element, selector) => {
    const rect = element.getBoundingClientRect();
    return [...document.querySelectorAll<HTMLElement>(selector)].some((booking) => {
      const box = booking.getBoundingClientRect();
      const left = Math.max(rect.left, box.left), right = Math.min(rect.right, box.right);
      const top = Math.max(rect.top, box.top), bottom = Math.min(rect.bottom, box.bottom);
      if (left >= right || top >= bottom) return false;
      return booking.contains(document.elementFromPoint((left + right) / 2, (top + bottom) / 2));
    });
  }, bookingSelector);
  assert.equal(covered, false, `${label}: floating booking intercepts content`);
}

test("booking yields to reading, in-page CTAs, forms, the footer and navigation", { timeout: 180_000 }, async () => {
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: "reduce", serviceWorkers: "block" });
    await context.route("**/*", (route) => {
      const request = route.request(), url = new URL(request.url());
      if (url.origin !== origin || url.pathname.startsWith("/api/") || !["GET", "HEAD"].includes(request.method())) return route.abort();
      return route.continue();
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const width of [320, 390, 430, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const cases = [
        { route: "/resources/website-redesign-seo-checklist", selector: "article p", name: "article-ending", inset: -10 },
        { route: "/resources/website-redesign-seo-checklist", selector: "section[aria-label='Next step'] a", name: "article-cta" },
        { route: "/small-business-web-design", selector: "main section:last-child a[href='/contact']", name: "service-cta" },
        { route: "/website-redesign", selector: "main section:last-child a[href='/contact']", name: "redesign-cta" },
        { route: "/des-moines-web-design", selector: "main section:last-child a[href='/contact']", name: "local-cta" },
        { route: "/services", selector: "main section:last-child a[href='/contact']", name: "services-cta" },
        { route: "/", selector: "textarea[name='message']", name: "home-form" },
      ];
      for (const item of cases) {
        const response = await page.goto(`${origin}${item.route}`, { waitUntil: "networkidle" });
        assert.equal(response?.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
        const target = page.locator(item.selector).last();
        await positionNearBottom(target, item.inset);
        await page.waitForTimeout(300);
        await page.screenshot({ path: path.join(artifacts, `${item.name}-${width}.png`) });
        await assertUnobscured(page, target, `${item.name} ${width}`);
        if (item.name === "article-cta") {
          await target.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(`${origin}/website-redesign`);
          assert.equal(await page.locator("main h1").count(), 1);
        } else if (item.name.endsWith("-cta")) {
          await target.focus();
          await page.keyboard.press("Enter");
          await page.waitForURL(`${origin}/contact`);
          assert.equal(await page.locator("main form").count(), 1);
        }
      }

      // A protected section must not permanently disable booking after a route
      // change. At this point the homepage form is visible; leave it for services.
      await page.locator("footer a[href='/services#web-design-development']").click();
      await page.waitForURL("**/services#web-design-development");
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
      const booking = page.locator(width < 900 ? ".floating-booking-cta-mobile" : ".floating-booking-cta");
      await page.waitForFunction((selector) => document.querySelector(selector)?.getAttribute("data-visible") === "true", width < 900 ? ".floating-booking-cta-mobile" : ".floating-booking-cta");
      assert.equal(await booking.getAttribute("href"), "https://cal.com/mickenev/veriq");
      assert.equal(await booking.getAttribute("target"), "_blank");
      await booking.click({ trial: true }); // Do not visit or submit to the provider.
      if (width < 1280) {
        await page.getByRole("button", { name: "Open navigation menu" }).click();
        await page.waitForTimeout(300);
        assert.equal(await booking.getAttribute("aria-hidden"), "true");
        await page.keyboard.press("Escape");
      }
      const footerLink = page.locator("footer a[href='/contact']");
      await footerLink.focus();
      await footerLink.scrollIntoViewIfNeeded();
      await assertUnobscured(page, footerLink, `footer ${width}`);
      assert.equal(await booking.getAttribute("tabindex"), "-1");
      await footerLink.click();
      await page.waitForURL(`${origin}/contact`);
      assert.equal(await page.locator(bookingSelector).count(), 0);
      await page.locator("textarea[name='message']").focus();
      await assertUnobscured(page, page.locator("textarea[name='message']"), `contact ${width}`);
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
