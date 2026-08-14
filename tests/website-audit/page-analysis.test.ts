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

test("counts actionable CTA links, buttons, submit inputs, and valid ARIA buttons", () => {
  const page = parsePageSnapshot({
    url: "https://example.com/",
    statusCode: 200,
    html: `<!doctype html><html><body>
      <a href="/contact">Contact us</a>
      <button>Get a quote</button>
      <input type="submit" value="Book an estimate">
      <div role="button" tabindex="0" aria-label="Schedule a call"></div>
    </body></html>`,
  });

  assert.equal(page.actionLinkCount, 4);
  assert.deepEqual(page.internalLinks, ["https://example.com/contact"]);
});

test("does not count disabled, hidden, inert, aria-disabled, or decorative buttons", () => {
  const page = parsePageSnapshot({
    url: "https://example.com/",
    statusCode: 200,
    html: `<!doctype html><html><body>
      <button disabled>Get a quote</button>
      <button hidden>Book now</button>
      <div inert><button>Contact us</button></div>
      <button aria-disabled="true">Schedule a call</button>
      <button style="display: none">Request an estimate</button>
      <a href="/contact" hidden>Contact us</a>
      <div role="button">Get started</div>
      <div role="button" tabindex="-1">Buy now</div>
    </body></html>`,
  });

  assert.equal(page.actionLinkCount, 0);
});
