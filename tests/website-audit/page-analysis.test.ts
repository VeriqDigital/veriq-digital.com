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

test("separates destination-backed CTA links from unverified buttons and ARIA controls", () => {
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

  assert.equal(page.actionLinkCount, 1);
  assert.equal(page.unverifiedActionControlCount, 3);
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
  assert.equal(page.unverifiedActionControlCount, 0);
});

const parseBody = (html: string) => parsePageSnapshot({ url: "https://example.com/", statusCode: 200, html });

test("a bare Book now button has intent but no verified structural action path", () => {
  for (const html of ['<button>Book now</button>', '<button onclick="book()">Book now</button>', '<div role="button" tabindex="0">Book now</div>']) {
    const page = parseBody(html);
    assert.equal(page.actionLinkCount, 0);
    assert.equal(page.unverifiedActionControlCount, 1);
  }
});

test("meaningful booking, telephone and email anchors establish structural paths", () => {
  for (const href of ["/book", "tel:+15555550100", "mailto:hello@example.com"]) {
    const page = parseBody(`<a href="${href}">${href === "/book" ? "Book now" : "Reach us"}</a>`);
    assert.equal(page.actionLinkCount, 1);
    assert.equal(page.unverifiedActionControlCount, 0);
  }
});

test("native submit controls require a relevant form owner and submission method", () => {
  const form = '<form id="quote" action="/inquiries" method="post"><input type="email"><textarea></textarea>';
  for (const button of ['<button>Send</button>', '<button type="submit">Request a quote</button>', '<input type="submit" value="Send">']) {
    assert.equal(parseBody(form + button + '</form>').actionLinkCount, 1);
  }
  assert.equal(parseBody(form + '</form><button form="quote">Send</button>').actionLinkCount, 1);
  assert.equal(parseBody('<form action=""><textarea></textarea><button>Send</button></form>').actionLinkCount, 1);
  for (const button of ['<button type="button">Request a quote</button>', '<button form="missing">Request a quote</button>', '<button formmethod="dialog">Request a quote</button>', '<button formaction="javascript:void(0)">Request a quote</button>']) {
    const page = parseBody(form + button + '</form>');
    assert.equal(page.actionLinkCount, 0);
    assert.equal(page.unverifiedActionControlCount, 1);
  }
});

test("newsletter, signup, login, search and account forms cannot establish direct contact credit", () => {
  for (const form of [
    '<form><input type="email"><button>Subscribe to our newsletter</button></form>',
    '<form aria-label="Newsletter"><input type="email"><input type="tel"><button>Submit</button></form>',
    '<form action="/signup"><input type="email"><button>Sign up</button></form>',
    '<form><input type="email"><input type="password"><button>Log in</button></form>',
    '<form role="search"><input type="text"><button>Search</button></form>',
    '<form><input type="search"><button>Find</button></form>',
    '<form aria-label="Create account"><input type="email"><button>Get started</button></form>',
    '<form><input type="email"><button>Request a password reset</button></form>',
  ]) {
    const page = parseBody(form);
    assert.equal(page.contactFormCount, 0, form);
    assert.equal(page.unverifiedContactFormCount, 0, form);
    assert.equal(page.actionLinkCount, 0, form);
  }
});

test("contact and quote forms use inquiry fields or form-specific intent", () => {
  for (const form of [
    '<form><input type="email"><textarea></textarea><button>Send</button></form>',
    '<form><input type="email"><button>Request a quote</button></form>',
    '<form aria-label="Contact us"><input name="name"><button>Send</button></form>',
    '<form><input type="tel"><button>Request a callback</button></form>',
    '<form><input type="email"><textarea></textarea><label><input type="checkbox">Subscribe to newsletter</label><button>Send message</button></form>',
  ]) {
    const page = parseBody(form);
    assert.equal(page.contactFormCount, 1, form);
    assert.equal(page.actionLinkCount, 1, form);
  }
});

test("an email-only form with ambiguous purpose stays unverified", () => {
  for (const field of ['<input type="email">', '<input name="details">']) {
    const page = parseBody(`<form>${field}<button>Continue</button></form>`);
    assert.equal(page.contactFormCount, 0);
    assert.equal(page.unverifiedContactFormCount, 1);
    assert.equal(page.actionLinkCount, 0);
  }
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
