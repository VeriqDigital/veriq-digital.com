import { access } from "node:fs/promises";
import { setMaxListeners } from "node:events";
import path from "node:path";
import chromium from "@sparticuz/chromium";
import { load } from "cheerio";
import { chromium as playwrightChromium } from "playwright-core";
import type { Browser, Route } from "playwright-core";
import type { PrimaryCrawlData } from "../crawler";
import { safeHttpRequest } from "../http";
import type { RenderedMobileData, RenderedMobileMetrics } from "../model";

const viewport = Object.freeze({ width: 390, height: 844 });
const defaultTimeoutMs = 12_000;
const maximumStylesheets = 16;
const maximumImages = 6;
const stylesheetLimitBytes = 768 * 1024;
const imageLimitBytes = 512 * 1024;
const totalResourceLimitBytes = 4 * 1024 * 1024;
const renderedUserAgent =
  "VeriqRenderedMobileAudit/1.0 (+https://www.veriqdigital.com/website-audit)";

let browserPromise: Promise<Browser> | null = null;
let renderInProgress = false;

const sanitizeHtml = (html: string, finalUrl: string) => {
  const $ = load(html);

  $("script, iframe, frame, object, embed, portal").remove();
  $("base").remove();
  $('meta[http-equiv="refresh" i]').remove();
  $('link:not([rel~="stylesheet" i])').remove();
  $("*").each((_, element) => {
    const attributes = "attribs" in element ? element.attribs : {};

    for (const attribute of Object.keys(attributes)) {
      if (/^on/i.test(attribute) || attribute.toLowerCase() === "srcdoc") {
        $(element).removeAttr(attribute);
      }
    }
  });

  const head = $("head").first();
  const securityMarkup = [
    `<base href="${finalUrl.replaceAll('"', "&quot;")}">`,
    '<meta http-equiv="Content-Security-Policy" content="default-src \'none\'; script-src \'none\'; frame-src \'none\'; connect-src \'none\'; object-src \'none\'; style-src \'unsafe-inline\' http: https:; img-src data: http: https:">',
  ].join("");

  if (head.length > 0) {
    head.prepend(securityMarkup);
  } else {
    $("html").prepend(`<head>${securityMarkup}</head>`);
  }

  return $.html();
};

const firstExistingPath = async (candidates: readonly string[]) => {
  for (const candidate of candidates) {
    try {
      await access(candidate);
      return candidate;
    } catch {
      // Try the next known local browser path.
    }
  }

  return null;
};

const getExecutablePath = async () => {
  const configuredPath = process.env.WEBSITE_AUDIT_CHROME_PATH?.trim();

  if (configuredPath) {
    await access(configuredPath);
    return configuredPath;
  }

  if (process.platform === "win32") {
    const candidates = [
      process.env.ProgramFiles,
      process.env["ProgramFiles(x86)"],
      process.env.LOCALAPPDATA,
    ].flatMap((root) =>
      root
        ? [
            path.join(root, "Google", "Chrome", "Application", "chrome.exe"),
            path.join(root, "Microsoft", "Edge", "Application", "msedge.exe"),
          ]
        : [],
    );
    const localPath = await firstExistingPath(candidates);

    if (localPath) return localPath;
  }

  if (process.platform === "darwin") {
    const localPath = await firstExistingPath([
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    ]);

    if (localPath) return localPath;
  }

  return chromium.executablePath();
};

const launchBrowser = async () => {
  chromium.setGraphicsMode = false;

  return playwrightChromium.launch({
    args: chromium.args,
    executablePath: await getExecutablePath(),
    headless: true,
  });
};

