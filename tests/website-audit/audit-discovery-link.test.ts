import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import WebsiteAuditDiscoveryLink from "../../components/resources/WebsiteAuditDiscoveryLink";

test("contextual audit links follow the shared server discovery decision", () => {
  const hidden = renderToStaticMarkup(
    createElement(
      WebsiteAuditDiscoveryLink,
      { discoverable: false },
      "free website audit preview",
    ),
  );
  const visible = renderToStaticMarkup(
    createElement(
      WebsiteAuditDiscoveryLink,
      { discoverable: true },
      "free website audit preview",
    ),
  );

  assert.equal(hidden, "free website audit preview");
  assert.match(visible, /href="\/website-audit"/);
});
