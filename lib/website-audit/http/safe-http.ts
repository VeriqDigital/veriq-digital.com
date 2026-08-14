import {
  request as requestHttp,
  type IncomingHttpHeaders,
  type IncomingMessage,
  type RequestOptions,
} from "node:http";
import { request as requestHttps } from "node:https";
import { BlockList, isIP } from "node:net";
import { checkServerIdentity } from "node:tls";
import {
  isPublicIp,
  parsePublicAuditUrl,
  resolvePublicHost,
  type ResolvedPublicAddress,
  type ResolvePublicHostOptions,
} from "../security";

const defaultTimeoutMs = 8_000;
const defaultMaximumBytes = 1_048_576;
const defaultMaximumRedirects = 3;
const maximumAddressAttempts = 3;
const maximumHeaderBytes = 32_768;

const redirectStatuses = new Set([301, 302, 303, 307, 308]);
const forbiddenCallerHeaders = new Set([
  "authorization",
  "connection",
  "cookie",
  "host",
  "proxy-authorization",
  "proxy-connection",
  "referer",
  "transfer-encoding",
]);
const headerNamePattern = /^[!#$%&'*+.^_`|~\dA-Za-z-]+$/;

export type SafeHttpMethod = "GET" | "HEAD";
export type SafeHttpHeaders = Readonly<Record<string, string>>;

export type SafeHttpRedirect = Readonly<{
  from: string;
  status: number;
  to: string;
}>;

export type SafeHttpResponse = Readonly<{
  body: Buffer;
  finalUrl: string;
  headers: SafeHttpHeaders;
  redirects: readonly SafeHttpRedirect[];
  requestedUrl: string;
  status: number;
}>;

export type PinnedHttpRequest = Readonly<{
  address: ResolvedPublicAddress;
  headers: SafeHttpHeaders;
  maxBytes: number;
  method: SafeHttpMethod;
  signal: AbortSignal;
  timeoutMs: number;
  url: URL;
}>;

export type PinnedHttpResponse = Readonly<{
  body: Buffer;
  headers: SafeHttpHeaders;
  status: number;
}>;

export type SafeHttpTransport = (
  request: PinnedHttpRequest,
) => Promise<PinnedHttpResponse>;

export type SafeHostResolver = typeof resolvePublicHost;

export type SafeHttpDependencies = Readonly<{
  resolveHost: SafeHostResolver;
  transport: SafeHttpTransport;
}>;

export type SafeHttpRequestOptions = Readonly<{
  allowedRedirectOrigin?: string | URL;
  dependencies?: Partial<SafeHttpDependencies>;
  headers?: Readonly<Record<string, string>>;
  maxBytes?: number;
  maxRedirects?: number;
  method?: SafeHttpMethod;
  resolve?: Omit<ResolvePublicHostOptions, "signal">;
  signal?: AbortSignal;
  timeoutMs?: number;
}>;

export type SafeHttpErrorCode =
  | "ABORTED"
  | "INVALID_OPTIONS"
  | "INVALID_REDIRECT"
  | "NETWORK_ERROR"
  | "REDIRECT_LOOP"
  | "REDIRECT_ORIGIN_NOT_ALLOWED"
  | "REMOTE_ADDRESS_MISMATCH"
  | "RESPONSE_ABORTED"
  | "RESPONSE_TOO_LARGE"
  | "TIMEOUT"
  | "TOO_MANY_REDIRECTS"
  | "UNSUPPORTED_CONTENT_ENCODING";

export class SafeHttpError extends Error {
  readonly code: SafeHttpErrorCode;

  constructor(code: SafeHttpErrorCode, message: string) {
    super(message);
    this.name = "SafeHttpError";
    this.code = code;
  }
}

const validatePositiveInteger = (value: number, name: string) => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new SafeHttpError(
      "INVALID_OPTIONS",
      `${name} must be a positive integer.`,
    );
  }
};