const getBrowser = async () => {
  if (!browserPromise) {
    browserPromise = launchBrowser().catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  const browser = await browserPromise;

  if (!browser.isConnected()) {
    browserPromise = null;
    return getBrowser();
  }

  return browser;
};

const waitForBrowser = async (signal: AbortSignal) => {
  if (signal.aborted) {
    throw signal.reason instanceof Error
      ? signal.reason
      : new DOMException("The rendered check timed out.", "TimeoutError");
  }

  let rejectForAbort: ((reason?: unknown) => void) | undefined;
  const aborted = new Promise<never>((_resolve, reject) => {
    rejectForAbort = reject;
  });
  const onAbort = () => rejectForAbort?.(
    signal.reason instanceof Error
      ? signal.reason
      : new DOMException("The rendered check timed out.", "TimeoutError"),
  );

  signal.addEventListener("abort", onAbort, { once: true });

  try {
    return await Promise.race([getBrowser(), aborted]);
  } finally {
    signal.removeEventListener("abort", onAbort);
  }
};

const fulfillSafeResource = async (
  route: Route,
  finalOrigin: string,
  signal: AbortSignal,
  counters: { stylesheets: number; images: number; fulfilledBytes: number },
) => {
  const request = route.request();
  const resourceType = request.resourceType();
  const resourceLimit =
    resourceType === "stylesheet"
      ? maximumStylesheets
      : resourceType === "image"
        ? maximumImages
        : 0;
  const counterKey = resourceType === "stylesheet" ? "stylesheets" : "images";

  if (
    request.method() !== "GET" ||
    resourceLimit === 0 ||
    counters[counterKey] >= resourceLimit
  ) {
    await route.abort("blockedbyclient");
    return;
  }

  let resourceUrl: URL;

  try {
    resourceUrl = new URL(request.url());
  } catch {
    await route.abort("blockedbyclient");
    return;
  }

  if (resourceUrl.origin !== finalOrigin) {
    await route.abort("blockedbyclient");
    return;
  }

  counters[counterKey] += 1;

  try {
    const response = await safeHttpRequest(resourceUrl, {
      allowedRedirectOrigin: finalOrigin,
      headers: {
        Accept:
          resourceType === "stylesheet"
            ? "text/css,*/*;q=0.1"
            : "image/avif,image/webp,image/png,image/jpeg,image/gif,image/svg+xml,*/*;q=0.1",
        "User-Agent": renderedUserAgent,
      },
      maxBytes:
        resourceType === "stylesheet"
          ? stylesheetLimitBytes
          : imageLimitBytes,
      maxRedirects: 2,
      signal,
      timeoutMs: 3_000,
    });
    const contentType = response.headers["content-type"]?.toLowerCase() ?? "";
    const expectedContentType =
      resourceType === "stylesheet"
        ? /^(?:text\/css)(?:;|$)/
        : /^(?:image\/)(?:[^;]+)(?:;|$)/;

    if (
      response.status < 200 ||
      response.status >= 300 ||
      !expectedContentType.test(contentType) ||
      counters.fulfilledBytes + response.body.byteLength >
        totalResourceLimitBytes
    ) {
      await route.abort("blockedbyclient");
      return;
    }

    counters.fulfilledBytes += response.body.byteLength;
    await route.fulfill({
      status: response.status,
      headers: { "Content-Type": contentType },
      body: response.body,
    });
  } catch {
    await route.abort("failed");
  }
};

export function normalizeRenderedMobileMetrics(
  metrics: RenderedMobileMetrics,
): RenderedMobileMetrics {
  const boundedInteger = (value: number, maximum = 1_000_000) =>
    Number.isFinite(value)
      ? Math.min(maximum, Math.max(0, Math.round(value)))
      : 0;

  return {
    viewportWidth: boundedInteger(metrics.viewportWidth, 10_000),
    documentWidth: boundedInteger(metrics.documentWidth),
    horizontalOverflowPixels: boundedInteger(metrics.horizontalOverflowPixels),
    horizontalScrollPixels: boundedInteger(metrics.horizontalScrollPixels),
    wideElementCount: boundedInteger(metrics.wideElementCount, 10_000),
    fixedWidthElementCount: boundedInteger(metrics.fixedWidthElementCount, 10_000),
    overflowingImageCount: boundedInteger(metrics.overflowingImageCount, 10_000),
    clippedImportantElementCount: boundedInteger(
      metrics.clippedImportantElementCount,
      10_000,
    ),
    clippedNavigation: Boolean(metrics.clippedNavigation),
    offscreenPrimaryActionCount: boundedInteger(
      metrics.offscreenPrimaryActionCount,
      10_000,
    ),
    seriousTapTargetCount: boundedInteger(metrics.seriousTapTargetCount, 10_000),
    interactiveControlCount: boundedInteger(metrics.interactiveControlCount, 10_000),
    tinyTextCount: boundedInteger(metrics.tinyTextCount, 10_000),
    textSampleCount: boundedInteger(metrics.textSampleCount, 10_000),
  };
}

const measurePage = async (
  primary: PrimaryCrawlData,
  signal: AbortSignal,
): Promise<RenderedMobileMetrics> => {
  const browser = await waitForBrowser(signal);
  const context = await browser.newContext({
    viewport,
    deviceScaleFactor: 1,
    hasTouch: true,
    isMobile: true,
    javaScriptEnabled: true,
    userAgent: renderedUserAgent,
  });
  const page = await context.newPage();
  const sanitizedHtml = sanitizeHtml(primary.html, primary.finalUrl);
  const finalUrl = new URL(primary.finalUrl);
  const counters = { stylesheets: 0, images: 0, fulfilledBytes: 0 };
  let documentFulfilled = false;
  const closeOnAbort = () => {
    void context.close().catch(() => undefined);
  };

  try {
    if (signal.aborted) {
      throw signal.reason instanceof Error
        ? signal.reason
        : new DOMException("The rendered check timed out.", "TimeoutError");
    }

    signal.addEventListener("abort", closeOnAbort, { once: true });
    await page.addInitScript("globalThis.__name = (target) => target;");
    await page.route("**/*", async (route) => {
      const request = route.request();

      if (
        !documentFulfilled &&
        request.isNavigationRequest() &&
        request.resourceType() === "document" &&
        request.url() === primary.finalUrl
      ) {
        documentFulfilled = true;
        await route.fulfill({
          status: 200,
          contentType: "text/html; charset=utf-8",
          body: sanitizedHtml,
        });
        return;
      }

      await fulfillSafeResource(route, finalUrl.origin, signal, counters);
    });
    await page.goto(primary.finalUrl, {
      waitUntil: "load",
      timeout: 10_000,
    });
    await page.waitForTimeout(200);

    const metrics = await page.evaluate(() => {
      const viewportWidth = window.screen.width || 390;
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );
      const startingScrollX = window.scrollX;
      window.scrollTo({ left: documentWidth, top: window.scrollY });
      const horizontalScrollPixels = Math.max(0, Math.round(window.scrollX));
      window.scrollTo({ left: startingScrollX, top: window.scrollY });
      const elements = [...document.body.querySelectorAll<HTMLElement>("*")];
      const actionPattern =
        /\b(call|contact|book|schedule|quote|estimate|get started|request|buy|shop|reserve|apply|sign up)\b/i;
      const isVisible = (element: HTMLElement) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();

        return (
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          Number.parseFloat(style.opacity || "1") > 0.01 &&
          rect.width > 1 &&
          rect.height > 1 &&
          element.getAttribute("aria-hidden") !== "true"
        );
      };
      const isInsideHorizontalScroller = (element: HTMLElement) => {
        let ancestor = element.parentElement;

        while (ancestor && ancestor !== document.body) {
          const style = getComputedStyle(ancestor);

          if (
            ["auto", "scroll"].includes(style.overflowX) &&
            ancestor.scrollWidth > ancestor.clientWidth + 8
          ) {
            return true;
          }

          ancestor = ancestor.parentElement;
        }

        return false;
      };
      const isInsideHorizontalClip = (element: HTMLElement) => {
        let ancestor = element.parentElement;

        while (ancestor && ancestor !== document.body) {
          const style = getComputedStyle(ancestor);
          const rect = ancestor.getBoundingClientRect();

          if (
            ["hidden", "clip"].includes(style.overflowX) &&
            rect.left >= -8 &&
            rect.right <= viewportWidth + 8
          ) {
            return true;
          }

          ancestor = ancestor.parentElement;
        }

        return false;
      };
      const visibleElements = elements.filter(isVisible);
      const materiallyOutside = (element: HTMLElement) => {
        const rect = element.getBoundingClientRect();
        const visibleWidth = Math.max(
          0,
          Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0),
        );

        return (
          !isInsideHorizontalScroller(element) &&
          (rect.left < -24 ||
            rect.right > viewportWidth + 24 ||
            visibleWidth / Math.max(1, rect.width) < 0.7)
        );
      };
      const wideElements = visibleElements.filter((element) => {
        const rect = element.getBoundingClientRect();
        return (
          !isInsideHorizontalScroller(element) &&
          !isInsideHorizontalClip(element) &&
          rect.width > viewportWidth + 24
        );
      });
      const fixedWidthElements = wideElements.filter((element) => {
        const declaredWidth =
          element.style.width || element.getAttribute("width") || "";
        return /^\d+(?:\.\d+)?px?$/.test(declaredWidth.trim());
      });
      const overflowingImages = visibleElements.filter(
        (element) =>
          element instanceof HTMLImageElement &&
          !isInsideHorizontalClip(element) &&
          materiallyOutside(element),
      );
      const interactive = visibleElements.filter((element) =>
        element.matches(
          'a[href], button, input:not([type="hidden"]), select, textarea, [role="button"], [role="link"]',
        ),
      );
      const primaryActions = interactive.filter((element) =>
        actionPattern.test(
          `${element.textContent ?? ""} ${element.getAttribute("aria-label") ?? ""} ${element.getAttribute("href") ?? ""}`,
        ),
      );
      const navigationElements = visibleElements.filter((element) =>
        element.matches("nav, [role=navigation]"),
      );
      const importantElements = visibleElements.filter(
        (element) =>
          element.matches("main, h1, nav, [role=navigation]") ||
          primaryActions.includes(element),
      );
      const seriousTapTargets = interactive.filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width < 20 && rect.height < 20;
      });
      const textElements = visibleElements
        .filter((element) => {
          const ownText = [...element.childNodes].some(
            (node) =>
              node.nodeType === Node.TEXT_NODE &&
              Boolean(node.textContent?.trim()),
          );
          return ownText;
        })
        .slice(0, 1_000);
      const tinyText = textElements.filter(
        (element) => Number.parseFloat(getComputedStyle(element).fontSize) < 12,
      );

      return {
        viewportWidth,
        documentWidth,
        horizontalOverflowPixels: Math.max(0, documentWidth - viewportWidth),
        horizontalScrollPixels,
        wideElementCount: wideElements.length,
        fixedWidthElementCount: fixedWidthElements.length,
        overflowingImageCount: overflowingImages.length,
        clippedImportantElementCount: importantElements.filter(materiallyOutside).length,
        clippedNavigation:
          navigationElements.some(materiallyOutside) ||
          navigationElements.some((navigation) =>
            interactive.some(
              (element) => navigation.contains(element) && materiallyOutside(element),
            ),
          ),
        offscreenPrimaryActionCount: primaryActions.filter(materiallyOutside).length,
        seriousTapTargetCount: seriousTapTargets.length,
        interactiveControlCount: interactive.length,
        tinyTextCount: tinyText.length,
        textSampleCount: textElements.length,
      };
    });

    return normalizeRenderedMobileMetrics(metrics);
  } finally {
    signal.removeEventListener("abort", closeOnAbort);
    await context.close().catch(() => undefined);
  }
};

