import type { PageSpeedData, PageSpeedMetric } from "../model";
import { toNormalizedScore } from "../result-schema";

const endpoint = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed";
const responseLimitBytes = 6 * 1024 * 1024;
const defaultTimeoutMs = 32_000;

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord | null =>
  typeof value === "object" && value !== null ? (value as UnknownRecord) : null;

const readNumber = (value: unknown) =>
  typeof value === "number" && Number.isFinite(value) ? value : null;

const readString = (value: unknown) =>
  typeof value === "string" && value.trim() ? value.trim() : undefined;

const readCategoryScore = (categories: UnknownRecord, key: string) => {
  const category = asRecord(categories[key]);
  const score = readNumber(category?.score);
  return score === null ? null : toNormalizedScore(score * 100);
};

const readMetric = (
  audits: UnknownRecord,
  key: string,
): PageSpeedMetric | undefined => {
  const audit = asRecord(audits[key]);
  const numericValue = readNumber(audit?.numericValue);

  if (numericValue === null) return undefined;

  return {
    numericValue,
    displayValue: readString(audit?.displayValue),
  };
};

const readAuditScore = (audits: UnknownRecord, key: string) => {
  const audit = asRecord(audits[key]);
  const score = readNumber(audit?.score);
  return score === null ? null : toNormalizedScore(score * 100);
};

async function readLimitedJson(response: Response): Promise<unknown> {
  if (!response.body) return null;

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    totalBytes += value.byteLength;

    if (totalBytes > responseLimitBytes) {
      await reader.cancel();
      throw new Error("PageSpeed response exceeded the allowed size.");
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
}

export async function runPageSpeedAudit(
  targetUrl: string,
  options: {
    apiKey?: string;
    signal?: AbortSignal;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
  } = {},
): Promise<PageSpeedData> {
  if (!options.apiKey) {
    return { available: false, reason: "not_configured" };
  }

  const requestUrl = new URL(endpoint);
  requestUrl.searchParams.set("url", targetUrl);
  requestUrl.searchParams.set("strategy", "MOBILE");
  requestUrl.searchParams.append("category", "PERFORMANCE");
  requestUrl.searchParams.append("category", "ACCESSIBILITY");
  requestUrl.searchParams.append("category", "SEO");
  requestUrl.searchParams.set("key", options.apiKey);
  const timeoutSignal = AbortSignal.timeout(options.timeoutMs ?? defaultTimeoutMs);
  const signal = options.signal
    ? AbortSignal.any([options.signal, timeoutSignal])
    : timeoutSignal;

  try {
    const response = await (options.fetchImpl ?? fetch)(requestUrl, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    });

    if (response.status === 429) {
      return { available: false, reason: "rate_limited" };
    }

    if (!response.ok) {
      console.warn("Website audit PageSpeed request failed", {
        status: response.status,
      });
      return { available: false, reason: "provider_error" };
    }

    const payload = asRecord(await readLimitedJson(response));
    const lighthouse = asRecord(payload?.lighthouseResult);
    const categories = asRecord(lighthouse?.categories);
    const audits = asRecord(lighthouse?.audits);

    if (!categories || !audits) {
      return { available: false, reason: "provider_error" };
    }

    const performanceScore = readCategoryScore(categories, "performance");

    if (performanceScore === null) {
      return { available: false, reason: "provider_error" };
    }

    const loadingExperience = asRecord(payload?.loadingExperience);
    const fieldMetrics = asRecord(loadingExperience?.metrics);
    const fieldInp = asRecord(fieldMetrics?.INTERACTION_TO_NEXT_PAINT);
    const fieldInpValue = readNumber(fieldInp?.percentile);

    return {
      available: true,
      performanceScore,
      accessibilityScore: readCategoryScore(categories, "accessibility"),
      seoScore: readCategoryScore(categories, "seo"),
      metrics: {
        lcp: readMetric(audits, "largest-contentful-paint"),
        cls: readMetric(audits, "cumulative-layout-shift"),
        inp:
          fieldInpValue === null
            ? undefined
            : { numericValue: fieldInpValue, displayValue: `${Math.round(fieldInpValue)} ms` },
        fcp: readMetric(audits, "first-contentful-paint"),
        tbt: readMetric(audits, "total-blocking-time"),
        speedIndex: readMetric(audits, "speed-index"),
      },
      audits: {
        viewport: readAuditScore(audits, "viewport"),
        tapTargets: readAuditScore(audits, "tap-targets"),
        contentWidth: readAuditScore(audits, "content-width"),
        colorContrast: readAuditScore(audits, "color-contrast"),
        linkName: readAuditScore(audits, "link-name"),
        buttonName: readAuditScore(audits, "button-name"),
      },
    };
  } catch (error) {
    if (
      error instanceof DOMException &&
      ["AbortError", "TimeoutError"].includes(error.name)
    ) {
      return { available: false, reason: "timeout" };
    }

    console.warn("Website audit PageSpeed provider error", {
      reason: error instanceof Error ? error.name : "unknown",
    });
    return { available: false, reason: "provider_error" };
  }
}
