import { useState } from "react";
import type { FormEvent } from "react";
import Container from "@/components/ui/Container";
import type { ContactInfo } from "./Profile";
import type { MembershipPlan } from "./membershipPlans";

type PaymentProps = {
  contactInfo: ContactInfo;
  selectedPlan: MembershipPlan | null;
  onBack: () => void;
};

const fieldClass =
  "h-16 w-full rounded-md border border-white/15 bg-zinc-950 px-5 text-base font-semibold text-white outline-none transition duration-200 placeholder:text-white/35 focus:border-green-500";

const Payment = ({ contactInfo, selectedPlan, onBack }: PaymentProps) => {
  const [isComplete, setIsComplete] = useState(false);

  const memberName =
    `${contactInfo.firstName} ${contactInfo.lastName}`.trim() || "Iron Palace Member";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsComplete(true);
  };

  return (
    <section className="bg-black pb-24">
      <Container>
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={onBack}
            className="mb-5 cursor-pointer text-xs font-black uppercase tracking-widest text-white/50 transition hover:text-white"
          >
            Back
          </button>

          {isComplete ? (
            <div className="rounded-lg border border-(--primary)/40 bg-(--primary)/10 p-6 md:p-8">
              <p className="font-heading text-sm font-black uppercase tracking-[0.35em] text-(--primary)">
                Demo Payment Complete
              </p>
              <h2 className="mt-5 font-heading text-3xl font-black uppercase text-white">
                Welcome to Iron Palace
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-white/70">
                {memberName}, your membership checkout has been recorded for
                this demo flow. No card was charged.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <form
                className="rounded-lg border border-white/10 bg-zinc-900 p-6 md:p-8"
                onSubmit={handleSubmit}
              >
                <h2 className="font-heading text-sm font-black uppercase tracking-[0.35em]">
                  Payment Information
                </h2>
                <div className="my-6 h-px bg-white/10" />

                <div className="grid gap-5">
                  <label className="block">
                    <span className="sr-only">Name on card</span>
                    <input
                      className={fieldClass}
                      name="cardName"
                      placeholder="Name on card *"
                      required
                      defaultValue={memberName}
                    />
                  </label>

                  <label className="block">
                    <span className="sr-only">Card number</span>
                    <input
                      className={fieldClass}
                      name="cardNumber"
                      inputMode="numeric"
                      placeholder="Card number *"
                      required
                    />
                  </label>

                  <div className="grid gap-5 sm:grid-cols-3">
                    <label className="block">
                      <span className="sr-only">Expiration date</span>
                      <input
                        className={fieldClass}
                        name="expiration"
                        placeholder="MM/YY *"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Security code</span>
                      <input
                        className={fieldClass}
                        name="securityCode"
                        inputMode="numeric"
                        placeholder="CVV *"
                        required
                      />
                    </label>
                    <label className="block">
                      <span className="sr-only">Billing ZIP code</span>
                      <input
                        className={fieldClass}
                        name="billingZip"
                        inputMode="numeric"
                        placeholder="ZIP *"
                        required
                        defaultValue={contactInfo.zip}
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-8 rounded-md border border-white/10 bg-black/20 p-5">
                  <p className="text-sm leading-relaxed text-white/55">
                    Use any placeholder card details. This checkout is for
                    demonstration only and does not process a real payment.
                  </p>
                </div>

                <button
                  type="submit"
                  className="mt-6 w-full cursor-pointer rounded-md bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition duration-200 hover:scale-[1.02] hover:bg-(--primary)"
                >
                  Complete Demo Payment
                </button>
              </form>

              <aside className="rounded-lg border border-white/10 bg-zinc-900 p-6 md:p-8">
                <h2 className="font-heading text-sm font-black uppercase tracking-[0.35em]">
                  Order Summary
                </h2>
                <div className="my-6 h-px bg-white/10" />

                <div className="space-y-5">
                  <div>
                    <p className="text-xs uppercase text-white/45">Member</p>
                    <p className="mt-1 font-black uppercase">{memberName}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-white/45">Plan</p>
                    <p className="mt-1 font-black uppercase">
                      {selectedPlan?.name ?? "Membership"}
                    </p>
                  </div>
                  <div className="border-t border-white/10 pt-5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/55">
                        Due today
                      </span>
                      <strong className="tabular-nums">
                        {selectedPlan?.dueToday ?? "$0.00"}
                      </strong>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-sm font-semibold text-white/55">
                        Monthly
                      </span>
                      <strong className="tabular-nums">
                        {selectedPlan?.monthly ?? "$0.00"}
                      </strong>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          )}
        </div>
      </Container>
    </section>
  );
};

export default Payment;
