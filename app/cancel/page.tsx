"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import Container from "@/components/ui/Container";

const CancelPage = () => {
  const [barcode, setBarcode] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/leads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        type: "cancellation",
        barcode,
        email,
      }),
    }).catch(() => null);
    const data = response
      ? ((await response.json().catch(() => null)) as { message?: string } | null)
      : null;

    if (!response) {
      setStatus("error");
      setMessage("Could not connect. Please try again.");
      return;
    }

    if (!response.ok) {
      setStatus("error");
      setMessage(data?.message ?? "Please check the form and try again.");
      return;
    }

    setStatus("success");
    setBarcode("");
    setEmail("");
    setMessage("Request received. Next steps will be emailed to you soon.");
  };

  return (
    <main className="min-h-svh px-6 pt-36 text-white">
      <Container>
        <div className="mx-auto max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.22em] text-(--primary)">
            Membership
          </p>
          <h1 className="font-heading text-4xl font-black uppercase sm:text-5xl">
            Freeze or Cancel Membership
          </h1>
          <p className="mt-4 text-sm leading-6 text-white/70">
            Submit your barcode and email address. Next steps will be reviewed
            and emailed to the address provided.
          </p>

          <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
            <label className="block text-sm font-semibold text-white/80">
              Barcode
              <input
                required
                value={barcode}
                onChange={(event) => setBarcode(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                placeholder="Barcode number"
              />
            </label>

            <label className="block text-sm font-semibold text-white/80">
              Email
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-2 w-full rounded-md border border-white/10 bg-black/35 px-3 py-3 text-white outline-none transition placeholder:text-white/35 focus:border-(--primary)"
                placeholder="you@example.com"
              />
            </label>

            <button
              type="submit"
              disabled={status === "loading"}
              className="cursor-pointer rounded-md bg-(--primary) px-5 py-3 font-semibold text-black transition hover:bg-(--primary-hover) disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "loading" ? "Sending" : "Submit request"}
            </button>

            {message && (
              <p
                className={`text-sm font-semibold ${
                  status === "success" ? "text-(--primary)" : "text-red-300"
                }`}
                aria-live="polite"
              >
                {message}
              </p>
            )}
          </form>
        </div>
      </Container>
    </main>
  );
};

export default CancelPage;
