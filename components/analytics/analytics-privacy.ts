export const websiteAuditReportRoute = "/website-audit/report/[id]";

const websiteAuditReportPathPattern =
  /^\/website-audit\/report\/[^/]+\/?$/;

export function isWebsiteAuditReportPath(pathname: string | null | undefined) {
  return Boolean(pathname && websiteAuditReportPathPattern.test(pathname));
}

export function isWebsiteAuditReportUrl(value: string) {
  try {
    return isWebsiteAuditReportPath(
      new URL(value, "https://analytics.invalid").pathname,
    );
  } catch {
    return false;
  }
}

export function sanitizeAnalyticsUrl(value: string) {
  try {
    const isAbsoluteUrl = /^[a-z][a-z\d+.-]*:\/\//i.test(value);
    const url = new URL(value, "https://analytics.invalid");

    if (isWebsiteAuditReportPath(url.pathname)) {
      url.pathname = websiteAuditReportRoute;
    }

    url.search = "";
    url.hash = "";

    return isAbsoluteUrl ? url.toString() : url.pathname;
  } catch {
    const pathWithoutQuery = value.split(/[?#]/, 1)[0];

    return pathWithoutQuery.replace(
      /\/website-audit\/report\/[^/]+\/?$/,
      websiteAuditReportRoute,
    );
  }
}
