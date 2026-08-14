import assert from "node:assert/strict";
import test from "node:test";
import {
  isFirstPartyLinkProbeCandidate,
  isOptionalPageCandidate,
} from "../../lib/website-audit/crawler";

const origin = "https://example.com";

test("optional crawl policy stays same-origin and skips sensitive or encoded paths", () => {
  for (const value of [
    "https://example.com/logout",
    "https://example.com/%6cogout",
    "https://example.com/%256cogout",
    "https://example.com/account/settings",
    "https://example.com/services?preview=1",
    "https://other.example/services",
    "https://example.com/brochure.pdf",
  ]) {
    assert.equal(isOptionalPageCandidate(new URL(value), origin), false, value);
  }

  assert.equal(
    isOptionalPageCandidate(new URL("https://example.com/services"), origin),
    true,
  );
});

test("link probes avoid sensitive and query URLs without excluding static links", () => {
  assert.equal(
    isFirstPartyLinkProbeCandidate(
      new URL("https://example.com/%61dmin/users"),
      origin,
    ),
    false,
  );
  assert.equal(
    isFirstPartyLinkProbeCandidate(
      new URL("https://example.com/contact?logout=true"),
      origin,
    ),
    false,
  );
  assert.equal(
    isFirstPartyLinkProbeCandidate(
      new URL("https://example.com/download.pdf"),
      origin,
    ),
    true,
  );
});

