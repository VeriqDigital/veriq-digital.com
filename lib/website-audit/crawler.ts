import { safeHttpRequest } from "./http";
import { parsePageSnapshot } from "./page-analysis";
import type { PageSnapshot } from "./page-analysis";
import type { CrawlAuditData, ResourceDiscoveryStatus } from "./crawl-types";

const auditUserAgent =
  "VeriqAuditBot/1.0 (+https://www.veriqdigital.com/website-audit)";
const primaryPageLimit = 1024 * 1024;
const secondaryPageLimit = 768 * 1024;
const discoveryResourceLimit = 512 * 1024;
const maximumSecondaryPages = 2;
const maximumLinkProbes = 8;

export type WebsiteCrawlErrorCode =
  | "TARGET_UNREACHABLE"
  | "TARGET_NOT_HTML"
  | "TARGET_EMPTY"
  | "AUDIT_TIMEOUT";

export class WebsiteCrawlError extends Error {
  readonly code: WebsiteCrawlErrorCode;

  constructor(code: WebsiteCrawlErrorCode, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "WebsiteCrawlError";
    this.code = code;
  }
}

export type PrimaryCrawlData = Readonly<{
  submittedUrl: string;
  finalUrl: string;
  redirectCount: number;
  primaryPage: PageSnapshot;
}>;

type RobotsRule = Readonly<{
  allow: boolean;
  pattern: string;
}>;

type RobotsGroup = Readonly<{
  agents: readonly string[];
  rules: readonly RobotsRule[];
}>;

type RobotsResult = CrawlAuditData["robots"] &
  Readonly<{ rules: readonly RobotsRule[] }>;

const staticFilePattern =
  /\.(?:avif|bmp|css|csv|docx?|eot|gif|ico|jpe?g|js|json|mp3|mp4|mov|pdf|png|pptx?|rar|rss|svg|tar|tiff?|txt|webm|webp|woff2?|xlsx?|xml|zip)$/i;
const skippedPathPrefixPattern =
  /^\/(?:admin|wp-admin|login|logout|signin|sign-in|account|dashboard|cart|checkout|api|auth|oauth)(?:\/|$)/i;

const decodePathForPolicy = (pathname: string) => {
  let decodedPath = pathname;

  for (let pass = 0; pass < 2; pass += 1) {
    try {
      const nextPath = decodeURIComponent(decodedPath);
      if (nextPath === decodedPath) break;
      decodedPath = nextPath;
    } catch {
      break;
    }
  }

  return decodedPath;
};

const hasSensitivePath = (candidate: URL) =>
  skippedPathPrefixPattern.test(candidate.pathname) ||
  skippedPathPrefixPattern.test(decodePathForPolicy(candidate.pathname));

export const isOptionalPageCandidate = (candidate: URL, origin: string) =>
  candidate.origin === origin &&
  !candidate.search &&
  !hasSensitivePath(candidate) &&
  !staticFilePattern.test(candidate.pathname);

export const isFirstPartyLinkProbeCandidate = (
  candidate: URL,
  origin: string,
) =>
  candidate.origin === origin &&
  !candidate.search &&
  !hasSensitivePath(candidate);

const isHtmlContentType = (contentType: string | undefined) =>
  Boolean(contentType?.toLowerCase().match(/^(?:text\/html|application\/xhtml\+xml)(?:;|$)/));

const appearsToBeHtml = (body: Buffer) => {
  const prefix = body.subarray(0, 512).toString("utf8").trimStart().toLowerCase();
  return prefix.startsWith("<!doctype html") || prefix.startsWith("<html");
};

