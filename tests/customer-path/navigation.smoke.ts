import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium, type Locator } from "playwright-core";

const origin = process.env.CUSTOMER_PATH_TEST_ORIGIN ?? "http://127.0.0.1:3100";
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(new URL(origin).hostname), "Use a local fixture server only");
const artifacts = path.resolve(".next/customer-path");

async function assertWithinViewport(control: Locator, width: number, height: number) {
  const bounds = await control.boundingBox();
  const state = await control.evaluate((node) => {
    const header = node.closest("header")!;
    return {
      control: node.getAttribute("aria-label") ?? node.textContent?.trim(),
      rootTextSize: getComputedStyle(document.documentElement).fontSize,
      scrollY,
      headerVisible: header.dataset.visible,
      headerTransform: getComputedStyle(header).transform,
    };
  });
  const context = `${width}x${height}: ${JSON.stringify(state)}`;
  assert.ok(bounds, `Navigation control has visible bounds: ${context}`);
  assert.ok(bounds.x >= -1 && bounds.x + bounds.width <= width + 1,
    `Navigation control extends outside ${width}px viewport: ${JSON.stringify(bounds)}; ${context}`);
  assert.ok(bounds.y >= -1 && bounds.y + bounds.height <= height + 1,
    `Navigation control extends outside ${height}px viewport: ${JSON.stringify(bounds)}; ${context}`);
  assert.equal(await control.evaluate((node) => node.scrollWidth <= node.clientWidth + 1), true,
    `Navigation label fits inside its control without colliding with the next control: ${context}`);
}

test("navigation remains reachable with enlarged text and a short viewport", { timeout: 120_000 }, async () => {
  await mkdir(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  try {
    const context = await browser.newContext({ reducedMotion: "reduce" });
    await context.route("**/*", (route) => {
      const request = route.request();
      const url = new URL(request.url());
      return url.origin === origin && !url.pathname.startsWith("/api/") && ["GET", "HEAD"].includes(request.method())
        ? route.continue() : route.abort();
    });
    const page = await context.newPage();
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));

    for (const textSize of ["100%", "200%"]) {
      for (const width of [320, 390, 430, 768, 1440]) {
        for (const height of [640, 900]) {
          await page.setViewportSize({ width, height });
          await page.goto(origin, { waitUntil: "networkidle" });
          await page.evaluate((size) => { document.documentElement.style.fontSize = size; }, textSize);
          const primary = page.getByRole("navigation", { name: "Primary", exact: true });
          for (const control of await primary.locator("a:visible, button:visible").all()) {
            await assertWithinViewport(control, width, height);
          }

          const trigger = page.getByRole("button", { name: "Open navigation menu", exact: true });
          if (await trigger.isVisible()) {
            await trigger.focus();
            await page.keyboard.press("Enter");
            const menu = page.getByRole("navigation", { name: "Mobile navigation", exact: true });
            await menu.waitFor({ state: "visible" });
            const contact = menu.getByRole("link", { name: "Contact", exact: true });
            // Tabbing to the last link must reveal it inside the bounded menu.
            for (let index = 0; index < await menu.getByRole("link").count(); index += 1) {
              await page.keyboard.press("Tab");
            }
            assert.equal(await contact.evaluate((node) => node === document.activeElement), true);
            await assertWithinViewport(contact, width, height);
            const contained = await contact.evaluate((node) => {
              const parent = node.closest("nav")!.getBoundingClientRect();
              const bounds = node.getBoundingClientRect();
              return bounds.top >= parent.top && bounds.bottom <= parent.bottom;
            });
            assert.equal(contained, true, "Focused Contact link is visible inside the menu");
            await page.screenshot({ path: path.join(artifacts, `navigation-${width}x${height}-${textSize.replace("%", "")}.png`) });
            await page.keyboard.press("Enter");
          } else {
            await primary.getByRole("link", { name: "Contact", exact: true }).click();
          }
          await page.waitForURL(`${origin}/contact`);
          assert.equal(await page.locator("#mobile-navigation").count(), 0);

          if (await trigger.isVisible()) {
            await trigger.click();
            await page.getByRole("navigation", { name: "Mobile navigation", exact: true })
              .getByRole("link", { name: "Services", exact: true }).click();
          } else {
            await primary.getByRole("link", { name: "Services", exact: true }).click();
          }
          await page.waitForURL(`${origin}/services`);
          assert.equal(await page.locator("#mobile-navigation").count(), 0);
          assert.ok(await page.locator("main h1").isVisible());

          if (await trigger.isVisible()) {
            await page.evaluate(() => window.scrollTo({ top: 300, behavior: "instant" }));
            await trigger.focus();
            const scrollBefore = await page.evaluate(() => window.scrollY);
            await page.keyboard.press("Enter");
            await page.keyboard.press("Tab");
            await page.keyboard.press("Escape");
            await page.waitForFunction(() => document.documentElement.dataset.mobileMenuOpen === "false");
            assert.equal(await page.locator("#mobile-navigation").count(), 0);
            assert.equal(await page.evaluate(() => window.scrollY), scrollBefore,
              "Dismissing navigation preserves the visitor's reading position");
          }
        }
      }
    }

    // Row sizing must not disable hide-on-scroll or keyboard reveal.
    for (const width of [390, 1440]) {
      await page.setViewportSize({ width, height: 640 });
      await page.goto(`${origin}/services`, { waitUntil: "networkidle" });
      await page.evaluate(() => window.scrollTo({ top: 600, behavior: "instant" }));
      await page.waitForFunction(() => document.querySelector("header.site-navbar")?.getAttribute("data-visible") === "false");
      const header = page.locator("header.site-navbar");
      assert.ok(await header.evaluate((node) => node.getBoundingClientRect().bottom <= 1), "Navigation hides after scrolling down");
      await page.evaluate(() => window.scrollTo({ top: 560, behavior: "instant" }));
      await page.waitForFunction(() => document.querySelector("header.site-navbar")?.getAttribute("data-visible") === "true");
      const logo = header.getByRole("link", { name: "Veriq", exact: true });
      await assertWithinViewport(logo, width, 640);
      await page.evaluate(() => window.scrollTo({ top: 900, behavior: "instant" }));
      await page.waitForFunction(() => document.querySelector("header.site-navbar")?.getAttribute("data-visible") === "false");
      await logo.focus();
      await page.keyboard.press("Tab");
      const focused = page.locator(":focus");
      assert.equal(await focused.evaluate((node) => Boolean(node.closest("header.site-navbar"))), true);
      await assertWithinViewport(focused, width, 640);
    }
    assert.deepEqual(errors, []);
  } finally {
    await browser.close();
  }
});
