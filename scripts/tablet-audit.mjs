import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const baseUrl = process.env.TABLET_AUDIT_URL ?? "http://localhost:3000";
const outputDirectory = path.join(process.cwd(), ".next", "tablet-audit");
const fallbackRoutes = [
  "/",
  "/about",
  "/blog",
  "/contact",
  "/des-moines-web-design",
  "/privacy",
  "/resources/how-much-does-a-small-business-website-cost",
  "/services",
  "/small-business-web-design",
  "/website-audit",
  "/website-redesign",
  "/work",
  "/work/iron-palace",
];
const viewports = [
  { name: "phone-reference", width: 500, height: 900 },
  { name: "tablet-compact", width: 680, height: 1000 },
  { name: "ipad-portrait", width: 768, height: 1024 },
  { name: "ipad-air-portrait", width: 820, height: 1180 },
  { name: "ipad-landscape", width: 1024, height: 768 },
];

const routesFromEnvironment = process.env.TABLET_AUDIT_ROUTES
  ?.split(",")
  .map((route) => route.trim())
  .filter(Boolean);

const resolveRoutes = async () => {
  if (routesFromEnvironment?.length) {
    return routesFromEnvironment;
  }

  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);

    const sitemap = await response.text();
    const publicRoutes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)]
      .map(([, location]) => new URL(location).pathname)
      .filter(
        (route) =>
          !route.endsWith(".svg") &&
          !route.endsWith(".xml") &&
          !route.endsWith(".txt") &&
          !route.includes("opengraph-image") &&
          !route.includes("twitter-image"),
      );

    return [...new Set(publicRoutes)].sort();
  } catch (error) {
    console.warn(
      `Could not read the sitemap; auditing representative route families instead. ${error}`,
    );
    return fallbackRoutes;
  }
};

const routes = await resolveRoutes();

await mkdir(outputDirectory, { recursive: true });

const browser = await chromium.launch({
  executablePath: chromium.executablePath(),
  headless: true,
});
const results = [];

console.log(
  `Auditing ${routes.length} public routes at ${viewports.length} phone/tablet viewports.`,
);

try {
  for (const viewport of viewports) {
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: 1,
      hasTouch: true,
      isMobile: false,
    });

    for (const route of routes) {
      const page = await context.newPage();
      const response = await page.goto(`${baseUrl}${route}`, {
        waitUntil: "domcontentloaded",
        timeout: 30_000,
      });
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(700);

      const metrics = await page.evaluate(() => {
        const root = document.documentElement;
        const viewportWidth = root.clientWidth;
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return (
            style.display !== "none" &&
            style.visibility !== "hidden" &&
            Number(style.opacity) > 0 &&
            rect.width > 0 &&
            rect.height > 0
          );
        };
        const label = (element) =>
          (
            element.getAttribute("aria-label") ||
            element.textContent ||
            element.tagName
          )
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 80);
        const interactive = [
          ...document.querySelectorAll(
            'a[href], button, input:not([type="hidden"]), select, textarea, summary',
          ),
        ].filter(visible);
        const undersizedTargets = interactive
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label: label(element),
              tag: element.tagName.toLowerCase(),
              width: Math.round(rect.width),
              height: Math.round(rect.height),
            };
          })
          .filter(({ width, height }) => width < 44 || height < 44);
        const clippedContent = [...document.querySelectorAll("main *")]
          .filter(visible)
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              label: label(element),
              tag: element.tagName.toLowerCase(),
              left: Math.round(rect.left),
              right: Math.round(rect.right),
              width: Math.round(rect.width),
            };
          })
          .filter(
            ({ left, right, width }) =>
              width > 24 && (left < -8 || right > viewportWidth + 8),
          )
          .slice(0, 20);

        return {
          title: document.title,
          documentWidth: Math.max(root.scrollWidth, document.body.scrollWidth),
          viewportWidth,
          horizontalOverflow: Math.max(
            0,
            Math.max(root.scrollWidth, document.body.scrollWidth) - viewportWidth,
          ),
          undersizedTargets,
          clippedContent,
        };
      });

      const slug = route === "/" ? "home" : route.slice(1).replaceAll("/", "--");
      await page.screenshot({
        path: path.join(
          outputDirectory,
          `${viewport.name}--${slug}--above-fold.png`,
        ),
      });
      await page.screenshot({
        path: path.join(outputDirectory, `${viewport.name}--${slug}.png`),
        fullPage: true,
      });
      results.push({
        route,
        viewport: viewport.name,
        status: response?.status() ?? null,
        ...metrics,
      });
      await page.close();
    }

    await context.close();
  }
} finally {
  await browser.close();
}

await writeFile(
  path.join(outputDirectory, "results.json"),
  `${JSON.stringify(results, null, 2)}\n`,
  "utf8",
);

for (const result of results) {
  console.log(
    [
      result.viewport.padEnd(15),
      result.route.padEnd(62),
      `status=${result.status}`,
      `overflow=${result.horizontalOverflow}`,
      `smallTargets=${result.undersizedTargets.length}`,
      `clipped=${result.clippedContent.length}`,
    ].join(" "),
  );
}
