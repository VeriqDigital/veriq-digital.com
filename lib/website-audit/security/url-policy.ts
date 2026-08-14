import { isIP } from "node:net";
import { isPublicIp } from "./ip-policy";

const maximumUrlLength = 2_048;
const hostnameLabelPattern = /^[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;
const blockedHostnameSuffixes = [
  ".arpa",
  ".example",
  ".home",
  ".internal",
  ".invalid",
  ".lan",
  ".local",
  ".localhost",
  ".onion",
  ".test",
] as const;

export type PublicUrlErrorCode =
  | "INVALID_URL"
  | "UNSUPPORTED_PROTOCOL"
  | "UNSAFE_CREDENTIALS"
  | "UNSAFE_HOSTNAME"
  | "UNSAFE_IP"
  | "UNSAFE_PORT";

export class PublicUrlError extends Error {
  readonly code: PublicUrlErrorCode;

  constructor(code: PublicUrlErrorCode, message: string) {
    super(message);
    this.name = "PublicUrlError";
    this.code = code;
  }
}

const stripIpv6Brackets = (hostname: string) =>
  hostname.startsWith("[") && hostname.endsWith("]")
    ? hostname.slice(1, -1)
    : hostname;

/**
 * Normalizes and validates a hostname without performing DNS resolution.
 * DNS results still have to pass `resolvePublicHost` before any connection.
 */
export function normalizePublicHostname(hostname: string): string {
  const unwrappedHostname = stripIpv6Brackets(hostname.trim().toLowerCase());
  const normalizedHostname = unwrappedHostname.endsWith(".")
    ? unwrappedHostname.slice(0, -1)
    : unwrappedHostname;

  if (!normalizedHostname || normalizedHostname.endsWith(".")) {
    throw new PublicUrlError(
      "UNSAFE_HOSTNAME",
      "The website hostname is not valid.",
    );
  }

  const family = isIP(normalizedHostname);

  if (family !== 0) {
    if (!isPublicIp(normalizedHostname)) {
      throw new PublicUrlError(
        "UNSAFE_IP",
        "The website must resolve to a public internet address.",
      );
    }

    return normalizedHostname;
  }

  if (
    normalizedHostname.length > 253 ||
    !normalizedHostname.includes(".") ||
    blockedHostnameSuffixes.some(
      (suffix) =>
        normalizedHostname === suffix.slice(1) ||
        normalizedHostname.endsWith(suffix),
    )
  ) {
    throw new PublicUrlError(
      "UNSAFE_HOSTNAME",
      "The website must use a public domain name.",
    );
  }

  const labels = normalizedHostname.split(".");

  if (labels.some((label) => !hostnameLabelPattern.test(label))) {
    throw new PublicUrlError(
      "UNSAFE_HOSTNAME",
      "The website hostname is not valid.",
    );
  }

  return normalizedHostname;
}

/**
 * Parses an untrusted audit target. This is intentionally independent of the
 * client-side URL helper, which is only a usability aid.
 */
export function parsePublicAuditUrl(raw: string): URL {
  const trimmedValue = raw.trim();

  if (
    !trimmedValue ||
    trimmedValue.length > maximumUrlLength ||
    /[\u0000-\u001f\u007f\\]/.test(trimmedValue) ||
    /\s/.test(trimmedValue)
  ) {
    throw new PublicUrlError("INVALID_URL", "Enter a valid website URL.");
  }

  const valueWithProtocol = /^[a-z][a-z\d+.-]*:/i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(valueWithProtocol);
  } catch {
    throw new PublicUrlError("INVALID_URL", "Enter a valid website URL.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new PublicUrlError(
      "UNSUPPORTED_PROTOCOL",
      "Only HTTP and HTTPS website URLs can be audited.",
    );
  }

  if (parsedUrl.username || parsedUrl.password) {
    throw new PublicUrlError(
      "UNSAFE_CREDENTIALS",
      "Website URLs containing credentials cannot be audited.",
    );
  }

  // WHATWG URL removes explicit default ports. Any remaining port is custom.
  if (parsedUrl.port) {
    throw new PublicUrlError(
      "UNSAFE_PORT",
      "Only standard HTTP and HTTPS ports can be audited.",
    );
  }

  const normalizedHostname = normalizePublicHostname(parsedUrl.hostname);

  if (isIP(normalizedHostname) === 0) {
    parsedUrl.hostname = normalizedHostname;
  }

  parsedUrl.hash = "";

  return parsedUrl;
}