const validateNonNegativeInteger = (value: number, name: string) => {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new SafeHttpError(
      "INVALID_OPTIONS",
      `${name} must be a non-negative integer.`,
    );
  }
};

const normalizeResponseHeaders = (
  headers: IncomingHttpHeaders | SafeHttpHeaders,
): SafeHttpHeaders => {
  const normalizedHeaders: Record<string, string> = {};

  for (const [name, value] of Object.entries(headers)) {
    if (typeof value === "string") {
      normalizedHeaders[name.toLowerCase()] = value;
    } else if (typeof value === "number") {
      normalizedHeaders[name.toLowerCase()] = String(value);
    } else if (Array.isArray(value)) {
      normalizedHeaders[name.toLowerCase()] = value.join(", ");
    }
  }

  return Object.freeze(normalizedHeaders);
};

const prepareRequestHeaders = (
  url: URL,
  headers: Readonly<Record<string, string>> | undefined,
): SafeHttpHeaders => {
  const preparedHeaders: Record<string, string> = {};

  for (const [rawName, rawValue] of Object.entries(headers ?? {})) {
    const name = rawName.trim().toLowerCase();

    if (
      !headerNamePattern.test(name) ||
      forbiddenCallerHeaders.has(name) ||
      /[\u0000-\u001f\u007f]/.test(rawValue)
    ) {
      throw new SafeHttpError(
        "INVALID_OPTIONS",
        "One or more request headers are not allowed.",
      );
    }

    preparedHeaders[name] = rawValue;
  }

  preparedHeaders.host = url.host;
  preparedHeaders.connection = "close";
  preparedHeaders["accept-encoding"] = "identity";
  preparedHeaders.accept ??=
    "text/html,application/xhtml+xml;q=0.9,text/plain;q=0.5,*/*;q=0.1";
  preparedHeaders["user-agent"] ??=
    "VeriqWebsiteAudit/1.0 (+https://www.veriqdigital.com/website-audit)";

  return Object.freeze(preparedHeaders);
};

const responseIsTooLarge = (contentLength: string, maxBytes: number) => {
  if (!/^\d+$/.test(contentLength)) return false;

  try {
    return BigInt(contentLength) > BigInt(maxBytes);
  } catch {
    return true;
  }
};

const remoteAddressMatches = (
  remoteAddress: string | undefined,
  pinnedAddress: ResolvedPublicAddress,
) => {
  if (!remoteAddress || !isPublicIp(remoteAddress)) return false;

  const remoteFamily = isIP(remoteAddress);

  if (remoteFamily !== 4 && remoteFamily !== 6) return false;

  const exactAddress = new BlockList();
  exactAddress.addAddress(
    pinnedAddress.address,
    pinnedAddress.family === 4 ? "ipv4" : "ipv6",
  );

  return exactAddress.check(
    remoteAddress,
    remoteFamily === 4 ? "ipv4" : "ipv6",
  );
};

const stripIpv6Brackets = (hostname: string) =>
  hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;

