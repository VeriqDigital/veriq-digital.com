import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";
import { isWebsiteAuditDiscoverable } from "@/lib/website-audit/runtime-config";

export default function robots(): MetadataRoute.Robots {
  if (process.env.VERCEL_ENV === "preview") {
    return {
      rules: {
        userAgent: "*",
        allow: "/",
      },
    };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: isWebsiteAuditDiscoverable()
        ? "/api/"
        : ["/api/", "/website-audit"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
