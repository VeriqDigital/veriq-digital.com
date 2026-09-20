import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { chromium, type Browser, type Route } from "playwright-core";

// Use only the isolated local build. No request may reach a real lead provider.
const origin = process.env.CUSTOMER_PATH_TEST_ORIGIN ?? "http://127.0.0.1:3100";
const localUrl = new URL(origin);
assert.ok(["localhost", "127.0.0.1", "[::1]"].includes(localUrl.hostname));
assert.equal(localUrl.origin, origin, "Use a plain local origin without credentials or a path");
const widths = [320, 390, 430, 768, 1440];
const artifacts = path.resolve(".next/customer-path");

async function isolatedContext(browser: Browser, width: number, leads?: (route: Route) => Promise<void>) {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && url.pathname === "/api/leads" && request.method() === "POST" && leads) {
      return leads(route);
    }
    if (url.origin !== origin || url.pathname.startsWith("/api/") || !["GET", "HEAD"].includes(request.method())) {
      return route.abort();
    }
    return route.continue();
  });
  return context;
}

test("budget popup dismisses on Tab so the focused message stays readable", { timeout: 60_000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  await mkdir(artifacts, { recursive: true });
  try {
    for (const width of widths) {
      const context = await isolatedContext(browser, width);
      const page = await context.newPage();
      await page.goto(`${origin}/contact`, { waitUntil: "networkidle" });
      const budget = page.getByRole("combobox", { name: "Budget Optional" });
      const message = page.locator("textarea[name='message']");
      await message.fill("I need a website redesign. This message must remain readable.");
      await budget.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Tab");
      assert.equal(await message.evaluate((node) => node === document.activeElement), true);
      await page.screenshot({ path: path.join(artifacts, `budget-tab-${width}.png`) });
      assert.equal(await page.getByRole("listbox").count(), 0, `${width}px: budget options cover the focused message after Tab`);
      assert.equal(await budget.getAttribute("aria-expanded"), "false");
      assert.equal(await message.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return document.elementFromPoint(rect.left + 20, rect.top + 20) === node;
      }), true, `${width}px: the message text is unobscured`);

      await page.keyboard.press("Shift+Tab");
      assert.equal(await budget.evaluate((node) => node === document.activeElement), true);
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Shift+Tab");
      assert.equal(await page.locator("input[name='phone']").evaluate((node) => node === document.activeElement), true);
      assert.equal(await page.getByRole("listbox").count(), 0);

      // Dismissal must preserve keyboard selection, Escape, and pointer selection.
      await budget.focus();
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("End");
      await page.keyboard.press("Enter");
      assert.equal(await page.locator("input[name='topic']").inputValue(), "10000-plus");
      await page.keyboard.press("ArrowDown");
      await page.keyboard.press("Escape");
      assert.equal(await page.getByRole("listbox").count(), 0);
      await budget.click();
      await page.getByRole("option", { name: "Under $2,000" }).click();
      assert.equal(await page.locator("input[name='topic']").inputValue(), "under-2000");
      assert.equal(await budget.evaluate((node) => node === document.activeElement), true);
      await context.close();
    }
  } finally {
    await browser.close();
  }
});

test("home and contact forms preserve input across handled failures and allow a successful retry", { timeout: 120_000 }, async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      for (const pathname of ["/", "/contact"]) {
        let outcome: "pending" | "network" | "success" = "pending";
        let releasePending: (() => Promise<void>) | undefined;
        const payloads: unknown[] = [];
        const context = await isolatedContext(browser, width, async (route) => {
          payloads.push(route.request().postDataJSON());
          if (outcome === "pending") {
            return new Promise<void>((resolve) => {
              releasePending = async () => {
                await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ message: "QA handled failure. Please try again." }) });
                resolve();
              };
            });
          }
          if (outcome === "network") return route.abort("failed");
          return route.fulfill({ status: 201, contentType: "application/json", body: JSON.stringify({ message: "QA synthetic success" }) });
        });
        const page = await context.newPage();
        const errors: string[] = [];
        page.on("pageerror", (error) => errors.push(error.message));
        await page.goto(`${origin}${pathname}`, { waitUntil: "networkidle" });
        const form = page.locator("main form");
        const submit = form.locator("button[type='submit']");
        await submit.click();
        assert.equal(payloads.length, 0, "required fields prevent a request");
        assert.equal(await form.locator("input[name='name']").evaluate((node: HTMLInputElement) => node.validity.valueMissing), true);
        await form.locator("input[name='name']").fill("QA Synthetic Visitor");
        await form.locator("input[name='email']").fill("invalid-email");
        await form.locator("textarea[name='message']").fill("Synthetic QA inquiry, intercepted before any provider.");
        if (pathname === "/") {
          await form.locator("select[name='projectType']").selectOption("Website redesign");
        } else {
          await form.locator("input[name='phone']").fill("2025550100");
          await page.getByRole("combobox", { name: "Budget Optional" }).click();
          await page.getByRole("option", { name: "$10,000+", exact: true }).click();
        }
        await submit.click();
        assert.equal(payloads.length, 0, "invalid email prevents a request");
        assert.equal(await form.locator("input[name='email']").evaluate((node: HTMLInputElement) => node.validity.typeMismatch), true);
        await form.locator("input[name='email']").fill("qa@example.invalid");
        const values = await form.evaluate((node: HTMLFormElement) => Object.fromEntries(new FormData(node)));

        await submit.click();
        await page.waitForFunction(() => document.querySelector<HTMLButtonElement>("form button[type='submit']")?.disabled);
        assert.equal(payloads.length, 1);
        assert.match(await submit.textContent() ?? "", /Sending/);
        await form.locator("input[name='email']").focus();
        await page.keyboard.press("Enter");
        assert.equal(payloads.length, 1, "pending form does not submit again on Enter");
        assert.ok(releasePending);
        await releasePending();
        await page.getByText("QA handled failure. Please try again.").waitFor();
        assert.equal(await submit.isEnabled(), true);
        assert.deepEqual(await form.evaluate((node: HTMLFormElement) => Object.fromEntries(new FormData(node))), values);

        outcome = "network";
        await submit.click();
        await page.getByText("Could not connect. Please try again.").waitFor();
        assert.deepEqual(await form.evaluate((node: HTMLFormElement) => Object.fromEntries(new FormData(node))), values);

        outcome = "success";
        await submit.click();
        await page.getByRole("status").waitFor();
        assert.equal(payloads.length, 3);
        assert.deepEqual(payloads[0], payloads[1]);
        assert.deepEqual(payloads[1], payloads[2]);
        await page.getByRole("button", { name: "Send another message" }).click();
        assert.equal(await form.locator("input[name='name']").inputValue(), "");
        assert.equal(await form.locator("input[name='email']").inputValue(), "");
        assert.equal(await form.locator("textarea[name='message']").inputValue(), "");
        assert.equal(errors.length, 0, `${pathname} at ${width}px: ${errors.join("\n")}`);
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
});
