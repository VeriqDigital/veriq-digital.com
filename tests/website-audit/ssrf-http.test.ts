import assert from "node:assert/strict";
import test from "node:test";
import {
  SafeHttpError,
  safeHttpRequest,
  type PinnedHttpRequest,
  type SafeHostResolver,
  type SafeHttpTransport,
} from "../../lib/website-audit/http";
import { PublicUrlError } from "../../lib/website-audit/security";

const publicAddress = Object.freeze({
  address: "93.184.216.34",
  family: 4 as const,
});

const publicResolver: SafeHostResolver = async () => [publicAddress];

test("safeHttpRequest passes a validated IP to transport and preserves Host", async () => {
  let observedRequest: PinnedHttpRequest | undefined;
  const transport: SafeHttpTransport = async (request) => {
    observedRequest = request;
    return {
      body: Buffer.from("<html>safe</html>"),
      headers: { "content-type": "text/html" },
      status: 200,
    };
  };

  const response = await safeHttpRequest("https://example.com/a?b=1", {
    dependencies: { resolveHost: publicResolver, transport },
  });

  assert.equal(observedRequest?.address, publicAddress);
  assert.equal(observedRequest?.headers.host, "example.com");
  assert.equal(observedRequest?.headers.cookie, undefined);
  assert.equal(observedRequest?.url.href, "https://example.com/a?b=1");
  assert.equal(response.requestedUrl, "https://example.com/a?b=1");
  assert.equal(response.finalUrl, "https://example.com/a?b=1");
  assert.equal(response.body.toString(), "<html>safe</html>");
});

test("safeHttpRequest revalidates and pins each redirect target", async () => {
  const resolvedHostnames: string[] = [];
  const requestedUrls: string[] = [];
  const resolver: SafeHostResolver = async (hostname) => {
    resolvedHostnames.push(hostname);
    return [publicAddress];
  };
  const transport: SafeHttpTransport = async (request) => {
    requestedUrls.push(request.url.href);

    if (request.url.pathname === "/start") {
      return {
        body: Buffer.alloc(0),
        headers: { location: "https://www.example.com/done" },
        status: 301,
      };
    }

    return {
      body: Buffer.from("done"),
      headers: {} as Record<string, string>,
      status: 200,
    };
  };

  const response = await safeHttpRequest("https://example.com/start", {
    dependencies: { resolveHost: resolver, transport },
  });

  assert.deepEqual(resolvedHostnames, ["example.com", "www.example.com"]);
  assert.deepEqual(requestedUrls, [
    "https://example.com/start",
    "https://www.example.com/done",
  ]);
  assert.equal(response.finalUrl, "https://www.example.com/done");
  assert.deepEqual(response.redirects, [
    {
      from: "https://example.com/start",
      status: 301,
      to: "https://www.example.com/done",
    },
  ]);
});

test("safeHttpRequest rejects a redirect to an obfuscated loopback before resolving it", async () => {
  let resolverCalls = 0;
  const resolver: SafeHostResolver = async () => {
    resolverCalls += 1;
    return [publicAddress];
  };
  const transport: SafeHttpTransport = async () => ({
    body: Buffer.alloc(0),
    headers: { location: "http://2130706433/latest/meta-data" },
    status: 302,
  });

  await assert.rejects(
    safeHttpRequest("https://example.com/", {
      dependencies: { resolveHost: resolver, transport },
    }),
    (error: unknown) =>
      error instanceof PublicUrlError && error.code === "UNSAFE_IP",
  );
  assert.equal(resolverCalls, 1);
});

test("safeHttpRequest enforces an exact redirect origin", async () => {
  const transport: SafeHttpTransport = async () => ({
    body: Buffer.alloc(0),
    headers: { location: "https://other.example.com/landing" },
    status: 302,
  });

  await assert.rejects(
    safeHttpRequest("https://example.com/start", {
      allowedRedirectOrigin: "https://example.com",
      dependencies: { resolveHost: publicResolver, transport },
    }),
    (error: unknown) =>
      error instanceof SafeHttpError &&
      error.code === "REDIRECT_ORIGIN_NOT_ALLOWED",
  );
});

test("safeHttpRequest rejects custom-port and non-HTTP redirect targets", async () => {
  for (const location of [
    "https://example.com:8443/private",
    "file:///etc/passwd",
  ]) {
    const transport: SafeHttpTransport = async () => ({
      body: Buffer.alloc(0),
      headers: { location },
      status: 302,
    });

    await assert.rejects(
      safeHttpRequest("https://example.com/start", {
        dependencies: { resolveHost: publicResolver, transport },
      }),
      (error: unknown) => error instanceof PublicUrlError,
      location,
    );
  }
});

test("safeHttpRequest stops redirect loops and redirect chains over the cap", async () => {
  const loopingTransport: SafeHttpTransport = async (request) => ({
    body: Buffer.alloc(0),
    headers: {
      location:
        request.url.pathname === "/one"
          ? "https://example.com/two"
          : "https://example.com/one",
    },
    status: 302,
  });

  await assert.rejects(
    safeHttpRequest("https://example.com/one", {
      dependencies: {
        resolveHost: publicResolver,
        transport: loopingTransport,
      },
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "REDIRECT_LOOP",
  );

  const redirectingTransport: SafeHttpTransport = async () => ({
    body: Buffer.alloc(0),
    headers: { location: "/next" },
    status: 302,
  });

  await assert.rejects(
    safeHttpRequest("https://example.com/start", {
      dependencies: {
        resolveHost: publicResolver,
        transport: redirectingTransport,
      },
      maxRedirects: 0,
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "TOO_MANY_REDIRECTS",
  );
});

test("safeHttpRequest enforces its response byte cap around injected transports", async () => {
  const transport: SafeHttpTransport = async () => ({
    body: Buffer.alloc(17),
    headers: {},
    status: 200,
  });

  await assert.rejects(
    safeHttpRequest("https://example.com/", {
      dependencies: { resolveHost: publicResolver, transport },
      maxBytes: 16,
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "RESPONSE_TOO_LARGE",
  );
});

test("safeHttpRequest bounds DNS resolution with the request timeout", async () => {
  await assert.rejects(
    safeHttpRequest("https://slow.example.com/", {
      resolve: {
        lookup: async () => await new Promise(() => undefined),
      },
      timeoutMs: 20,
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "TIMEOUT",
  );
});

test("safeHttpRequest only permits GET and HEAD and blocks sensitive headers", async () => {
  await assert.rejects(
    safeHttpRequest("https://example.com/", {
      dependencies: {
        resolveHost: publicResolver,
        transport: async () => ({ body: Buffer.alloc(0), headers: {}, status: 200 }),
      },
      headers: { Cookie: "secret=value" },
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "INVALID_OPTIONS",
  );

  await assert.rejects(
    safeHttpRequest("https://example.com/", {
      method: "POST" as "GET",
    }),
    (error: unknown) =>
      error instanceof SafeHttpError && error.code === "INVALID_OPTIONS",
  );
});
