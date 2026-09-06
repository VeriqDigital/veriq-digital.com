import type { PageSpeedData, PageSpeedMetric } from "../model";
import { toNormalizedScore } from "../result-schema";
import { auditTimeBudgets, createAuditDeadline, remainingBudgetMs } from "../time-budgets";

const endpoint = "https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed";
const responseLimitBytes = 6 * 1024 * 1024;
const defaultRetryDelayMs = 250;
const maximumAttempts = 2;

type UnknownRecord = Record<string, unknown>;

class PageSpeedResponseTooLargeError extends Error {}

type PageSpeedFailure =
  | "http_status"
  | "timeout"
  | "network_error"
  | "invalid_json"
  | "response_too_large"
  | "missing_lighthouse_data"
  | "lighthouse_runtime_error"
  | "missing_performance_score";

const logProviderFailure = (
  failure: PageSpeedFailure,
  details: Readonly<Record<string, unknown>>,
) => {
  // Never log the target URL, API key, response body, or upstream message.
  console.warn("Website audit PageSpeed provider unavailable", {
    failure,
    ...details,
  });
};

const waitForRetry = (delayMs: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }

    const onAbort = () => {
      clearTimeout(timeout);
      reject(signal.reason);
    };
    const timeout = setTimeout(() => {
      signal.removeEventListener("abort", onAbort);
      resolve();
    }, delayMs);
    signal.addEventListener("abort", onAbort, { once: true });
  });

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

async function readLimitedJson(response: Response): Promise<{ payload: unknown; bytes: number }> {
  if (!response.body) return { payload: null, bytes: 0 };

  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;

  while (true) {
    const { done, value } = await reader.read();

    if (done) break;
    totalBytes += value.byteLength;

    if (totalBytes > responseLimitBytes) {
      await reader.cancel();
      throw new PageSpeedResponseTooLargeError();
    }

    chunks.push(value);
  }

  const bytes = new Uint8Array(totalBytes);
  let offset = 0;

  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  return { payload: JSON.parse(new TextDecoder().decode(bytes)) as unknown, bytes: totalBytes };
}

export async function runPageSpeedAudit(
  targetUrl: string,
  options: {
    apiKey?: string;
    signal?: AbortSignal;
    fetchImpl?: typeof fetch;
    timeoutMs?: number;
    retryDelayMs?: number;
    deadlineAt?: number;
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
  // Compact transport only: all category evidence and provider semantics stay intact.
  requestUrl.searchParams.set("prettyPrint", "false");
  const startedAt = Date.now();
  const timeoutMs = Math.min(options.timeoutMs ?? auditTimeBudgets.pageSpeedMs, auditTimeBudgets.pageSpeedMs);
  const deadlineAt = Math.min(options.deadlineAt ?? Infinity, startedAt + timeoutMs);
  const deadline = createAuditDeadline(remainingBudgetMs(deadlineAt, timeoutMs), options.signal);
  const signal = deadline.signal;
  const fetchImpl = options.fetchImpl ?? fetch;
  const retryDelayMs = options.retryDelayMs ?? defaultRetryDelayMs;
  const canRetry = (attempt: number) => attempt < maximumAttempts && !signal.aborted &&
    deadlineAt - Date.now() >= retryDelayMs + auditTimeBudgets.minimumPageSpeedRetryMs;

  try {
    for (let attempt = 1; attempt <= maximumAttempts; attempt += 1) {
      let responseStatus: number | undefined;
      try {
        signal.throwIfAborted();
        const response = await fetchImpl(requestUrl, {
          headers: { Accept: "application/json" },
          cache: "no-store",
          signal,
        });
        responseStatus = response.status;

        if (response.status === 429) {
          await response.body?.cancel().catch(() => undefined);
          logProviderFailure("http_status", {
            status: 429,
            attempt,
            durationMs: Date.now() - startedAt,
            willRetry: false,
          });
          return { available: false, reason: "rate_limited" };
        }

        if (!response.ok) {
          const willRetry = response.status >= 500 && canRetry(attempt);
          logProviderFailure("http_status", {
            status: response.status,
            attempt,
            durationMs: Date.now() - startedAt,
            willRetry,
          });
          await response.body?.cancel().catch(() => undefined);

          if (willRetry) {
            await waitForRetry(retryDelayMs, signal);
            continue;
          }

          return { available: false, reason: "provider_error" };
        }

        let payload: UnknownRecord | null;
        let responseBytes = 0;

        try {
          const read = await readLimitedJson(response);
          payload = asRecord(read.payload);
          responseBytes = read.bytes;
        } catch (error) {
          if (signal.aborted) throw signal.reason;
          const failure =
            error instanceof PageSpeedResponseTooLargeError
              ? "response_too_large"
              : "invalid_json";
          logProviderFailure(failure, {
            status: response.status,
            attempt,
            durationMs: Date.now() - startedAt,
            willRetry: false,
          });
          return { available: false, reason: "provider_error" };
        }

        const lighthouse = asRecord(payload?.lighthouseResult);
        const categories = asRecord(lighthouse?.categories);
        const audits = asRecord(lighthouse?.audits);

        if (!categories || !audits) {
          logProviderFailure(
            asRecord(lighthouse?.runtimeError)
              ? "lighthouse_runtime_error"
              : "missing_lighthouse_data",
            {
              status: response.status,
              attempt,
              durationMs: Date.now() - startedAt,
              willRetry: false,
            },
          );
          return { available: false, reason: "provider_error" };
        }

        const performanceScore = readCategoryScore(categories, "performance");

        if (performanceScore === null) {
          logProviderFailure("missing_performance_score", {
            status: response.status,
            attempt,
            durationMs: Date.now() - startedAt,
            willRetry: false,
          });
          return { available: false, reason: "provider_error" };
        }

        const loadingExperience = asRecord(payload?.loadingExperience);
        const fieldMetrics = asRecord(loadingExperience?.metrics);
        const fieldInp = asRecord(fieldMetrics?.INTERACTION_TO_NEXT_PAINT);
        const fieldInpValue = readNumber(fieldInp?.percentile);

        signal.throwIfAborted();
        console.info("Website audit PageSpeed provider completed", {
          attempt, durationMs: Date.now() - startedAt, status: response.status, responseBytes,
          lighthouseDurationMs: readNumber(asRecord(lighthouse?.timing)?.total) ?? undefined,
        });

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
          signal.aborted ||
          (error instanceof DOMException &&
            ["AbortError", "TimeoutError"].includes(error.name))
        ) {
          logProviderFailure("timeout", {
            status: responseStatus,
            attempt,
            durationMs: Date.now() - startedAt,
            willRetry: false,
          });
          return { available: false, reason: "timeout" };
        }

        const willRetry = error instanceof TypeError && canRetry(attempt);
        logProviderFailure("network_error", {
          status: responseStatus,
          attempt,
          durationMs: Date.now() - startedAt,
          willRetry,
        });

        if (willRetry) {
          try {
            await waitForRetry(retryDelayMs, signal);
          } catch {
            logProviderFailure("timeout", { attempt, durationMs: Date.now() - startedAt, willRetry: false });
            return { available: false, reason: "timeout" };
          }
          continue;
        }

        return { available: false, reason: "provider_error" };
      }
    }

    return { available: false, reason: "provider_error" };
  } finally {
    deadline.dispose();
  }
}