const readPinnedResponse = (
  response: IncomingMessage,
  request: PinnedHttpRequest,
  resolve: (response: PinnedHttpResponse) => void,
  reject: (error: Error) => void,
) => {
  const status = response.statusCode;
  const headers = normalizeResponseHeaders(response.headers);
  let settled = false;

  const finishWithError = (error: Error) => {
    if (settled) return;
    settled = true;
    response.destroy();
    reject(error);
  };

  const finishWithResponse = (body: Buffer) => {
    if (settled) return;
    settled = true;
    resolve({ body, headers, status: status ?? 0 });
  };

  if (!status) {
    finishWithError(
      new SafeHttpError("NETWORK_ERROR", "The website returned no status."),
    );
    return;
  }

  if (!remoteAddressMatches(response.socket.remoteAddress, request.address)) {
    finishWithError(
      new SafeHttpError(
        "REMOTE_ADDRESS_MISMATCH",
        "The website connection did not use the validated address.",
      ),
    );
    return;
  }

  // Redirect bodies and HEAD bodies are not useful to the audit. Closing the
  // socket here prevents a hostile server from streaming an unbounded body.
  if (request.method === "HEAD" || redirectStatuses.has(status)) {
    finishWithResponse(Buffer.alloc(0));
    response.destroy();
    return;
  }

  const contentEncoding = headers["content-encoding"]?.trim().toLowerCase();

  if (contentEncoding && contentEncoding !== "identity") {
    finishWithError(
      new SafeHttpError(
        "UNSUPPORTED_CONTENT_ENCODING",
        "The website ignored the identity encoding request.",
      ),
    );
    return;
  }

  const contentLength = headers["content-length"];

  if (contentLength && responseIsTooLarge(contentLength, request.maxBytes)) {
    finishWithError(
      new SafeHttpError(
        "RESPONSE_TOO_LARGE",
        "The website response exceeded the audit size limit.",
      ),
    );
    return;
  }

  const chunks: Buffer[] = [];
  let receivedBytes = 0;

  response.on("data", (chunk: Buffer | string) => {
    if (settled) return;

    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    receivedBytes += buffer.byteLength;

    if (receivedBytes > request.maxBytes) {
      finishWithError(
        new SafeHttpError(
          "RESPONSE_TOO_LARGE",
          "The website response exceeded the audit size limit.",
        ),
      );
      return;
    }

    chunks.push(buffer);
  });
  response.once("aborted", () => {
    finishWithError(
      new SafeHttpError(
        "RESPONSE_ABORTED",
        "The website ended the response before it was complete.",
      ),
    );
  });
  response.once("error", (error) => finishWithError(error));
  response.once("end", () => finishWithResponse(Buffer.concat(chunks)));
};

/**
 * Opens a socket to the already-validated address rather than resolving the
 * hostname again. Host, SNI, and certificate verification still use the
 * original public hostname.
 */
export const pinnedNodeTransport: SafeHttpTransport = (pinnedRequest) =>
  new Promise<PinnedHttpResponse>((resolve, reject) => {
    const urlHostname = stripIpv6Brackets(pinnedRequest.url.hostname);
    const commonOptions: RequestOptions = {
      agent: false,
      family: pinnedRequest.address.family,
      headers: pinnedRequest.headers,
      hostname: pinnedRequest.address.address,
      maxHeaderSize: maximumHeaderBytes,
      method: pinnedRequest.method,
      path: `${pinnedRequest.url.pathname}${pinnedRequest.url.search}`,
      port: pinnedRequest.url.protocol === "https:" ? 443 : 80,
      signal: pinnedRequest.signal,
    };
    let settled = false;

    const finishWithError = (error: unknown) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);

      if (pinnedRequest.signal.aborted) {
        const reason = pinnedRequest.signal.reason;
        reject(
          reason instanceof Error
            ? reason
            : new SafeHttpError("ABORTED", "The website request was cancelled."),
        );
        return;
      }

      reject(
        error instanceof Error
          ? error
          : new SafeHttpError(
              "NETWORK_ERROR",
              "The website could not be reached.",
            ),
      );
    };

    const finishWithResponse = (response: PinnedHttpResponse) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      resolve(response);
    };

    const handleResponse = (response: IncomingMessage) => {
      readPinnedResponse(
        response,
        pinnedRequest,
        finishWithResponse,
        finishWithError,
      );
    };

    const request =
      pinnedRequest.url.protocol === "https:"
        ? requestHttps(
            {
              ...commonOptions,
              checkServerIdentity: (_hostname, certificate) =>
                checkServerIdentity(urlHostname, certificate),
              rejectUnauthorized: true,
              servername: isIP(urlHostname) === 0 ? urlHostname : undefined,
            },
            handleResponse,
          )
        : requestHttp(commonOptions, handleResponse);

    const timer = setTimeout(() => {
      request.destroy(
        new SafeHttpError("TIMEOUT", "The website request timed out."),
      );
    }, pinnedRequest.timeoutMs);

    request.once("error", finishWithError);
    request.once("upgrade", (_response, socket) => {
      socket.destroy();
      finishWithError(
        new SafeHttpError(
          "NETWORK_ERROR",
          "Protocol upgrades are not supported by the website audit.",
        ),
      );
    });
    request.end();
  });

