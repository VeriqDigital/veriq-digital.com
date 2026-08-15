import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  mobileBookingObstructionSelector,
  siteFooterSelector,
} from "../../components/layout/FloatingBookingCta";

test("floating booking CTA observes only the shared site footer", async () => {
  const footerSource = await readFile("components/layout/Footer.tsx", "utf8");

  assert.equal(siteFooterSelector, "footer[data-site-footer]");
  assert.match(footerSource, /<footer[^>]+data-site-footer/);
});

test("site navbar includes the iPhone safe-area viewport and fixed cover", async () => {
  const [layoutSource, navbarSource, globalStyles] = await Promise.all([
    readFile("app/layout.tsx", "utf8"),
    readFile("components/layout/Navbar.tsx", "utf8"),
    readFile("app/globals.css", "utf8"),
  ]);

  assert.match(layoutSource, /viewportFit:\s*"cover"/);
  assert.match(navbarSource, /className="site-navbar-safe-area"/);
  assert.match(
    globalStyles,
    /\.site-navbar\s*{[\s\S]*?padding-top:\s*env\(safe-area-inset-top, 0px\)/,
  );
  assert.match(
    globalStyles,
    /\.site-navbar-safe-area\s*{[\s\S]*?position:\s*fixed[\s\S]*?height:\s*env\(safe-area-inset-top, 0px\)/,
  );
});

test("rate-limit presentation stays neutral while only genuine failures invalidate the URL", async () => {
  const [formSource, auditStyles] = await Promise.all([
    readFile("components/website-audit/AuditForm.tsx", "utf8"),
    readFile(
      "components/website-audit/website-audit.module.css",
      "utf8",
    ),
  ]);

  assert.match(formSource, /aria-invalid={formState\.status === "failed"}/);
  assert.match(formSource, /disabled={isSubmissionDisabled}/);
  assert.match(formSource, /formState\.status === "rateLimited"/);
  assert.match(formSource, /styles\.rateLimitNotice/);
  assert.equal(
    mobileBookingObstructionSelector,
    "[data-floating-booking-mobile-obstruction]",
  );
  assert.match(formSource, /data-floating-booking-mobile-obstruction/);
  assert.match(
    auditStyles,
    /\.rateLimitNotice\s*{[\s\S]*?color:\s*var\(--muted\)/,
  );
});
