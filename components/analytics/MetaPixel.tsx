"use client";

import { usePathname } from "next/navigation";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import { analyticsConfig } from "@/config/analytics";
import { isWebsiteAuditReportPath } from "./analytics-privacy";

type MetaPixelFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    fbq?: MetaPixelFunction;
  }
}

const pixelId = analyticsConfig.metaPixelId;

const pixelBootstrap = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init',${JSON.stringify(pixelId)});`;

const MetaPixel = () => {
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);
  const lastTrackedPath = useRef<string | null>(null);
  const isAuditReport = isWebsiteAuditReportPath(pathname);

  useEffect(() => {
    if (
      isAuditReport ||
      !isReady ||
      !window.fbq ||
      !pathname ||
      lastTrackedPath.current === pathname
    ) {
      return;
    }

    window.fbq("track", "PageView");
    lastTrackedPath.current = pathname;
  }, [isAuditReport, isReady, pathname]);

  if (isAuditReport) {
    return null;
  }

  return (
    <>
      <Script
        id="meta-pixel"
        strategy="afterInteractive"
        onReady={() => setIsReady(true)}
      >
        {pixelBootstrap}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          className="hidden"
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

export default MetaPixel;
