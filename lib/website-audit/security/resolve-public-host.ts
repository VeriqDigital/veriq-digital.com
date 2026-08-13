import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";
import { isPublicIp } from "./ip-policy";
import { normalizePublicHostname } from "./url-policy";

const defaultDnsTimeoutMs = 2_000;
const defaultMaximumAddresses = 16;

export type ResolvedPublicAddress = Readonly<{
  address: string;
  family: 4 | 6;
}>;

export type PublicHostLookup = (
  hostname: string,
) => Promise<readonly ResolvedPublicAddress[]>;

export type ResolvePublicHostOptions = Readonly<{
  lookup?: PublicHostLookup;
  maxAddresses?: number;
  signal?: AbortSignal;
  timeoutMs?: number;
}>;

export type PublicHostResolutionErrorCode =
  | "ABORTED"
  | "DNS_FAILED"
  | "DNS_TIMEOUT"
  | "NO_ADDRESSES"
  | "TOO_MANY_ADDRESSES"
  | "UNSAFE_ADDRESS";

export class PublicHostResolutionError extends Error {
  readonly code: PublicHostResolutionErrorCode;

  constructor(code: PublicHostResolutionErrorCode, message: string) {
    super(message);
    this.name = "PublicHostResolutionError";
    this.code = code;
  }
}

const defaultLookup: PublicHostLookup = async (hostname) => {
  const addresses = await dnsLookup(hostname, {
    all: true,
    verbatim: true,
  });

  return addresses.map(({ address, family }) => ({
    address,
    family: family as 4 | 6,
  }));
};

const validatePositiveInteger = (value: number, name: string) => {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`${name} must be a positive integer.`);
  }
};

const performLookupWithDeadline = async (
  hostname: string,
  lookup: PublicHostLookup,
  timeoutMs: number,
  signal?: AbortSignal,
) => {
  if (signal?.aborted) {
    throw new PublicHostResolutionError(
      "ABORTED",
      "Hostname resolution was cancelled.",
    );
  }

  return await new Promise<readonly ResolvedPublicAddress[]>((resolve, reject) => {
    let settled = false;

    const finish = (
      callback: () => void,
    ) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", handleAbort);
      callback();
    };

    const handleAbort = () => {
      finish(() =>
        reject(
          new PublicHostResolutionError(
            "ABORTED",
            "Hostname resolution was cancelled.",
          ),
        ),
      );
    };

    const timer = setTimeout(() => {
      finish(() =>
        reject(
          new PublicHostResolutionError(
            "DNS_TIMEOUT",
            "The website hostname took too long to resolve.",
          ),
        ),
      );
    }, timeoutMs);

    signal?.addEventListener("abort", handleAbort, { once: true });

    void lookup(hostname).then(
      (addresses) => finish(() => resolve(addresses)),
      () =>
        finish(() =>
          reject(
            new PublicHostResolutionError(
              "DNS_FAILED",
              "The website hostname could not be resolved.",
            ),
          ),
        ),
    );
  });
};

/**
 * Resolves every advertised address and rejects the hostname if even one
 * answer is private or otherwise special-use. Callers must still pin the
 * resulting address into their socket connection to avoid a second lookup.
 */
export async function resolvePublicHost(
  hostname: string,
  options: ResolvePublicHostOptions = {},
): Promise<readonly ResolvedPublicAddress[]> {
  const normalizedHostname = normalizePublicHostname(hostname);
  const literalFamily = isIP(normalizedHostname);

  if (literalFamily !== 0) {
    return Object.freeze([
      Object.freeze({
        address: normalizedHostname,
        family: literalFamily as 4 | 6,
      }),
    ]);
  }

  const timeoutMs = options.timeoutMs ?? defaultDnsTimeoutMs;
  const maxAddresses = options.maxAddresses ?? defaultMaximumAddresses;
  validatePositiveInteger(timeoutMs, "timeoutMs");
  validatePositiveInteger(maxAddresses, "maxAddresses");

  const addresses = await performLookupWithDeadline(
    normalizedHostname,
    options.lookup ?? defaultLookup,
    timeoutMs,
    options.signal,
  );

  if (addresses.length === 0) {
    throw new PublicHostResolutionError(
      "NO_ADDRESSES",
      "The website hostname did not resolve to an address.",
    );
  }

  if (addresses.length > maxAddresses) {
    throw new PublicHostResolutionError(
      "TOO_MANY_ADDRESSES",
      "The website hostname returned too many addresses.",
    );
  }

  const uniqueAddresses = new Map<string, ResolvedPublicAddress>();

  for (const candidate of addresses) {
    const detectedFamily = isIP(candidate.address);

    if (
      (detectedFamily !== 4 && detectedFamily !== 6) ||
      detectedFamily !== candidate.family ||
      !isPublicIp(candidate.address)
    ) {
      throw new PublicHostResolutionError(
        "UNSAFE_ADDRESS",
        "The website hostname resolved to a non-public address.",
      );
    }

    const normalizedCandidate = candidate.address.toLowerCase();
    uniqueAddresses.set(`${candidate.family}:${normalizedCandidate}`, {
      address: normalizedCandidate,
      family: candidate.family,
    });
  }

  return Object.freeze(
    [...uniqueAddresses.values()].map((address) => Object.freeze(address)),
  );
}