const createRequestScope = (parentSignal: AbortSignal | undefined, timeoutMs: number) => {
  const controller = new AbortController();
  let timedOut = false;

  const handleParentAbort = () => {
    controller.abort(
      new SafeHttpError("ABORTED", "The website request was cancelled."),
    );
  };

  if (parentSignal?.aborted) {
    handleParentAbort();
  } else {
    parentSignal?.addEventListener("abort", handleParentAbort, { once: true });
  }

  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort(
      new SafeHttpError("TIMEOUT", "The website request timed out."),
    );
  }, timeoutMs);

  return {
    dispose() {
      clearTimeout(timer);
      parentSignal?.removeEventListener("abort", handleParentAbort);
    },
    getError() {
      return new SafeHttpError(
        timedOut ? "TIMEOUT" : "ABORTED",
        timedOut
          ? "The website request timed out."
          : "The website request was cancelled.",
      );
    },
    signal: controller.signal,
  };
};

const normalizeInjectedResponse = (
  response: PinnedHttpResponse,
  maxBytes: number,
): PinnedHttpResponse => {
  if (response.body.byteLength > maxBytes) {
    throw new SafeHttpError(
      "RESPONSE_TOO_LARGE",
      "The website response exceeded the audit size limit.",
    );
  }

  if (!Number.isInteger(response.status) || response.status < 100 || response.status > 599) {
    throw new SafeHttpError(
      "NETWORK_ERROR",
      "The website returned an invalid status.",
    );
  }

  return {
    body: Buffer.from(response.body),
    headers: normalizeResponseHeaders(response.headers),
    status: response.status,
  };
};

const requestOneHop = async (
  url: URL,
  options: {
    dependencies: SafeHttpDependencies;
    headers?: Readonly<Record<string, string>>;
    maxBytes: number;
    method: SafeHttpMethod;
    parentSignal?: AbortSignal;
    resolve?: Omit<ResolvePublicHostOptions, "signal">;
    timeoutMs: number;
  },
) => {
  const scope = createRequestScope(options.parentSignal, options.timeoutMs);

  try {
    let addresses: readonly ResolvedPublicAddress[];

    try {
      addresses = await options.dependencies.resolveHost(url.hostname, {
        ...options.resolve,
        signal: scope.signal,
        timeoutMs: Math.min(
          options.resolve?.timeoutMs ?? options.timeoutMs,
          options.timeoutMs,
        ),
      });
    } catch (error) {
      if (scope.signal.aborted) throw scope.getError();
      throw error;
    }

    if (scope.signal.aborted) throw scope.getError();

    const headers = prepareRequestHeaders(url, options.headers);
    let lastError: unknown;

    for (const address of addresses.slice(0, maximumAddressAttempts)) {
      try {
        const response = await options.dependencies.transport({
          address,
          headers,
          maxBytes: options.maxBytes,
          method: options.method,
          signal: scope.signal,
          timeoutMs: options.timeoutMs,
          url,
        });

        return normalizeInjectedResponse(response, options.maxBytes);
      } catch (error) {
        lastError = error;

        if (scope.signal.aborted) throw scope.getError();

        if (
          error instanceof SafeHttpError &&
          error.code !== "NETWORK_ERROR"
        ) {
          throw error;
        }
      }
    }

    if (lastError instanceof SafeHttpError) throw lastError;

    throw new SafeHttpError(
      "NETWORK_ERROR",
      "The website could not be reached at its validated addresses.",
    );
  } finally {
    scope.dispose();
  }
};