const decodeText = (body: Buffer, contentType: string | undefined) => {
  const charset = contentType?.match(/charset\s*=\s*["']?([^;\s"']+)/i)?.[1];

  try {
    return new TextDecoder(charset || "utf-8").decode(body);
  } catch {
    return new TextDecoder().decode(body);
  }
};

const requestHeaders = Object.freeze({
  Accept: "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5,*/*;q=0.1",
  "User-Agent": auditUserAgent,
});

const mapWithConcurrency = async <T, R>(
  values: readonly T[],
  limit: number,
  task: (value: T) => Promise<R>,
): Promise<R[]> => {
  const output = new Array<R>(values.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < values.length) {
      const index = nextIndex;
      nextIndex += 1;
      output[index] = await task(values[index]);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, () => worker()),
  );
  return output;
};

const parseRobotsGroups = (text: string): readonly RobotsGroup[] => {
  const groups: { agents: string[]; rules: RobotsRule[] }[] = [];
  let current: { agents: string[]; rules: RobotsRule[] } | null = null;

  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.replace(/#.*$/, "").trim();
    if (!line) continue;

    const separator = line.indexOf(":");
    if (separator < 0) continue;

    const directive = line.slice(0, separator).trim().toLowerCase();
    const value = line.slice(separator + 1).trim();

    if (directive === "user-agent") {
      if (!current || current.rules.length > 0) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      if (value) current.agents.push(value.toLowerCase());
      continue;
    }

    if (
      current &&
      current.agents.length > 0 &&
      (directive === "allow" || directive === "disallow") &&
      value
    ) {
      current.rules.push({ allow: directive === "allow", pattern: value });
    }
  }

  return groups.map((group) => ({
    agents: Object.freeze([...group.agents]),
    rules: Object.freeze([...group.rules]),
  }));
};

const selectRobotsRules = (groups: readonly RobotsGroup[]) => {
  const matchingGroups = groups.filter((group) =>
    group.agents.some(
      (agent) => agent === "*" || "veriqauditbot".startsWith(agent),
    ),
  );
  const bestSpecificity = matchingGroups.reduce(
    (best, group) =>
      Math.max(
        best,
        ...group.agents
          .filter((agent) => agent === "*" || "veriqauditbot".startsWith(agent))
          .map((agent) => (agent === "*" ? 0 : agent.length)),
      ),
    -1,
  );

  return matchingGroups
    .filter((group) =>
      group.agents.some(
        (agent) =>
          (agent === "*" ? 0 : agent.length) === bestSpecificity &&
          (agent === "*" || "veriqauditbot".startsWith(agent)),
      ),
    )
    .flatMap((group) => group.rules);
};

const robotsPatternMatches = (pattern: string, pathAndQuery: string) => {
  const anchoredAtEnd = pattern.endsWith("$");
  const source = (anchoredAtEnd ? pattern.slice(0, -1) : pattern)
    .split("*")
    .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join(".*");

  try {
    return new RegExp(`^${source}${anchoredAtEnd ? "$" : ""}`).test(pathAndQuery);
  } catch {
    return false;
  }
};

const isAllowedByRobots = (url: URL, rules: readonly RobotsRule[]) => {
  const pathAndQuery = `${url.pathname}${url.search}`;
  const matches = rules
    .filter((rule) => robotsPatternMatches(rule.pattern, pathAndQuery))
    .sort((left, right) => {
      const lengthDifference = right.pattern.length - left.pattern.length;
      return lengthDifference !== 0 ? lengthDifference : Number(right.allow) - Number(left.allow);
    });

  return matches[0]?.allow ?? true;
};

const discoverRobots = async (
  finalUrl: URL,
  signal?: AbortSignal,
): Promise<RobotsResult> => {
  const robotsUrl = new URL("/robots.txt", finalUrl.origin);

  try {
    const response = await safeHttpRequest(robotsUrl, {
      allowedRedirectOrigin: finalUrl.origin,
      headers: requestHeaders,
      maxBytes: discoveryResourceLimit,
      maxRedirects: 2,
      signal,
      timeoutMs: 5_000,
    });

    if (response.status >= 400 && response.status < 500) {
      return {
        status: "missing",
        blocksPrimaryPage: false,
        blocksOptionalCrawl: false,
        sitemapUrl: null,
        rules: [],
      };
    }

    if (response.status >= 500 || response.status < 200) {
      return {
        status: "unavailable",
        blocksPrimaryPage: false,
        blocksOptionalCrawl: true,
        sitemapUrl: null,
        rules: [],
      };
    }

    const text = decodeText(response.body, response.headers["content-type"]);
    const rules = selectRobotsRules(parseRobotsGroups(text));
    const primaryAllowed = isAllowedByRobots(finalUrl, rules);
    const sitemapUrl = text
      .split(/\r?\n/)
      .map((line) => line.replace(/#.*$/, "").trim())
      .filter((line) => /^sitemap\s*:/i.test(line))
      .map((line) => line.slice(line.indexOf(":") + 1).trim())
      .flatMap((value) => {
        try {
          const candidate = new URL(value, finalUrl.origin);
          return candidate.origin === finalUrl.origin ? [candidate.toString()] : [];
        } catch {
          return [];
        }
      })[0] ?? null;

    return {
      status: "present",
      blocksPrimaryPage: !primaryAllowed,
      blocksOptionalCrawl: !primaryAllowed,
      sitemapUrl,
      rules,
    };
  } catch {
    return {
      status: "unavailable",
      blocksPrimaryPage: false,
      blocksOptionalCrawl: true,
      sitemapUrl: null,
      rules: [],
    };
  }
};

const discoverSitemap = async (
  finalUrl: URL,
  robots: RobotsResult,
  signal?: AbortSignal,
): Promise<ResourceDiscoveryStatus> => {
  const sitemapUrl = robots.sitemapUrl
    ? new URL(robots.sitemapUrl)
    : new URL("/sitemap.xml", finalUrl.origin);

  try {
    const response = await safeHttpRequest(sitemapUrl, {
      allowedRedirectOrigin: finalUrl.origin,
      headers: requestHeaders,
      maxBytes: discoveryResourceLimit,
      maxRedirects: 2,
      signal,
      timeoutMs: 5_000,
    });

    if (response.status >= 400 && response.status < 500) return "missing";
    if (response.status >= 500 || response.status < 200) return "unavailable";

    const text = decodeText(response.body, response.headers["content-type"]);
    return /<(?:urlset|sitemapindex)(?:\s|>)/i.test(text)
      ? "present"
      : "missing";
  } catch {
    return "unavailable";
  }
};

const crawlSecondaryPages = async (
  primary: PrimaryCrawlData,
  robots: RobotsResult,
  signal?: AbortSignal,
): Promise<readonly PageSnapshot[]> => {
  if (robots.blocksOptionalCrawl) return [];

  const finalUrl = new URL(primary.finalUrl);
  const candidates = primary.primaryPage.internalLinks
    .map((href) => new URL(href))
    .filter(
      (candidate) =>
        candidate.toString() !== finalUrl.toString() &&
        isOptionalPageCandidate(candidate, finalUrl.origin) &&
        isAllowedByRobots(candidate, robots.rules),
    )
    .slice(0, maximumSecondaryPages);
  const pages = await mapWithConcurrency(candidates, 2, async (candidate) => {
    try {
      const response = await safeHttpRequest(candidate, {
        allowedRedirectOrigin: finalUrl.origin,
        headers: requestHeaders,
        maxBytes: secondaryPageLimit,
        maxRedirects: 2,
        signal,
        timeoutMs: 5_000,
      });
      const contentType = response.headers["content-type"];

      if (
        response.status < 200 ||
        response.status >= 300 ||
        (!isHtmlContentType(contentType) && !appearsToBeHtml(response.body))
      ) {
        return null;
      }

      return parsePageSnapshot({
        url: response.finalUrl,
        statusCode: response.status,
        html: decodeText(response.body, contentType),
        robotsHeader: response.headers["x-robots-tag"],
      });
    } catch {
      return null;
    }
  });

  return pages.filter((page): page is PageSnapshot => page !== null);
};

const probeFirstPartyLinks = async (
  primary: PrimaryCrawlData,
  robots: RobotsResult,
  signal?: AbortSignal,
): Promise<CrawlAuditData["brokenLinks"]> => {
  const finalUrl = new URL(primary.finalUrl);
  const candidates = primary.primaryPage.internalLinks
    .map((href) => new URL(href))
    .filter(
      (candidate) =>
        isFirstPartyLinkProbeCandidate(candidate, finalUrl.origin) &&
        candidate.toString() !== finalUrl.toString() &&
        isAllowedByRobots(candidate, robots.rules),
    )
    .slice(0, maximumLinkProbes);
  const outcomes = await mapWithConcurrency(candidates, 3, async (candidate) => {
    try {
      let response = await safeHttpRequest(candidate, {
        allowedRedirectOrigin: finalUrl.origin,
        headers: requestHeaders,
        maxBytes: 1024,
        maxRedirects: 2,
        method: "HEAD",
        signal,
        timeoutMs: 4_000,
      });

      if (response.status === 405 || response.status === 501) {
        response = await safeHttpRequest(candidate, {
          allowedRedirectOrigin: finalUrl.origin,
          headers: requestHeaders,
          maxBytes: 64 * 1024,
          maxRedirects: 2,
          signal,
          timeoutMs: 4_000,
        });
      }

      const broken =
        (response.status >= 400 && ![401, 403, 429].includes(response.status)) ||
        response.status >= 500;
      return { tested: true, broken, statusCode: response.status };
    } catch {
      // A failed or capped probe is inconclusive: do not invent a status.
      return { tested: false, broken: false, statusCode: 0 };
    }
  });
  const tested = outcomes.filter((outcome) => outcome.tested).length;

  return {
    tested,
    broken: outcomes.flatMap((outcome, index) =>
      outcome.tested && outcome.broken
        ? [{ url: candidates[index].toString(), statusCode: outcome.statusCode }]
        : [],
    ),
    unavailable: outcomes.length - tested,
  };
};

export async function fetchPrimaryAuditPage(
  submittedUrl: string,
  signal?: AbortSignal,
): Promise<PrimaryCrawlData> {
  try {
    const response = await safeHttpRequest(submittedUrl, {
      headers: requestHeaders,
      maxBytes: primaryPageLimit,
      maxRedirects: 3,
      signal,
      timeoutMs: 8_000,
    });
    const contentType = response.headers["content-type"];

    if (response.body.byteLength === 0) {
      throw new WebsiteCrawlError(
        "TARGET_EMPTY",
        "The website returned an empty page, so it could not be audited.",
      );
    }

    if (!isHtmlContentType(contentType) && !appearsToBeHtml(response.body)) {
      throw new WebsiteCrawlError(
        "TARGET_NOT_HTML",
        "The submitted URL did not return an HTML webpage.",
      );
    }

    const html = decodeText(response.body, contentType);

    return {
      submittedUrl: response.requestedUrl,
      finalUrl: response.finalUrl,
      redirectCount: response.redirects.length,
      primaryPage: parsePageSnapshot({
        url: response.finalUrl,
        statusCode: response.status,
        html,
        robotsHeader: response.headers["x-robots-tag"],
      }),
    };
  } catch (error) {
    if (error instanceof WebsiteCrawlError) throw error;
    if (signal?.aborted) {
      throw new WebsiteCrawlError(
        "AUDIT_TIMEOUT",
        "The audit took too long to complete. Please try again.",
        { cause: error },
      );
    }
    throw new WebsiteCrawlError(
      "TARGET_UNREACHABLE",
      "The website could not be reached from the public internet.",
      { cause: error },
    );
  }
}

export async function completeWebsiteCrawl(
  primary: PrimaryCrawlData,
  signal?: AbortSignal,
): Promise<CrawlAuditData> {
  const finalUrl = new URL(primary.finalUrl);
  const robots = await discoverRobots(finalUrl, signal);
  const [sitemapStatus, secondaryPages, brokenLinks] = await Promise.all([
    discoverSitemap(finalUrl, robots, signal),
    crawlSecondaryPages(primary, robots, signal),
    robots.blocksOptionalCrawl
      ? Promise.resolve({ tested: 0, broken: [], unavailable: 0 })
      : probeFirstPartyLinks(primary, robots, signal),
  ]);

  return {
    submittedUrl: primary.submittedUrl,
    finalUrl: primary.finalUrl,
    redirectCount: primary.redirectCount,
    primaryPage: primary.primaryPage,
    pages: [primary.primaryPage, ...secondaryPages],
    robots: {
      status: robots.status,
      blocksPrimaryPage: robots.blocksPrimaryPage,
      blocksOptionalCrawl: robots.blocksOptionalCrawl,
      sitemapUrl: robots.sitemapUrl,
    },
    sitemapStatus,
    brokenLinks,
  };
}

export async function crawlWebsite(
  submittedUrl: string,
  signal?: AbortSignal,
): Promise<CrawlAuditData> {
  const primary = await fetchPrimaryAuditPage(submittedUrl, signal);
  return completeWebsiteCrawl(primary, signal);
}
