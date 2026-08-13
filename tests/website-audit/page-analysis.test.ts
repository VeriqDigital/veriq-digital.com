import assert from "node:assert/strict";
import test from "node:test";
import { parsePageSnapshot } from "../../lib/website-audit/page-analysis";

test("page analysis combines header robots directives and ignores empty H1 text", () => {
  const page = parsePageSnapshot({
    url: "https://example.com/",
    statusCode: 200,
    robotsHeader: "noindex, nofollow",
    html: `<!doctype html>
      <html lang="en">
        <head><title>Example</title><meta name="robots" content="noimageindex"></head>
        <body><h1> </h1><h2>Useful section</h2></body>
      </html>`,
  });

  assert.deepEqual(page.h1s, []);
  assert.deepEqual([...page.robotsDirectives].sort(), [
    "nofollow",
    "noimageindex",
    "noindex",
  ]);
});