export async function runRenderedMobileAudit(
  primary: PrimaryCrawlData,
  options: Readonly<{ signal?: AbortSignal; timeoutMs?: number }> = {},
): Promise<RenderedMobileData> {
  if (renderInProgress) {
    return { available: false, reason: "busy" };
  }

  renderInProgress = true;
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? defaultTimeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;
  setMaxListeners(maximumStylesheets + maximumImages + 10, signal);

  try {
    return { available: true, metrics: await measurePage(primary, signal) };
  } catch (error) {
    const reason =
      signal.aborted ||
      (error instanceof Error && /timeout/i.test(`${error.name} ${error.message}`))
        ? "timeout"
        : error instanceof Error &&
            /executable|browserType\.launch|ENOENT|no such file/i.test(
              error.message,
            )
          ? "browser_unavailable"
          : "render_error";

    console.warn("Website audit rendered-mobile provider unavailable", {
      reason,
      errorName: error instanceof Error ? error.name : "UnknownError",
    });
    return { available: false, reason };
  } finally {
    renderInProgress = false;
  }
}

export async function closeRenderedMobileBrowserForTesting(): Promise<void> {
  const pendingBrowser = browserPromise;
  browserPromise = null;

  if (pendingBrowser) {
    await pendingBrowser.then((browser) => browser.close()).catch(() => undefined);
  }
}
