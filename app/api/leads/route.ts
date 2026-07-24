import { randomUUID } from "node:crypto";
import { siteConfig } from "@/config/site";
import { Resend } from "resend";
import { z } from "zod";

const leadSchema = z.object({
  type: z.literal("contact"),
  name: z.string().trim().min(1).max(120),
  email: z.email(),
  phone: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(80).optional(),
  message: z.string().trim().min(1).max(2000),
});

type Lead = z.infer<typeof leadSchema>;

const leadLabels: Record<Lead["type"], string> = {
  contact: "Contact message",
};

const estimatedValuesByBudget: Record<string, number> = {
  "under-2000": 1000,
  "2000-5000": 3500,
  "5000-10000": 7500,
  "10000-plus": 10000,
};

const formatLeadForOwner = (lead: Lead) => {
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

const getAutoReplyText = () =>
  `Thanks for contacting ${siteConfig.name}. We received your message and will get back to you within one business day.`;

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const businessOwnerEmail = process.env.BUSINESS_OWNER_EMAIL;
  const leadHomeUrl = process.env.LEADHOME_URL;
  const leadHomeSourceToken = process.env.LEADHOME_SOURCE_TOKEN;

  if (
    !apiKey ||
    !fromEmail ||
    !businessOwnerEmail ||
    !leadHomeUrl ||
    !leadHomeSourceToken
  ) {
    console.error("Lead intake environment variables are missing.");

    return Response.json(
      { message: "The contact form is temporarily unavailable." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
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
  const idempotencyKey =
    request.headers.get("Idempotency-Key") ?? randomUUID();

  const leadHomeEndpoint = new URL(
    "/api/inbound/forms",
    leadHomeUrl,
  ).toString();

  const [leadHomeResult, ownerEmailResult] = await Promise.allSettled([
    fetch(leadHomeEndpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${leadHomeSourceToken}`,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: siteConfig.name,
        message: lead.message,
        estimatedValue: lead.topic
          ? estimatedValuesByBudget[lead.topic]
          : undefined,
      }),
      cache: "no-store",
    }),
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

  if (leadHomeResult.status === "fulfilled") {
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
  } else {
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
      subject: "We received your request",
      text: getAutoReplyText(),
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
