import { randomUUID } from "node:crypto";
import { siteConfig } from "@/config/site";
import { Resend } from "resend";
import { z } from "zod";

const contactLeadSchema = z.object({
  type: z.literal("contact"),
  websiteAddress: z.literal("").optional(),
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(2000),
});

const freeLandingPageLeadSchema = z.object({
  type: z.literal("free-landing-page"),
  websiteAddress: z.literal("").optional(),
  businessName: z.string().trim().min(1).max(120),
  email: z.email(),
  website: z.union([z.literal(""), z.url().max(2048)]).optional(),
  source: z.literal("homepage-free-landing-page"),
  offer: z.literal("free-landing-page"),
  page: z.literal("homepage"),
  submittedAt: z.iso.datetime(),
});

const leadSchema = z.discriminatedUnion("type", [
  contactLeadSchema,
  freeLandingPageLeadSchema,
]);

type Lead = z.infer<typeof leadSchema>;

const leadLabels: Record<Lead["type"], string> = {
  contact: "Contact message",
  "free-landing-page": "Free landing page campaign lead",
};

const estimatedValuesByBudget: Record<string, number> = {
  "under-2000": 1000,
  "2000-5000": 3500,
  "5000-10000": 7500,
  "10000-plus": 10000,
};

const maxRequestBodyBytes = 16_384;
const requestWindowMs = 10 * 60 * 1000;
const maxRequestsPerWindow = 5;
const recentRequestsByClient = new Map<string, number[]>();

const isTrustedRequest = (request: Request) => {
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return false;
  }

  const originHeader = request.headers.get("origin");

  if (!originHeader) {
    return process.env.NODE_ENV !== "production";
  }

  try {
    const origin = new URL(originHeader).origin;
    const requestOrigin = new URL(request.url).origin;
    const canonicalOrigin = new URL(siteConfig.url).origin;

    return origin === requestOrigin || origin === canonicalOrigin;
  } catch {
    return false;
  }
};

/*
 * This is a best-effort, per-instance burst guard for serverless deployments.
 * It reduces repeated submissions from one client but is not a distributed
 * rate limiter and intentionally requires no external service.
 */
const hasExceededBurstLimit = (request: Request) => {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIdentifier =
    forwardedFor?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip")?.trim();

  if (!clientIdentifier) {
    return false;
  }

  const now = Date.now();
  const windowStart = now - requestWindowMs;
  const recentRequests = (recentRequestsByClient.get(clientIdentifier) ?? [])
    .filter((timestamp) => timestamp > windowStart);

  if (recentRequests.length >= maxRequestsPerWindow) {
    recentRequestsByClient.set(clientIdentifier, recentRequests);
    return true;
  }

  recentRequests.push(now);
  recentRequestsByClient.set(clientIdentifier, recentRequests);

  if (recentRequestsByClient.size > 500) {
    for (const [identifier, timestamps] of recentRequestsByClient) {
      if (timestamps.every((timestamp) => timestamp <= windowStart)) {
        recentRequestsByClient.delete(identifier);
      }
    }
  }

  return false;
};

const getIdempotencyKey = (request: Request) => {
  const providedKey = request.headers.get("Idempotency-Key")?.trim();

  if (
    providedKey &&
    providedKey.length <= 128 &&
    /^[A-Za-z0-9._:-]+$/.test(providedKey)
  ) {
    return providedKey;
  }

  return randomUUID();
};

const formatLeadForOwner = (lead: Lead) => {
  if (lead.type === "free-landing-page") {
    return [
      `Type: ${leadLabels[lead.type]}`,
      `Business name: ${lead.businessName}`,
      `Email: ${lead.email}`,
      `Website: ${lead.website || "Not provided"}`,
      `Source: ${lead.source}`,
      `Offer: ${lead.offer}`,
      `Page: ${lead.page}`,
      `Submitted at: ${lead.submittedAt}`,
    ].join("\n");
  }

  const rows: string[] = [
    `Type: ${leadLabels[lead.type]}`,
    `Name: ${lead.name}`,
    `Email: ${lead.email}`,
  ];

  if (lead.phone) {
    rows.push(`Phone: ${lead.phone}`);
  }

  if (lead.topic) {
    rows.push(`Budget: ${lead.topic}`);
  }

  rows.push("", "Message:", lead.message);

  return rows.join("\n");
};

const getLeadHomePayload = (lead: Lead) => {
  if (lead.type === "free-landing-page") {
    return {
      name: lead.businessName,
      email: lead.email,
      company: lead.businessName,
      message: [
        "Free landing page promotion submission",
        `Website: ${lead.website || "Not provided"}`,
        `Source: ${lead.source}`,
        `Offer: ${lead.offer}`,
        `Page: ${lead.page}`,
        `Submitted at: ${lead.submittedAt}`,
      ].join("\n"),
      website: lead.website || undefined,
      source: lead.source,
      metadata: {
        offer: lead.offer,
        page: lead.page,
        submittedAt: lead.submittedAt,
      },
    };
  }

  return {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: siteConfig.name,
    message: lead.message,
    estimatedValue: lead.topic
      ? estimatedValuesByBudget[lead.topic]
      : undefined,
  };
};

const getAutoReplyText = (lead: Lead) =>
  lead.type === "free-landing-page"
    ? "You’re on the list. I’ll review your business and follow up personally by email."
    : `Thanks for contacting ${siteConfig.name}. We received your message and will get back to you within one business day.`;

