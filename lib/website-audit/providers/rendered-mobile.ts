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

export type RenderedControlMeasurement = Readonly<{
  elementKind: "anchor" | "button" | "input" | "select" | "textarea" | "other";
  href: string | null;
  role: string | null;
  tabIndex: number;
  disabled: boolean;
  hiddenInput: boolean;
  blocked: boolean;
  width: number;
  height: number;
  hasAdequateLabelTarget: boolean;
  primaryAction: boolean;
  materiallyOutside: boolean;
  potentiallyOutside: boolean;
  intentionallyOffCanvas: boolean;
  insideNavigation: boolean;
  importantElement: boolean;
}>;

export type RenderedMobileMeasurement = Readonly<{
  viewportWidth: number;
  documentWidth: number;
  horizontalOverflowPixels: number;
  horizontalScrollPixels: number;
  wideElementCount: number;
  fixedWidthElementCount: number;
  overflowingImageCount: number;
  intentionallyClippedImageCount: number;
  potentialOverflowElementCount: number;
  clippedBaseImportantElementCount: number;
  potentiallyClippedImportantElementCount: number;
  navigationMateriallyOutside: boolean;
  missingDimensionImageCount: number;
  unreservedImageCount: number;
  controls: readonly RenderedControlMeasurement[];
  tinyTextCount: number;
  textSampleCount: number;
}>;

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

const launchBrowser = async (browserExecutablePathForTesting?: string) => {
  chromium.setGraphicsMode = false;

  return playwrightChromium.launch({
    args: browserExecutablePathForTesting ? [] : chromium.args,
    executablePath:
      browserExecutablePathForTesting ?? (await getExecutablePath()),
    headless: true,
    timeout: defaultTimeoutMs,
  });
};

const discardPendingBrowser = () => {
  const pendingBrowser = browserPromise;
  browserPromise = null;

  if (pendingBrowser) {
    void pendingBrowser
      .then((browser) => browser.close())
      .catch(() => undefined);
  }
};

const getBrowser = async (browserExecutablePathForTesting?: string) => {
  if (!browserPromise) {
    browserPromise = launchBrowser(browserExecutablePathForTesting).catch((error) => {
      browserPromise = null;
      throw error;
    });
  }

  const browser = await browserPromise;

  if (!browser.isConnected()) {
    browserPromise = null;
    return getBrowser(browserExecutablePathForTesting);
  }

  return browser;
};

const waitForBrowser = async (
  signal: AbortSignal,
  browserExecutablePathForTesting?: string,
) => {
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
    return await Promise.race([
      getBrowser(browserExecutablePathForTesting),
      aborted,
    ]);
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
    intentionallyClippedImageCount: boundedInteger(
      metrics.intentionallyClippedImageCount,
      10_000,
    ),
    potentialOverflowElementCount: boundedInteger(
      metrics.potentialOverflowElementCount,
      10_000,
    ),
    clippedImportantElementCount: boundedInteger(
      metrics.clippedImportantElementCount,
      10_000,
    ),
    potentiallyClippedImportantElementCount: boundedInteger(
      metrics.potentiallyClippedImportantElementCount,
      10_000,
    ),
    clippedNavigation: Boolean(metrics.clippedNavigation),
    offscreenPrimaryActionCount: boundedInteger(
      metrics.offscreenPrimaryActionCount,
      10_000,
    ),
    missingDimensionImageCount: boundedInteger(
      metrics.missingDimensionImageCount,
      10_000,
    ),
    unreservedImageCount: boundedInteger(metrics.unreservedImageCount, 10_000),
    seriousTapTargetCount: boundedInteger(metrics.seriousTapTargetCount, 10_000),
    interactiveControlCount: boundedInteger(metrics.interactiveControlCount, 10_000),
    tinyTextCount: boundedInteger(metrics.tinyTextCount, 10_000),
    textSampleCount: boundedInteger(metrics.textSampleCount, 10_000),
  };
}

