// lib/submit-lead.ts

export type ContactLeadPayload = {
  type: "contact";
  name: string;
  email: string;
  phone?: string;
  topic?: string;
  message: string;
};

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
  payload: ContactLeadPayload,
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