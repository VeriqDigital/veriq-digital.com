import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import {
  clearPendingWebsiteAudit,
  readPendingWebsiteAudit,
  savePendingWebsiteAudit,
} from "../../components/website-audit/pending-audit";

const auditId = "0f734c3d-7a37-4bd2-98ab-88ff5f059f83";
const pending = {
  id: auditId,
  normalizedUrl: "https://example.com/",
  createdAt: Date.parse("2026-08-14T00:00:00.000Z"),
};
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

const setWindow = (value: object) => {
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value,
  });
};

afterEach(() => {
  if (originalWindow) {
    Object.defineProperty(globalThis, "window", originalWindow);
  } else {
    Reflect.deleteProperty(globalThis, "window");
  }
});

test("pending-audit helpers remain safe during SSR and denied storage access", () => {
  Reflect.deleteProperty(globalThis, "window");
  assert.doesNotThrow(() => savePendingWebsiteAudit(pending));
  assert.equal(readPendingWebsiteAudit(auditId), null);
  assert.doesNotThrow(() => clearPendingWebsiteAudit(auditId));

  setWindow({
    get sessionStorage() {
      throw new DOMException("denied", "SecurityError");
    },
  });
  assert.doesNotThrow(() => savePendingWebsiteAudit(pending));
  assert.equal(readPendingWebsiteAudit(auditId), null);
  assert.doesNotThrow(() => clearPendingWebsiteAudit(auditId));
});

test("pending-audit save and read failures are best-effort", () => {
  setWindow({
    sessionStorage: {
      setItem() {
        throw new DOMException("full", "QuotaExceededError");
      },
      getItem() {
        throw new DOMException("denied", "SecurityError");
      },
      removeItem() {},
    },
  });

  assert.doesNotThrow(() => savePendingWebsiteAudit(pending));
  assert.equal(readPendingWebsiteAudit(auditId), null);
});

test("pending-audit cleanup ignores remove failures", () => {
  setWindow({
    sessionStorage: {
      setItem() {},
      getItem() {
        return "not-json";
      },
      removeItem() {
        throw new DOMException("denied", "SecurityError");
      },
    },
  });

  assert.equal(readPendingWebsiteAudit(auditId), null);
  assert.doesNotThrow(() => clearPendingWebsiteAudit(auditId));
});
