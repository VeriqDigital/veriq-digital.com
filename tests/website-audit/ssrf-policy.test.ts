import assert from "node:assert/strict";
import test from "node:test";
import {
  isPublicIp,
  parsePublicAuditUrl,
  PublicHostResolutionError,
  PublicUrlError,
  resolvePublicHost,
} from "../../lib/website-audit/security";

test("parsePublicAuditUrl normalizes a public domain and default ports", () => {
  assert.equal(
    parsePublicAuditUrl("  example.com/path#section  ").href,
    "https://example.com/path",
  );
  assert.equal(
    parsePublicAuditUrl("http://example.com:80/").href,
    "http://example.com/",
  );
  assert.equal(
    parsePublicAuditUrl("https://example.com.:443/").href,
    "https://example.com/",
  );
});

test("parsePublicAuditUrl rejects unsafe protocols, credentials, ports, and names", () => {
  const cases = [
    "file:///etc/passwd",
    "ftp://example.com/file",
    "https://user:password@example.com/",
    "https://example.com:8443/",
    "http://localhost/",
    "http://service.internal/",
    "http://printer.local./",
    "http://single-label/",
    "http://bad_label.example.com/",
  ];

  for (const value of cases) {
    assert.throws(
      () => parsePublicAuditUrl(value),
      (error: unknown) => error instanceof PublicUrlError,
      value,
    );
  }
});

test("parsePublicAuditUrl rejects canonical and mapped loopback spellings", () => {
  const cases = [
    "http://127.0.0.1/",
    "http://127.1/",
    "http://2130706433/",
    "http://0177.0.0.1/",
    "http://0x7f000001/",
    "http://[::1]/",
    "http://[::ffff:127.0.0.1]/",
  ];

  for (const value of cases) {
    assert.throws(
      () => parsePublicAuditUrl(value),
      (error: unknown) =>
        error instanceof PublicUrlError && error.code === "UNSAFE_IP",
      value,
    );
  }
});

test("isPublicIp rejects private, reserved, metadata, and transition ranges", () => {
  const blockedAddresses = [
    "0.0.0.0",
    "10.0.0.1",
    "100.100.100.200",
    "127.255.255.255",
    "168.63.129.16",
    "169.254.169.254",
    "172.31.255.255",
    "192.0.2.1",
    "192.168.1.1",
    "198.18.0.1",
    "198.51.100.1",
    "203.0.113.1",
    "224.0.0.1",
    "255.255.255.255",
    "::",
    "::1",
    "::ffff:8.8.8.8",
    "64:ff9b::808:808",
    "2001:db8::1",
    "2002:7f00:1::",
    "3fff::1",
    "fc00::1",
    "fe80::1",
    "ff02::1",
  ];

  for (const address of blockedAddresses) {
    assert.equal(isPublicIp(address), false, address);
  }

  assert.equal(isPublicIp("8.8.8.8"), true);
  assert.equal(isPublicIp("93.184.216.34"), true);
  assert.equal(isPublicIp("2606:4700:4700::1111"), true);
});

test("isPublicIp handles important IPv4 range boundaries", () => {
  assert.equal(isPublicIp("9.255.255.255"), true);
  assert.equal(isPublicIp("10.0.0.0"), false);
  assert.equal(isPublicIp("100.63.255.255"), true);
  assert.equal(isPublicIp("100.64.0.0"), false);
  assert.equal(isPublicIp("100.127.255.255"), false);
  assert.equal(isPublicIp("100.128.0.0"), true);
  assert.equal(isPublicIp("172.15.255.255"), true);
  assert.equal(isPublicIp("172.16.0.0"), false);
  assert.equal(isPublicIp("172.31.255.255"), false);
  assert.equal(isPublicIp("172.32.0.0"), true);
});

test("resolvePublicHost rejects a mixed public and private DNS answer", async () => {
  await assert.rejects(
    resolvePublicHost("mixed.example.com", {
      lookup: async () => [
        { address: "93.184.216.34", family: 4 },
        { address: "10.0.0.8", family: 4 },
      ],
    }),
    (error: unknown) =>
      error instanceof PublicHostResolutionError &&
      error.code === "UNSAFE_ADDRESS",
  );
});

test("resolvePublicHost deduplicates validated answers", async () => {
  const result = await resolvePublicHost("safe.example.com", {
    lookup: async () => [
      { address: "93.184.216.34", family: 4 },
      { address: "93.184.216.34", family: 4 },
      { address: "2606:4700:4700::1111", family: 6 },
    ],
  });

  assert.deepEqual(result, [
    { address: "93.184.216.34", family: 4 },
    { address: "2606:4700:4700::1111", family: 6 },
  ]);
});

test("resolvePublicHost does not invoke DNS for a validated public literal", async () => {
  let lookupCalls = 0;
  const result = await resolvePublicHost("93.184.216.34", {
    lookup: async () => {
      lookupCalls += 1;
      return [];
    },
  });

  assert.deepEqual(result, [{ address: "93.184.216.34", family: 4 }]);
  assert.equal(lookupCalls, 0);
});

