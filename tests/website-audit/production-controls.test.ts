import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeDistributedLimit,
  DistributedLimitUnavailableError,
} from "../../lib/website-audit/distributed-rate-limit";
import { getWebsiteAuditRuntimeConfig } from "../../lib/website-audit/runtime-config";

test("production feature gate defaults closed when launch controls are missing", () => {
  const config = getWebsiteAuditRuntimeConfig({ NODE_ENV: "production" });

  assert.equal(config.enabled, false);
  assert.equal(config.discoverable, false);
  assert.ok(config.missingProductionConfiguration.includes("UPSTASH_REDIS_REST_URL"));
  assert.ok(config.missingProductionConfiguration.includes("CRON_SECRET"));
});

test("production feature gate opens only with complete bounded configuration", () => {
  const config = getWebsiteAuditRuntimeConfig({
    NODE_ENV: "production",
    WEBSITE_AUDIT_ENABLED: "true",
    WEBSITE_AUDIT_DISCOVERY_ENABLED: "true",
    BLOB_READ_WRITE_TOKEN: "blob",
    GOOGLE_PAGESPEED_API_KEY: "pagespeed",
    RESEND_API_KEY: "resend",
    EMAIL_FROM: "sender@example.com",
    UPSTASH_REDIS_REST_URL: "https://redis.example.com",
    UPSTASH_REDIS_REST_TOKEN: "redis-token",
    WEBSITE_AUDIT_HASH_SECRET: "x".repeat(32),
    WEBSITE_AUDIT_RETENTION_DAYS: "30",
    WEBSITE_AUDIT_DAILY_RUN_LIMIT: "100",
    WEBSITE_AUDIT_DAILY_EMAIL_LIMIT: "100",
    CRON_SECRET: "y".repeat(16),
  });

  assert.equal(config.enabled, true);
  assert.equal(config.discoverable, true);
  assert.deepEqual(config.missingProductionConfiguration, []);
});

test("distributed limiter uses one atomic Redis script and returns TTL", async () => {
  let command: unknown;
  const result = await consumeDistributedLimit({
    key: "website-audit:test:key",
    windowMs: 60_000,
    redisUrl: "https://redis.example.com",
    redisToken: "secret",
    fetchImplementation: async (_input, init) => {
      command = JSON.parse(String(init?.body));
      return Response.json({ result: [3, 42_000] });
    },
  });

  assert.equal((command as unknown[])[0], "EVAL");
  assert.equal((command as unknown[])[3], "website-audit:test:key");
  assert.deepEqual(result, { count: 3, retryAfterSeconds: 42 });
});

test("distributed limiter fails closed on provider errors", async () => {
  await assert.rejects(
    consumeDistributedLimit({
      key: "website-audit:test:key",
      windowMs: 60_000,
      redisUrl: "https://redis.example.com",
      redisToken: "secret",
      fetchImplementation: async () =>
        Response.json({ error: "provider unavailable" }, { status: 503 }),
    }),
    DistributedLimitUnavailableError,
  );
});
