import { load } from "cheerio";

export type HeadingSnapshot = Readonly<{ level: number; text: string }>;

export type PageSnapshot = Readonly<{
  url: string;
  statusCode: number;
  htmlBytes: number;
  title: string;
  metaDescription: string;
  canonicalUrl: string | null;
  canonicalInvalid: boolean;
  robotsDirectives: readonly string[];
  headings: readonly HeadingSnapshot[];
  h1s: readonly string[];
  hasViewport: boolean;
  documentLanguage: string;
  imageCount: number;
  missingAltImageCount: number;
  missingDimensionImageCount: number;
  responsiveImageCount: number;
  structuredDataCount: number;
  formCount: number;
  formControlCount: number;
  unlabeledFormControlCount: number;
  contactLinkCount: number;
  actionLinkCount: number;
  mixedContentCount: number;
  internalLinks: readonly string[];
}>;

const actionTextPattern =
  /\b(call|contact|book|schedule|quote|estimate|get started|request|buy|shop|reserve|apply|sign up)\b/i;

const normalizeText = (value: string | undefined) =>
  (value ?? "").replace(/\s+/g, " ").trim();

const resolveUrl = (value: string | undefined, baseUrl: URL) => {
  if (!value) return null;

  try {
    return new URL(value, baseUrl);
  } catch {
    return null;
  }
};

export function parsePageSnapshot({
  url,
  statusCode,
  html,
  robotsHeader,
}: {
  url: string;
  statusCode: number;
  html: string;
  robotsHeader?: string;
}): PageSnapshot {
  const pageUrl = new URL(url);
  const $ = load(html);
  const baseElementUrl = resolveUrl($("base[href]").first().attr("href"), pageUrl);
  const resolutionBase =
    baseElementUrl?.origin === pageUrl.origin ? baseElementUrl : pageUrl;
  const title = normalizeText($("title").first().text());
  const metaDescription = normalizeText(
    $('meta[name="description" i]').first().attr("content"),
  );
  const canonicalValue = $("link[rel]")
    .filter((_, element) =>
      ($(element).attr("rel") ?? "")
        .toLowerCase()
        .split(/\s+/)
        .includes("canonical"),
    )
    .first()
    .attr("href");
  const canonical = canonicalValue
    ? resolveUrl(canonicalValue, resolutionBase)
    : null;
  const robotsMetaValues = $('meta[name="robots" i], meta[name="googlebot" i]')
    .map((_, element) => $(element).attr("content") ?? "")
    .get();
  const robotsDirectives = [...robotsMetaValues, robotsHeader ?? ""]
    .flatMap((content) => content.toLowerCase().split(/[\s,]+/))
    .filter(Boolean);
  const headings = $("h1, h2, h3, h4, h5, h6")
    .map((_, element) => ({
      level: Number(element.tagName.slice(1)),
      text: normalizeText($(element).text()),
    }))
    .get();
  const images = $("img").toArray();
  const formControls = $("input, select, textarea")
    .filter((_, element) => {
      const type = ($(element).attr("type") ?? "").toLowerCase();
      return !["hidden", "button", "submit", "reset", "image"].includes(type);
    })
    .toArray();
  const unlabeledFormControlCount = formControls.filter((element) => {
    const control = $(element);
    const id = control.attr("id");
    const hasExplicitLabel = id
      ? $("label")
          .filter((_, label) => $(label).attr("for") === id)
          .length > 0
      : false;
    const hasAccessibleName = Boolean(
      normalizeText(control.attr("aria-label")) ||
        normalizeText(control.attr("aria-labelledby")) ||
        normalizeText(control.attr("title")),
    );

    return !hasExplicitLabel && control.closest("label").length === 0 && !hasAccessibleName;
  }).length;
  const internalLinks = new Set<string>();
  let contactLinkCount = 0;
  let actionLinkCount = 0;

  $("a[href]").each((_, element) => {
    const href = ($(element).attr("href") ?? "").trim();
    const text = normalizeText($(element).text());

    if (/^(tel:|mailto:)/i.test(href)) {
      contactLinkCount += 1;
    }

    if (actionTextPattern.test(`${text} ${href}`)) {
      actionLinkCount += 1;
    }

    const resolvedUrl = resolveUrl(href, resolutionBase);

    if (
      resolvedUrl &&
      ["http:", "https:"].includes(resolvedUrl.protocol) &&
      resolvedUrl.origin === pageUrl.origin
    ) {
      resolvedUrl.hash = "";
      internalLinks.add(resolvedUrl.toString());
    }
  });

  const mixedContentAttributes = [
    ["img", "src"],
    ["script", "src"],
    ["link", "href"],
    ["iframe", "src"],
    ["video", "src"],
    ["audio", "src"],
    ["source", "src"],
  ] as const;
  let mixedContentCount = 0;

  if (pageUrl.protocol === "https:") {
    for (const [selector, attribute] of mixedContentAttributes) {
      $(`${selector}[${attribute}]`).each((_, element) => {
        if (/^http:\/\//i.test($(element).attr(attribute) ?? "")) {
          mixedContentCount += 1;
        }
      });
    }
  }

  return {
    url: pageUrl.toString(),
    statusCode,
    htmlBytes: Buffer.byteLength(html, "utf8"),
    title,
    metaDescription,
    canonicalUrl: canonical?.toString() ?? null,
    canonicalInvalid: Boolean(canonicalValue && !canonical),
    robotsDirectives,
    headings,
    h1s: headings
      .filter((heading) => heading.level === 1 && heading.text.length > 0)
      .map((heading) => heading.text),
    hasViewport: Boolean(
      normalizeText($('meta[name="viewport" i]').first().attr("content")),
    ),
    documentLanguage: normalizeText($("html").attr("lang")),
    imageCount: images.length,
    missingAltImageCount: images.filter(
      (image) => $(image).attr("alt") === undefined,
    ).length,
    missingDimensionImageCount: images.filter(
      (image) => !$(image).attr("width") || !$(image).attr("height"),
    ).length,
    responsiveImageCount: images.filter(
      (image) => Boolean($(image).attr("srcset") || $(image).closest("picture").length),
    ).length,
    structuredDataCount: $('script[type="application/ld+json" i]').length,
    formCount: $("form").length,
    formControlCount: formControls.length,
    unlabeledFormControlCount,
    contactLinkCount,
    actionLinkCount,
    mixedContentCount,
    internalLinks: [...internalLinks],
  };
}

export function hasObviousHeadingSkip(headings: readonly HeadingSnapshot[]) {
  for (let index = 1; index < headings.length; index += 1) {
    if (headings[index].level - headings[index - 1].level > 1) {
      return true;
    }
  }

  return false;
}