export function interpretRenderedMobileMeasurement(
  measurement: RenderedMobileMeasurement,
): RenderedMobileMetrics {
  const interactiveControls = measurement.controls.filter((control) => {
    if (control.blocked) return false;

    if (control.elementKind === "anchor") {
      const href = control.href?.trim();
      return Boolean(href && !href.toLowerCase().startsWith("javascript:"));
    }

    if (
      ["button", "input", "select", "textarea"].includes(control.elementKind)
    ) {
      return !control.disabled && !control.hiddenInput;
    }

    return (
      ["button", "link"].includes(control.role ?? "") && control.tabIndex >= 0
    );
  });
  const offscreenPrimaryActions = interactiveControls.filter(
    (control) => control.primaryAction && control.materiallyOutside,
  );
  const seriousTapTargets = interactiveControls.filter(
    (control) =>
      !control.hasAdequateLabelTarget &&
      control.width < 20 &&
      control.height < 20,
  );

  return normalizeRenderedMobileMetrics({
    viewportWidth: measurement.viewportWidth,
    documentWidth: measurement.documentWidth,
    horizontalOverflowPixels: measurement.horizontalOverflowPixels,
    horizontalScrollPixels: measurement.horizontalScrollPixels,
    wideElementCount: measurement.wideElementCount,
    fixedWidthElementCount: measurement.fixedWidthElementCount,
    overflowingImageCount: measurement.overflowingImageCount,
    intentionallyClippedImageCount: measurement.intentionallyClippedImageCount,
    potentialOverflowElementCount: measurement.potentialOverflowElementCount,
    clippedImportantElementCount:
      measurement.clippedBaseImportantElementCount +
      offscreenPrimaryActions.filter((control) => !control.importantElement).length,
    potentiallyClippedImportantElementCount:
      measurement.potentiallyClippedImportantElementCount +
      interactiveControls.filter(
        (control) =>
          control.potentiallyOutside &&
          !control.materiallyOutside &&
          !control.intentionallyOffCanvas &&
          !control.importantElement,
      ).length,
    clippedNavigation:
      measurement.navigationMateriallyOutside ||
      interactiveControls.some(
        (control) => control.insideNavigation && control.materiallyOutside,
      ),
    offscreenPrimaryActionCount: offscreenPrimaryActions.length,
    missingDimensionImageCount: measurement.missingDimensionImageCount,
    unreservedImageCount: measurement.unreservedImageCount,
    seriousTapTargetCount: seriousTapTargets.length,
    interactiveControlCount: interactiveControls.length,
    tinyTextCount: measurement.tinyTextCount,
    textSampleCount: measurement.textSampleCount,
  });
}

