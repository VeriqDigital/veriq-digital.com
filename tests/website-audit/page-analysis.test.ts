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

test("hidden contact links, placeholder actions, and non-contact forms do not fabricate customer routes", () => {
  const page = parsePageSnapshot({ url: "https://example.com/", statusCode: 200, html: `<html><body>
    <a hidden href="tel:+15555550100">Call us</a><a href="mailto:">Email</a>
    <a href="#">Book now</a><a href="javascript:void(0)">Request a quote</a>
    <form role="search"><input type="search"></form><form></form>
    <form><input type="email"><input type="password"></form>
    <form hidden><textarea></textarea></form>
    </body></html>` });
  assert.equal(page.contactLinkCount, 0);
  assert.equal(page.actionLinkCount, 0);
  assert.equal(page.contactFormCount, 0);
});

test("contact-like forms provide structural evidence without claiming submission works", () => {
  const page = parsePageSnapshot({ url: "https://example.com/", statusCode: 200,
    html: '<form><input type="email"><textarea></textarea><button>Send</button></form>' });
  assert.equal(page.contactFormCount, 1);
});

test("a nonempty viewport tag must declare device width to pass the mobile fundamental", () => {
  for (const [content, expected] of [["width=device-width, initial-scale=1", true], ["WIDTH = device-width", true], ["width=980", false], ["initial-scale=1", false], ["", false]] as const) {
    const page = parsePageSnapshot({ url: "https://example.com/", statusCode: 200,
      html: `<meta name="viewport" content="${content}">` });
    assert.equal(page.hasViewport, expected, content);
  }
});
