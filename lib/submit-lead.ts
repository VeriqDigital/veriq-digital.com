// lib/submit-lead.ts

export type ContactLeadPayload = {
  type: "contact";
  websiteAddress?: string;
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  projectType?: string;
  message: string;
};

export type FreeLandingPageLeadPayload = {
  type: "free-landing-page";
  websiteAddress?: string;
  businessName: string;
  email: string;
  website?: string;
  source: "homepage-free-landing-page";
  offer: "free-landing-page";
  page: "homepage";
  submittedAt: string;
};

export type LeadPayload = ContactLeadPayload | FreeLandingPageLeadPayload;

type SubmitLeadResult =
  | {
      ok: true;
      message: string;
    }
  | {
      ok: false;
      message: string;
    };

export async function submitLead(
  payload: LeadPayload,
): Promise<SubmitLeadResult> {
  const idempotencyKey = crypto.randomUUID();

  const response = await fetch("/api/leads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Idempotency-Key": idempotencyKey,
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!response) {
    return {
      ok: false,
      message: "Could not connect. Please try again.",
    };
  }

  const data = (await response.json().catch(() => null)) as {
    message?: string;
  } | null;

  if (!response.ok) {
    return {
      ok: false,
      message: data?.message ?? "Something went wrong. Please try again.",
    };
  }

  return {
    ok: true,
    message: data?.message ?? "Request sent.",
  };
}