const measurePage = async (
  primary: PrimaryCrawlData,
  signal: AbortSignal,
  browserExecutablePathForTesting?: string,
): Promise<RenderedMobileMetrics> => {
  const browser = await waitForBrowser(
    signal,
    browserExecutablePathForTesting,
  );
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

    const measurement = await page.evaluate(() => {
      const viewportWidth = Math.round(
        Math.min(
          ...[
            window.visualViewport?.width,
            window.screen.width,
            window.innerWidth,
            document.documentElement.clientWidth,
          ].filter(
            (value): value is number =>
              typeof value === "number" && Number.isFinite(value) && value > 0,
          ),
        ),
      );
      const documentWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body?.scrollWidth ?? 0,
      );
      const startingScrollX = window.scrollX;
      const originalRootScrollBehavior = document.documentElement.style.scrollBehavior;
      const originalBodyScrollBehavior = document.body.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      window.scrollTo({ left: documentWidth, top: window.scrollY });
      const horizontalScrollPixels = Math.max(0, Math.round(window.scrollX));
      window.scrollTo({ left: startingScrollX, top: window.scrollY });
      document.documentElement.style.scrollBehavior = originalRootScrollBehavior;
      document.body.style.scrollBehavior = originalBodyScrollBehavior;
      const hasReachableHorizontalOverflow = horizontalScrollPixels > 8;
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
      const horizontalAncestorCache = new WeakMap<
        HTMLElement,
        readonly HTMLElement[]
      >();
      const getHorizontalAncestors = (element: HTMLElement) => {
        const cached = horizontalAncestorCache.get(element);
        if (cached) return cached;

        const ancestors: HTMLElement[] = [];
        let ancestor = element.parentElement;

        while (ancestor && ancestor !== document.body) {
          ancestors.push(ancestor);
          ancestor = ancestor.parentElement;
        }

        horizontalAncestorCache.set(element, ancestors);
        return ancestors;
      };
      const isInsideHorizontalScroller = (element: HTMLElement) => {
        return getHorizontalAncestors(element).some((ancestor) => {
          const style = getComputedStyle(ancestor);
          return (
            ["auto", "scroll"].includes(style.overflowX) &&
            ancestor.scrollWidth > ancestor.clientWidth + 8
          );
        });
      };
      const isInsideHorizontalClip = (element: HTMLElement) => {
        return getHorizontalAncestors(element).some((ancestor) => {
          const style = getComputedStyle(ancestor);
          const rect = ancestor.getBoundingClientRect();
          return (
            ["hidden", "clip"].includes(style.overflowX) &&
            rect.left >= -8 &&
            rect.right <= viewportWidth + 8
          );
        });
      };
      const visibleElements = elements.filter(isVisible);
      type HorizontalGeometry = Readonly<{
        rect: DOMRect;
        visibleRatio: number;
        outside: boolean;
        insideScroller: boolean;
        insideClip: boolean;
        transformedOrAnimated: boolean;
        intentionallyOffCanvas: boolean;
      }>;
      const horizontalGeometryCache = new WeakMap<
        HTMLElement,
        HorizontalGeometry
      >();
      const horizontalGeometry = (element: HTMLElement): HorizontalGeometry => {
        const cached = horizontalGeometryCache.get(element);
        if (cached) return cached;

        const rect = element.getBoundingClientRect();
        const visibleWidth = Math.max(
          0,
          Math.min(rect.right, viewportWidth) - Math.max(rect.left, 0),
        );
        const visibleRatio = visibleWidth / Math.max(1, rect.width);
        const outside =
          rect.left < -24 ||
          rect.right > viewportWidth + 24 ||
          visibleRatio < 0.7;
        const ancestors = getHorizontalAncestors(element);
        const motionStyles = [element, ...ancestors].map((candidate) =>
          getComputedStyle(candidate),
        );
        const transformedOrAnimated = motionStyles.some(
          (style) =>
            style.transform !== "none" ||
            style.animationName !== "none" ||
            style.transitionDuration
              .split(",")
              .some((duration) => Number.parseFloat(duration) > 0),
        );
        const semanticOffCanvasContainer = element.closest(
          '[aria-modal="true"], dialog, nav, [role="navigation"], [data-state="closed"], [class*="drawer" i], [class*="offcanvas" i], [class*="carousel" i], [class*="slider" i]',
        );
        const intentionallyOffCanvas =
          outside &&
          !hasReachableHorizontalOverflow &&
          Boolean(semanticOffCanvasContainer) &&
          (transformedOrAnimated || visibleRatio === 0);

        const geometry = {
          rect,
          visibleRatio,
          outside,
          insideScroller: isInsideHorizontalScroller(element),
          insideClip: isInsideHorizontalClip(element),
          transformedOrAnimated,
          intentionallyOffCanvas,
        };
        horizontalGeometryCache.set(element, geometry);
        return geometry;
      };
      const wideElements = visibleElements.filter((element) => {
        const geometry = horizontalGeometry(element);
        return (
          documentWidth > viewportWidth + 8 &&
          geometry.outside &&
          !geometry.insideScroller &&
          !geometry.insideClip &&
          !geometry.transformedOrAnimated &&
          !geometry.intentionallyOffCanvas &&
          geometry.rect.width > viewportWidth + 24
        );
      });
      const wideElementSet = new Set(wideElements);
      const potentialOverflowElements = visibleElements.filter((element) => {
        const geometry = horizontalGeometry(element);
        return (
          geometry.outside &&
          !geometry.insideScroller &&
          !wideElementSet.has(element)
        );
      });
      const fixedWidthElements = wideElements.filter((element) => {
        const declaredWidth =
          element.style.width || element.getAttribute("width") || "";
        return /^\d+(?:\.\d+)?px?$/.test(declaredWidth.trim());
      });
      const overflowingImages = visibleElements.filter(
        (element) => {
          if (!(element instanceof HTMLImageElement)) return false;
          const geometry = horizontalGeometry(element);
          return (
            documentWidth > viewportWidth + 8 &&
            geometry.outside &&
            !geometry.insideScroller &&
            !geometry.insideClip &&
            !geometry.transformedOrAnimated &&
            !geometry.intentionallyOffCanvas
          );
        },
      );
      const overflowingImageSet = new Set(overflowingImages);
      const intentionallyClippedImages = visibleElements.filter((element) => {
        if (!(element instanceof HTMLImageElement)) return false;
        const geometry = horizontalGeometry(element);
        const objectFit = getComputedStyle(element).objectFit;
        return (
          geometry.outside &&
          !overflowingImageSet.has(element) &&
          (geometry.insideClip ||
            geometry.insideScroller ||
            geometry.transformedOrAnimated ||
            geometry.intentionallyOffCanvas ||
            ["cover", "contain"].includes(objectFit))
        );
      });
      const navigationElements = visibleElements.filter((element) =>
        element.matches("nav, [role=navigation]"),
      );
      const baseImportantElements = visibleElements.filter((element) =>
        element.matches("h1, nav, [role=navigation]"),
      );
      const isConfirmedInaccessible = (element: HTMLElement) => {
        const geometry = horizontalGeometry(element);
        return (
          geometry.outside &&
          !hasReachableHorizontalOverflow &&
          !geometry.insideScroller &&
          !geometry.transformedOrAnimated &&
          !geometry.intentionallyOffCanvas &&
          geometry.visibleRatio < 0.7
        );
      };
      const controlElements = visibleElements.filter((element) =>
        element.matches(
          "a, button, input, select, textarea, [role=button], [role=link]",
        ),
      );
      const controls = controlElements.map((element) => {
        const rect = element.getBoundingClientRect();
        const geometry = horizontalGeometry(element);
        const associatedLabels =
          element instanceof HTMLInputElement ? [...(element.labels ?? [])] : [];
        const hasAdequateLabelTarget = associatedLabels.some((label) => {
          const labelRect = label.getBoundingClientRect();
          return labelRect.width >= 20 || labelRect.height >= 20;
        });
        const elementKind = element instanceof HTMLAnchorElement
          ? "anchor"
          : element instanceof HTMLButtonElement
            ? "button"
            : element instanceof HTMLInputElement
              ? "input"
              : element instanceof HTMLSelectElement
                ? "select"
                : element instanceof HTMLTextAreaElement
                  ? "textarea"
                  : "other";

        return {
          elementKind,
          href: element.getAttribute("href"),
          role: element.getAttribute("role"),
          tabIndex: element.tabIndex,
          disabled:
            (element instanceof HTMLButtonElement ||
              element instanceof HTMLInputElement ||
              element instanceof HTMLSelectElement ||
              element instanceof HTMLTextAreaElement) &&
            element.disabled,
          hiddenInput:
            element instanceof HTMLInputElement && element.type === "hidden",
          blocked: Boolean(
            element.closest('[aria-hidden="true"], [inert]') ||
              element.getAttribute("aria-disabled") === "true" ||
              getComputedStyle(element).pointerEvents === "none",
          ),
          width: rect.width,
          height: rect.height,
          hasAdequateLabelTarget,
          primaryAction: actionPattern.test(
            `${element.textContent ?? ""} ${element.getAttribute("aria-label") ?? ""} ${element.getAttribute("href") ?? ""}`,
          ),
          materiallyOutside: isConfirmedInaccessible(element),
          potentiallyOutside: geometry.outside,
          intentionallyOffCanvas: geometry.intentionallyOffCanvas,
          insideNavigation: Boolean(element.closest("nav, [role=navigation]")),
          importantElement: element.matches(
            "main, h1, nav, [role=navigation]",
          ),
        };
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
      const visibleImages = visibleElements.filter(
        (element): element is HTMLImageElement =>
          element instanceof HTMLImageElement,
      );
      const imagesMissingDimensions = visibleImages.filter(
        (image) => !image.hasAttribute("width") || !image.hasAttribute("height"),
      );
      const unreservedImages = imagesMissingDimensions.filter((image) => {
        const style = getComputedStyle(image);
        const parentStyle = image.parentElement
          ? getComputedStyle(image.parentElement)
          : null;
        const ownInlineDimensions =
          Boolean(image.style.width && image.style.width !== "auto") &&
          Boolean(image.style.height && image.style.height !== "auto");
        const parentReservesRatio =
          parentStyle?.aspectRatio !== undefined &&
          parentStyle.aspectRatio !== "auto" &&
          ["hidden", "clip"].includes(parentStyle.overflow);

        return !(
          style.aspectRatio !== "auto" ||
          ownInlineDimensions ||
          parentReservesRatio
        );
      });
      const confirmedImportantElements = baseImportantElements.filter(
        isConfirmedInaccessible,
      );
      const confirmedImportantElementSet = new Set(confirmedImportantElements);
      const potentiallyClippedImportantElements = baseImportantElements.filter(
        (element) => {
          const geometry = horizontalGeometry(element);
          return geometry.outside && !confirmedImportantElementSet.has(element);
        },
      );

      return {
        viewportWidth,
        documentWidth,
        horizontalOverflowPixels: Math.max(0, documentWidth - viewportWidth),
        horizontalScrollPixels,
        wideElementCount: wideElements.length,
        fixedWidthElementCount: fixedWidthElements.length,
        overflowingImageCount: overflowingImages.length,
        intentionallyClippedImageCount: intentionallyClippedImages.length,
        potentialOverflowElementCount: potentialOverflowElements.length,
        clippedBaseImportantElementCount: confirmedImportantElements.length,
        potentiallyClippedImportantElementCount:
          potentiallyClippedImportantElements.length,
        navigationMateriallyOutside: navigationElements.some(
          isConfirmedInaccessible,
        ),
        missingDimensionImageCount: imagesMissingDimensions.length,
        unreservedImageCount: unreservedImages.length,
        controls,
        tinyTextCount: tinyText.length,
        textSampleCount: textElements.length,
      };
    });

    return interpretRenderedMobileMeasurement(
      measurement as RenderedMobileMeasurement,
    );
  } finally {
    signal.removeEventListener("abort", closeOnAbort);
    await context.close().catch(() => undefined);
  }
};

export async function runRenderedMobileAudit(
  primary: PrimaryCrawlData,
  options: Readonly<{
    signal?: AbortSignal;
    timeoutMs?: number;
    browserExecutablePathForTesting?: string;
  }> = {},
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
    return {
      available: true,
      metrics: await measurePage(
        primary,
        signal,
        options.browserExecutablePathForTesting,
      ),
    };
  } catch (error) {
    if (signal.aborted) {
      discardPendingBrowser();
    }

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
    const closeWhenReady = pendingBrowser
      .then((browser) => browser.close())
      .catch(() => undefined);
    await Promise.race([
      closeWhenReady,
      new Promise<void>((resolve) => setTimeout(resolve, 1_000)),
    ]);
  }
}
