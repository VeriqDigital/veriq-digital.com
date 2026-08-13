"use client";

import { SpeedInsights } from "@vercel/speed-insights/next";
import type { SpeedInsightsProps } from "@vercel/speed-insights";
import {
  isWebsiteAuditReportUrl,
  sanitizeAnalyticsUrl,
  websiteAuditReportRoute,
} from "./analytics-privacy";

const sanitizeEvent: NonNullable<SpeedInsightsProps["beforeSend"]> = (
  event,
) => {
  const isAuditReport = isWebsiteAuditReportUrl(event.url);

  return {
    ...event,
    url: sanitizeAnalyticsUrl(event.url),
    route: isAuditReport ? websiteAuditReportRoute : event.route,
  };
};

export default function PrivacyAwareSpeedInsights() {
  return <SpeedInsights beforeSend={sanitizeEvent} />;
}