export async function POST(request: Request) {
  if (!isTrustedRequest(request)) {
    return Response.json(
      { message: "This request could not be accepted." },
      { status: 403 },
    );
  }

  const contentType = request.headers.get("content-type")?.toLowerCase() ?? "";

  if (!contentType.startsWith("application/json")) {
    return Response.json(
      { message: "This request could not be accepted." },
      { status: 415 },
    );
  }

  const declaredContentLength = Number(
    request.headers.get("content-length") ?? 0,
  );

  if (
    Number.isFinite(declaredContentLength) &&
    declaredContentLength > maxRequestBodyBytes
  ) {
    return Response.json(
      { message: "The request is too large." },
      { status: 413 },
    );
  }

  const rawBody = await request.text().catch(() => "");

  if (new TextEncoder().encode(rawBody).byteLength > maxRequestBodyBytes) {
    return Response.json(
      { message: "The request is too large." },
      { status: 413 },
    );
  }

  let body: unknown;

  try {
    body = JSON.parse(rawBody);
  } catch {
    return Response.json(
      { message: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const honeypotValue =
    typeof body === "object" && body !== null && "websiteAddress" in body
      ? (body as Record<string, unknown>).websiteAddress
      : undefined;

  if (typeof honeypotValue === "string" && honeypotValue.trim()) {
    return Response.json({ message: "Request sent." }, { status: 201 });
  }

  if (hasExceededBurstLimit(request)) {
    return Response.json(
      { message: "Too many requests. Please wait and try again." },
      {
        status: 429,
        headers: { "Retry-After": String(requestWindowMs / 1000) },
      },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const businessOwnerEmail = process.env.BUSINESS_OWNER_EMAIL;
  const leadHomeUrl = process.env.LEADHOME_URL;
  const leadHomeSourceToken = process.env.LEADHOME_SOURCE_TOKEN;

  if (!apiKey || !fromEmail || !businessOwnerEmail) {
    console.error("Required lead intake environment variables are missing.");

    return Response.json(
      { message: "The contact form is temporarily unavailable." },
      { status: 500 },
    );
  }

  if (Boolean(leadHomeUrl) !== Boolean(leadHomeSourceToken)) {
    console.error("LeadHome requires both URL and source token configuration.");

    return Response.json(
      { message: "The contact form is temporarily unavailable." },
      { status: 500 },
    );
  }

  const parsedBody = leadSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      { message: "Please check the form and try again." },
      { status: 400 },
    );
  }

  const lead = parsedBody.data;
  const resend = new Resend(apiKey);

  /*
   * Ideally, the browser supplies one stable key per form submission.
   * The fallback UUID still gives this server request a unique identifier.
   */
  const idempotencyKey = getIdempotencyKey(request);
  let leadHomeEndpoint: string | null = null;

  if (leadHomeUrl && leadHomeSourceToken) {
    try {
      leadHomeEndpoint = new URL(
        "/api/inbound/forms",
        leadHomeUrl,
      ).toString();
    } catch {
      console.error("LEADHOME_URL must be a valid absolute URL.");

      return Response.json(
        { message: "The contact form is temporarily unavailable." },
        { status: 500 },
      );
    }
  }

  const [leadHomeResult, ownerEmailResult] = await Promise.allSettled([
    leadHomeEndpoint && leadHomeSourceToken
      ? fetch(leadHomeEndpoint, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${leadHomeSourceToken}`,
            "Content-Type": "application/json",
            "Idempotency-Key": idempotencyKey,
          },
          body: JSON.stringify(getLeadHomePayload(lead)),
          cache: "no-store",
        })
      : Promise.resolve(null),
    resend.emails.send({
      from: fromEmail,
      to: businessOwnerEmail,
      replyTo: lead.email,
      subject: `New ${siteConfig.name} ${leadLabels[lead.type]}`,
      text: formatLeadForOwner(lead),
    }),
  ]);

  let leadHomeSucceeded = false;
  let ownerEmailSucceeded = false;

  if (leadHomeResult.status === "fulfilled" && leadHomeResult.value) {
    leadHomeSucceeded = leadHomeResult.value.ok;

    if (!leadHomeResult.value.ok) {
      const responseText = await leadHomeResult.value
        .text()
        .catch(() => "");

      console.error("LeadHome ingestion failed:", {
        status: leadHomeResult.value.status,
        response: responseText,
      });
    }
  } else if (leadHomeResult.status === "rejected") {
    console.error("LeadHome request failed:", leadHomeResult.reason);
  }

  if (ownerEmailResult.status === "fulfilled") {
    ownerEmailSucceeded = !ownerEmailResult.value.error;

    if (ownerEmailResult.value.error) {
      console.error(
        "Lead owner notification failed:",
        ownerEmailResult.value.error,
      );
    }
  } else {
    console.error(
      "Lead owner notification threw an error:",
      ownerEmailResult.reason,
    );
  }

  /*
   * Do not tell the visitor their request succeeded if it reached neither
   * LeadHome nor the business owner's inbox.
   */
  if (!leadHomeSucceeded && !ownerEmailSucceeded) {
    return Response.json(
      { message: "Could not send your request. Please try again." },
      { status: 502 },
    );
  }

  const autoReply = await resend.emails
    .send({
      from: fromEmail,
      to: lead.email,
      subject:
        lead.type === "free-landing-page"
          ? "You’re on the free landing page list"
          : "We received your request",
      text: getAutoReplyText(lead),
    })
    .catch((error: unknown) => ({ error }));

  if (autoReply.error) {
    console.error("Lead auto-reply failed:", autoReply.error);

    return Response.json(
      {
        message:
          "We received your request, but could not send the confirmation email.",
      },
      { status: 200 },
    );
  }

  return Response.json(
    {
      message: "Request sent.",
    },
    { status: 201 },
  );
}
