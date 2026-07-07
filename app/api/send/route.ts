import { Resend } from "resend";
import { z } from "zod";

const newsletterSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.EMAIL_FROM;

  if (!apiKey || !fromEmail) {
    return Response.json(
      { message: "Email service is not configured." },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const parsedBody = newsletterSchema.safeParse(body);

  if (!parsedBody.success) {
    return Response.json(
      { message: "Please enter a valid email address." },
      { status: 400 },
    );
  }

  const resend = new Resend(apiKey);
  const { email } = parsedBody.data;

  const { error } = await resend.emails
    .send({
      from: fromEmail,
      to: email,
      subject: "Thanks for signing up",
      text: "Thanks for signing up to the Iron Palace newsletter!",
    })
    .catch((error: unknown) => ({ error }));

  if (error) {
    console.error("Newsletter confirmation email failed:", error);

    return Response.json(
      { message: "Could not send the newsletter confirmation." },
      { status: 500 },
    );
  }

  return Response.json({ message: "Confirmation email sent." });
}
