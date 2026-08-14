import type { PageSnapshot } from "./page-analysis";

export type ResourceDiscoveryStatus = "present" | "missing" | "unavailable";

export type CrawlAuditData = Readonly<{
  submittedUrl: string;
  finalUrl: string;
  redirectCount: number;
  primaryPage: PageSnapshot;
  pages: readonly PageSnapshot[];
  robots: Readonly<{
    status: ResourceDiscoveryStatus;
    blocksPrimaryPage: boolean;
    blocksOptionalCrawl: boolean;
    sitemapUrl: string | null;
  }>;
  sitemapStatus: ResourceDiscoveryStatus;
  brokenLinks: Readonly<{
    tested: number;
    broken: readonly Readonly<{ url: string; statusCode: number }>[];
    unavailable: number;
  }>;
}>;

