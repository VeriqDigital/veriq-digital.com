"use client";

import { Analytics } from "@vercel/analytics/next";
import type { BeforeSendEvent } from "@vercel/analytics/next";
import { sanitizeAnalyticsUrl } from "./analytics-privacy";

const sanitizeEvent = (event: BeforeSendEvent): BeforeSendEvent => ({
  ...event,
  url: sanitizeAnalyticsUrl(event.url),
});

export default function PrivacyAwareAnalytics() {
  return <Analytics beforeSend={sanitizeEvent} />;
}
