"use client";

import { useEffect } from "react";
import { useReportWebVitals } from "next/web-vitals";

type ReportWebVitalsCallback = Parameters<typeof useReportWebVitals>[0];
type WebVitalsMetric = Parameters<ReportWebVitalsCallback>[0];

type RectLike = {
  height?: number;
  width?: number;
  x?: number;
  y?: number;
};

type LayoutShiftSource = {
  currentRect?: RectLike;
  node?: unknown;
  previousRect?: RectLike;
};

type WebVitalAttribution = {
  largestShiftSource?: LayoutShiftSource;
  largestShiftTarget?: string;
  largestShiftTime?: number;
  largestShiftValue?: number;
};

type DiagnosticMetric = WebVitalsMetric & {
  attribution?: WebVitalAttribution;
  navigationType?: string;
  rating?: string;
};

type WebVitalDiagnostic = {
  devicePixelRatioAtReport: number;
  id: string;
  largestShiftCurrentRect: string | null;
  largestShiftPreviousRect: string | null;
  largestShiftSource: string | null;
  largestShiftTarget: string | null;
  largestShiftTime: number | null;
  largestShiftValue: number | null;
  modalOpenAtReport: boolean;
  name: string;
  navigationType: string | null;
  rating: string | null;
  reducedMotionAtReport: boolean;
  routeAtReport: string;
  userAgentCategory: "desktop" | "mobile" | "tablet";
  userHadInteractedBeforeReport: boolean;
  value: number;
  viewportHeightAtReport: number;
  viewportWidthAtReport: number;
};

declare global {
  interface Window {
    __veriqWebVitals?: WebVitalDiagnostic[];
  }
}

let userHadInteracted = false;

const describeElement = (node: unknown) => {
  if (!(node instanceof Element)) {
    return null;
  }

  if (node.id) {
    return `#${CSS.escape(node.id)}`;
  }

  const classes = Array.from(node.classList)
    .slice(0, 2)
    .map((className) => `.${CSS.escape(className)}`)
    .join("");

  return `${node.tagName.toLowerCase()}${classes}`;
};

const describeRect = (rect?: RectLike) => {
  if (!rect) {
    return null;
  }

  const values = [rect.x, rect.y, rect.width, rect.height];

  if (values.some((value) => typeof value !== "number")) {
    return null;
  }

  return values.map((value) => Math.round(value as number)).join(",");
};

const getUserAgentCategory = (): WebVitalDiagnostic["userAgentCategory"] => {
  const userAgent = navigator.userAgent;

  if (
    /iPad|Tablet/i.test(userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  ) {
    return "tablet";
  }

  if (/Android|Mobi|iPhone|iPod/i.test(userAgent)) {
    return "mobile";
  }

  return "desktop";
};

const reportWebVitals: ReportWebVitalsCallback = (rawMetric) => {
  const metric = rawMetric as DiagnosticMetric;
  const attribution = metric.attribution;
  const source = attribution?.largestShiftSource;
  const diagnostic: WebVitalDiagnostic = {
    devicePixelRatioAtReport: window.devicePixelRatio,
    id: metric.id,
    largestShiftCurrentRect: describeRect(source?.currentRect),
    largestShiftPreviousRect: describeRect(source?.previousRect),
    largestShiftSource: describeElement(source?.node),
    largestShiftTarget: attribution?.largestShiftTarget ?? null,
    largestShiftTime: attribution?.largestShiftTime ?? null,
    largestShiftValue: attribution?.largestShiftValue ?? null,
    modalOpenAtReport:
      document.querySelector('[role="dialog"][aria-modal="true"]') !== null,
    name: metric.name,
    navigationType: metric.navigationType ?? null,
    rating: metric.rating ?? null,
    reducedMotionAtReport: window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches,
    routeAtReport: window.location.pathname,
    userAgentCategory: getUserAgentCategory(),
    userHadInteractedBeforeReport: userHadInteracted,
    value: metric.value,
    viewportHeightAtReport: window.innerHeight,
    viewportWidthAtReport: window.innerWidth,
  };

  window.__veriqWebVitals = [
    ...(window.__veriqWebVitals ?? []).slice(-49),
    diagnostic,
  ];
  window.dispatchEvent(
    new CustomEvent<WebVitalDiagnostic>("veriq:web-vital", {
      detail: diagnostic,
    }),
  );
  console.info("[Veriq web vital]", diagnostic);
};

const WebVitals = () => {
  useReportWebVitals(reportWebVitals);

  useEffect(() => {
    const markInteraction = () => {
      userHadInteracted = true;
    };

    window.addEventListener("pointerdown", markInteraction, {
      capture: true,
      once: true,
      passive: true,
    });
    window.addEventListener("keydown", markInteraction, {
      capture: true,
      once: true,
    });
    window.addEventListener("wheel", markInteraction, {
      capture: true,
      once: true,
      passive: true,
    });

    return () => {
      window.removeEventListener("pointerdown", markInteraction, true);
      window.removeEventListener("keydown", markInteraction, true);
      window.removeEventListener("wheel", markInteraction, true);
    };
  }, []);

  return null;
};

export default WebVitals;
