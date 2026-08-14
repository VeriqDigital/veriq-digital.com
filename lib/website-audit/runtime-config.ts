import { getWebsiteAuditBlobAuthOptions } from "./blob-config";

const positiveInteger = (value: string | undefined, maximum: number) => {
  const parsed = Number(value);

  return Number.isSafeInteger(parsed) && parsed > 0 && parsed <= maximum
    ? parsed
    : null;
};

export type WebsiteAuditRuntimeConfig = Readonly<{
  enabled: boolean;
  discoverable: boolean;
  retentionDays: number;
  dailyRunLimit: number | null;
  dailyEmailLimit: number | null;
  redisUrl: string | null;
  redisToken: string | null;
  hashSecret: string | null;
  missingProductionConfiguration: readonly string[];
}>;

export function getWebsiteAuditRuntimeConfig(
  environment: NodeJS.ProcessEnv = process.env,
): WebsiteAuditRuntimeConfig {
  const production = environment.NODE_ENV === "production";
  const redisUrl = environment.UPSTASH_REDIS_REST_URL?.trim() || null;
  const redisToken = environment.UPSTASH_REDIS_REST_TOKEN?.trim() || null;
  const hashSecret = environment.WEBSITE_AUDIT_HASH_SECRET?.trim() || null;
  const retentionDays = positiveInteger(
    environment.WEBSITE_AUDIT_RETENTION_DAYS,
    90,
  );
  const dailyRunLimit = positiveInteger(
    environment.WEBSITE_AUDIT_DAILY_RUN_LIMIT,
    10_000,
  );
  const dailyEmailLimit = positiveInteger(
    environment.WEBSITE_AUDIT_DAILY_EMAIL_LIMIT,
    10_000,
  );
  const missingProductionConfiguration = production
    ? [
        environment.WEBSITE_AUDIT_ENABLED === "true"
          ? null
          : "WEBSITE_AUDIT_ENABLED",
        getWebsiteAuditBlobAuthOptions(environment)
          ? null
          : "BLOB_STORE_ID or BLOB_READ_WRITE_TOKEN",
        environment.GOOGLE_PAGESPEED_API_KEY?.trim()
          ? null
          : "GOOGLE_PAGESPEED_API_KEY",
        environment.RESEND_API_KEY?.trim() ? null : "RESEND_API_KEY",
        environment.EMAIL_FROM?.trim() ? null : "EMAIL_FROM",
        redisUrl ? null : "UPSTASH_REDIS_REST_URL",
        redisToken ? null : "UPSTASH_REDIS_REST_TOKEN",
        hashSecret && hashSecret.length >= 32
          ? null
          : "WEBSITE_AUDIT_HASH_SECRET",
        retentionDays ? null : "WEBSITE_AUDIT_RETENTION_DAYS",
        dailyRunLimit ? null : "WEBSITE_AUDIT_DAILY_RUN_LIMIT",
        dailyEmailLimit ? null : "WEBSITE_AUDIT_DAILY_EMAIL_LIMIT",
        environment.CRON_SECRET?.trim() &&
        environment.CRON_SECRET.trim().length >= 16
          ? null
          : "CRON_SECRET",
      ].filter((value): value is string => value !== null)
    : [];
  const enabled = !production || missingProductionConfiguration.length === 0;

  return {
    enabled,
    discoverable:
      enabled && environment.WEBSITE_AUDIT_DISCOVERY_ENABLED === "true",
    retentionDays: retentionDays ?? 30,
    dailyRunLimit,
    dailyEmailLimit,
    redisUrl,
    redisToken,
    hashSecret,
    missingProductionConfiguration,
  };
}

export const isWebsiteAuditEnabled = () =>
  getWebsiteAuditRuntimeConfig().enabled;

export const isWebsiteAuditDiscoverable = () =>
  getWebsiteAuditRuntimeConfig().discoverable;
