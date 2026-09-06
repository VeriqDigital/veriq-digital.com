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
  contactFormCount: number;
  unverifiedContactFormCount: number;
  formControlCount: number;
  unlabeledFormControlCount: number;
  contactLinkCount: number;
  actionLinkCount: number;
  unverifiedActionControlCount: number;
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
  let unverifiedActionControlCount = 0;
  const countedActions = new Set<unknown>();
  const isUnavailable = (element: (typeof formControls)[number]) => {
    const control = $(element);
    return control.is("[disabled]") || control.closest(
      '[hidden], [inert], [aria-hidden="true" i], [aria-disabled="true" i], fieldset[disabled]',
    ).length > 0 || control.parents().addBack().toArray().some((candidate) =>
      /(?:^|;)\s*(?:display\s*:\s*none|visibility\s*:\s*hidden)\s*(?:;|$)/i.test(
        $(candidate).attr("style") ?? "",
      ),
    );
  };

  const labelledByText = (value: string | undefined) => (value ?? "")
    .split(/\s+/).filter(Boolean)
    .map((id) => $("[id]").filter((_, candidate) => $(candidate).attr("id") === id).first().text())
    .join(" ");
  type FormPurpose = "contact" | "other" | "unverified";
  const formPurposes = new Map<(typeof formControls)[number], FormPurpose>();
  $("form").each((_, element) => {
    const form = $(element);
    const availableFields = form.find("input, select, textarea").toArray()
      .filter((field) => !isUnavailable(field) &&
        !$(field).is('[type="hidden" i], [type="submit" i], [type="button" i], [type="reset" i]'));
    // Inspect the form's own purpose and primary controls, not nearby page copy
    // or an optional newsletter checkbox inside an otherwise valid inquiry form.
    const purposeText = normalizeText([
      form.attr("aria-label"), labelledByText(form.attr("aria-labelledby")),
      form.attr("id"), form.attr("name"), form.attr("action"),
      form.find("legend, h1, h2, h3, h4").text(),
      ...form.find('button, input[type="submit" i], input[type="button" i]').toArray()
        .filter((button) => !isUnavailable(button))
        .map((button) => $(button).attr("aria-label") || $(button).attr("value") || $(button).text()),
    ].filter(Boolean).join(" ")).replace(/[_/.-]+/g, " ");
    const otherPurpose = /\b(newsletter|subscrib\w*|subscription|sign\s*up|log\s*in|sign\s*in|account|password|register|registration|search)\b/i.test(purposeText);
    const inquiryIntent = /\b(contact|quote|estimate|inquir(?:y|ies)|request|message|callback|call back|consultation)\b/i.test(purposeText);
    const explicitOther = form.is('[role="search" i]') ||
      availableFields.some((field) => $(field).is('[type="search" i], [type="password" i]'));
    const inquiryFields = availableFields.some((field) => $(field).is('textarea, input[type="tel" i]'));
    const purpose: FormPurpose = isUnavailable(element) || availableFields.length === 0 || explicitOther || otherPurpose
      ? "other"
      : inquiryFields || inquiryIntent
        ? "contact"
        : "unverified";
    formPurposes.set(element, purpose);
  });

  $("a[href]").each((_, element) => {
    const link = $(element);
    const href = (link.attr("href") ?? "").trim();
    const text = normalizeText(link.text());
    const unavailableAction = isUnavailable(element);

    const isDirectContact = /^(tel:|mailto:)\S+/i.test(href);
    if (!unavailableAction && isDirectContact) {
      contactLinkCount += 1;
    }

    const resolvedAction = resolveUrl(href, resolutionBase);
    const hasDestination = Boolean(
      href && href !== "#" && resolvedAction &&
      (["http:", "https:"].includes(resolvedAction.protocol) ||
        /^(tel:|mailto:)\S+/i.test(href)),
    );
    if (!unavailableAction && hasDestination && (isDirectContact || actionTextPattern.test(`${text} ${href}`))) {
      actionLinkCount += 1;
      countedActions.add(element);
    }
    if (!unavailableAction && !hasDestination && actionTextPattern.test(text)) {
      unverifiedActionControlCount += 1;
      countedActions.add(element);
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

  $("button, input, [role]").each((_, element) => {
    if (countedActions.has(element)) return;

    const control = $(element);
    const tagName = element.tagName.toLowerCase();
    const type = (control.attr("type") ?? "").toLowerCase();
    const role = (control.attr("role") ?? "").toLowerCase();
    const isNativeButton =
      tagName === "button" ||
      (tagName === "input" && ["button", "submit"].includes(type));
    const tabIndex = Number(control.attr("tabindex"));
    const isInteractiveAriaButton =
      role === "button" &&
      (tagName === "button" ||
        tagName === "a" ||
        (control.attr("tabindex") !== undefined &&
          Number.isInteger(tabIndex) &&
          tabIndex >= 0));

    if (!isNativeButton && !isInteractiveAriaButton) return;

    if (isUnavailable(element)) {
      return;
    }

    const accessibleName = normalizeText(
      control.attr("aria-label") ||
        labelledByText(control.attr("aria-labelledby")) ||
        (tagName === "input" ? control.attr("value") : control.text()) ||
        control.attr("title"),
    );

    // A form attribute overrides ancestry, including when its ID is invalid.
    const formId = control.attr("form");
    const owner = formId !== undefined
      ? $("form[id]").filter((_, candidate) => $(candidate).attr("id") === formId).first()
      : control.closest("form");
    const ownerElement = owner.get(0);
    const purpose = ownerElement?.type === "tag" ? formPurposes.get(ownerElement) : undefined;
    const isSubmit = (tagName === "button" && !["button", "reset"].includes(type)) ||
      (tagName === "input" && type === "submit");
    const method = (control.attr("formmethod") ?? owner.attr("method") ?? "get").trim().toLowerCase();
    const action = control.attr("formaction") ?? owner.attr("action");
    // An empty action submits to the current document under native HTML rules.
    const target = resolveUrl(action?.trim() || pageUrl.href, resolutionBase);
    const nativeSubmission = isSubmit && ownerElement && purpose === "contact" &&
      ["get", "post"].includes(method) && target && ["http:", "https:"].includes(target.protocol);
    if (nativeSubmission) {
      actionLinkCount += 1;
      countedActions.add(element);
    } else if (purpose !== "other" && accessibleName && actionTextPattern.test(accessibleName)) {
      // Button names and click handlers reveal intent, not verified behavior.
      unverifiedActionControlCount += 1;
      countedActions.add(element);
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
    hasViewport: /(?:^|[,;\s])width\s*=\s*device-width(?:$|[,;\s])/i.test(
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
    contactFormCount: [...formPurposes.values()].filter((purpose) => purpose === "contact").length,
    unverifiedContactFormCount: [...formPurposes.values()].filter((purpose) => purpose === "unverified").length,
    formControlCount: formControls.length,
    unlabeledFormControlCount,
    contactLinkCount,
    actionLinkCount,
    unverifiedActionControlCount,
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
