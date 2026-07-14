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

  if (lead.message) {
    rows.push("", "Message:", lead.message);
  }

  return rows.join("\n");
};

const getAutoReplyText = () => {
  return `Thanks for contacting ${siteConfig.name}. We received your message and will get back to you within 24 hours.`;
};

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;
  const businessOwnerEmail = process.env.BUSINESS_OWNER_EMAIL;

  if (!apiKey || !fromEmail || !businessOwnerEmail) {
    return Response.json(
      { message: "Email service is not configured." },
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

  const ownerEmail = await resend.emails
    .send({
      from: fromEmail,
      to: businessOwnerEmail,
      replyTo: lead.email,
      subject: `New ${siteConfig.name} ${leadLabels[lead.type]}`,
      text: formatLeadForOwner(lead),
    })
    .catch((error: unknown) => ({ error }));

  if (ownerEmail.error) {
    console.error("Lead owner notification failed:", ownerEmail.error);

    return Response.json(
      { message: "Could not send your request. Please try again." },
      { status: 500 },
    );
  }

  const autoReply = await resend.emails
    .send({
      from: fromEmail,
      to: lead.email,
      subject: `We received your request`,
      text: getAutoReplyText(),
    })
    .catch((error: unknown) => ({ error }));

  if (autoReply.error) {
    console.error("Lead auto-reply failed:", autoReply.error);

    return Response.json(
      { message: "We received your request, but could not send confirmation." },
      { status: 200 },
    );
  }

  return Response.json({ message: "Request sent." });
}