/**
 * Safely retrieves an untrusted public URL through manually validated and
 * IP-pinned requests. Redirects repeat the full URL and DNS policy.
 */
export async function safeHttpRequest(
  rawUrl: string | URL,
  options: SafeHttpRequestOptions = {},
): Promise<SafeHttpResponse> {
  const method = options.method ?? "GET";
  const timeoutMs = options.timeoutMs ?? defaultTimeoutMs;
  const maxBytes = options.maxBytes ?? defaultMaximumBytes;
  const maxRedirects = options.maxRedirects ?? defaultMaximumRedirects;

  if (method !== "GET" && method !== "HEAD") {
    throw new SafeHttpError(
      "INVALID_OPTIONS",
      "Only GET and HEAD requests are supported.",
    );
  }

  validatePositiveInteger(timeoutMs, "timeoutMs");
  validatePositiveInteger(maxBytes, "maxBytes");
  validateNonNegativeInteger(maxRedirects, "maxRedirects");

  const requestedUrl = parsePublicAuditUrl(rawUrl.toString());
  const allowedRedirectOrigin = options.allowedRedirectOrigin
    ? parsePublicAuditUrl(options.allowedRedirectOrigin.toString()).origin
    : undefined;

  if (
    allowedRedirectOrigin &&
    requestedUrl.origin !== allowedRedirectOrigin
  ) {
    throw new SafeHttpError(
      "REDIRECT_ORIGIN_NOT_ALLOWED",
      "The request URL is outside the allowed crawl origin.",
    );
  }

  const dependencies: SafeHttpDependencies = {
    resolveHost: options.dependencies?.resolveHost ?? resolvePublicHost,
    transport: options.dependencies?.transport ?? pinnedNodeTransport,
  };
  const redirects: SafeHttpRedirect[] = [];
  const visitedUrls = new Set([requestedUrl.href]);
  let currentUrl = requestedUrl;

  while (true) {
    const response = await requestOneHop(currentUrl, {
      dependencies,
      headers: options.headers,
      maxBytes,
      method,
      parentSignal: options.signal,
      resolve: options.resolve,
      timeoutMs,
    });

    if (!redirectStatuses.has(response.status)) {
      return {
        body: response.body,
        finalUrl: currentUrl.href,
        headers: response.headers,
        redirects: Object.freeze([...redirects]),
        requestedUrl: requestedUrl.href,
        status: response.status,
      };
    }

    const location = response.headers.location;

    if (!location) {
      throw new SafeHttpError(
        "INVALID_REDIRECT",
        "The website returned a redirect without a destination.",
      );
    }

    if (redirects.length >= maxRedirects) {
      throw new SafeHttpError(
        "TOO_MANY_REDIRECTS",
        "The website exceeded the audit redirect limit.",
      );
    }

    let unresolvedRedirectUrl: URL;

    try {
      unresolvedRedirectUrl = new URL(location, currentUrl);
    } catch {
      throw new SafeHttpError(
        "INVALID_REDIRECT",
        "The website returned an invalid redirect.",
      );
    }

    // Keep URL-policy errors intact so callers can distinguish a malformed
    // redirect from one that deliberately targets a forbidden destination.
    const redirectUrl = parsePublicAuditUrl(unresolvedRedirectUrl.href);

    if (
      allowedRedirectOrigin &&
      redirectUrl.origin !== allowedRedirectOrigin
    ) {
      throw new SafeHttpError(
        "REDIRECT_ORIGIN_NOT_ALLOWED",
        "The website redirected outside the allowed crawl origin.",
      );
    }

    if (visitedUrls.has(redirectUrl.href)) {
      throw new SafeHttpError(
        "REDIRECT_LOOP",
        "The website returned a redirect loop.",
      );
    }

    redirects.push(
      Object.freeze({
        from: currentUrl.href,
        status: response.status,
        to: redirectUrl.href,
      }),
    );
    visitedUrls.add(redirectUrl.href);
    currentUrl = redirectUrl;
  }
}
