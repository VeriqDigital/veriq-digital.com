export type WebsiteUrlValidation =
  | { ok: true; normalizedUrl: string }
  | { ok: false; message: string };

const hostnamePattern = /^(?=.{1,253}$)(?:[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?\.)+[a-z\d](?:[a-z\d-]{0,61}[a-z\d])?$/i;

export function normalizeWebsiteUrl(value: string): WebsiteUrlValidation {
  const trimmedValue = value.trim();

  if (!trimmedValue) {
    return { ok: false, message: "Enter the website you want to audit." };
  }

  if (/\s/.test(trimmedValue)) {
    return {
      ok: false,
      message: "Use a website address without spaces, like example.com.",
    };
  }

  const valueWithProtocol = /^[a-z][a-z\d+.-]*:\/\//i.test(trimmedValue)
    ? trimmedValue
    : `https://${trimmedValue}`;

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(valueWithProtocol);
  } catch {
    return {
      ok: false,
      message: "Enter a valid website address, like example.com.",
    };
  }

  if (!(["http:", "https:"] as const).includes(parsedUrl.protocol as "http:" | "https:")) {
    return {
      ok: false,
      message: "Website addresses must begin with http:// or https://.",
    };
  }

  if (
    parsedUrl.username ||
    parsedUrl.password ||
    !hostnamePattern.test(parsedUrl.hostname)
  ) {
    return {
      ok: false,
      message: "Enter a public website domain, like example.com.",
    };
  }

  parsedUrl.hash = "";

  return { ok: true, normalizedUrl: parsedUrl.toString() };
}

