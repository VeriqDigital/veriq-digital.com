import Container from "@/components/ui/Container";
import type { ContactInfo } from "./Profile";
import type { MembershipPlan } from "./membershipPlans";

type ReviewProps = {
  contactInfo: ContactInfo;
  selectedPlan: MembershipPlan | null;
  onBack: () => void;
};

type SummaryRow = {
  label: string;
  value: string;
};

const fallback = "Not provided";

const formatAddress = (contactInfo: ContactInfo) => {
  const cityLine = [contactInfo.city, contactInfo.state, contactInfo.zip]
    .filter(Boolean)
    .join(", ");

  return [contactInfo.address, cityLine].filter(Boolean).join(", ");
};

const SummaryCard = ({
  title,
  rows,
}: {
  title: string;
  rows: SummaryRow[];
}) => {
  return (
    <div className="rounded-lg border border-white/10 bg-zinc-900 p-6 md:p-8">
      <h2 className="font-heading text-sm font-black uppercase tracking-[0.35em]">
        {title}
      </h2>
      <div className="my-6 h-px bg-white/10" />

      <div>
        {rows.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 border-b border-white/10 py-5 last:border-b-0 md:grid-cols-[12rem_1fr] md:items-center"
          >
            <p className="text-sm font-semibold text-white/45 md:text-base">
              {row.label}
            </p>
            <p className="break-words text-sm font-black text-white md:text-right md:text-base">
              {row.value || fallback}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

const Review = ({ contactInfo, selectedPlan, onBack }: ReviewProps) => {
  const name = `${contactInfo.firstName} ${contactInfo.lastName}`.trim();
  const address = formatAddress(contactInfo);
  const isYearlyPlan = selectedPlan?.id === "yearly";

  const contactRows = [
    { label: "Name", value: name },
    { label: "Email", value: contactInfo.email },
    { label: "Phone", value: contactInfo.phone },
    { label: "Date of Birth", value: contactInfo.birthDate },
    { label: "Gender", value: contactInfo.gender },
    { label: "Address", value: address },
  ];

  const membershipRows = [
    { label: "Plan", value: selectedPlan?.name ?? "" },
    { label: "Billing", value: isYearlyPlan ? "Yearly" : "Monthly" },
    {
      label: "Term",
      value: selectedPlan?.id === "month-to-month" ? "No commitment" : "Annual",
    },
    { label: "Due Today", value: selectedPlan?.dueToday ?? "" },
    { label: "Monthly Rate", value: selectedPlan?.monthly ?? "" },
  ];

  return (
    <section className="bg-black pb-48">
      <Container>
        <div className="mx-auto max-w-5xl space-y-6">
          <button
            type="button"
            onClick={onBack}
            className="cursor-pointer text-xs font-black uppercase tracking-widest text-white/50 transition hover:text-white"
          >
            Back
          </button>

          <SummaryCard title="Contact Information" rows={contactRows} />
          <SummaryCard title="Membership Plan" rows={membershipRows} />
        </div>
      </Container>
    </section>
  );
};

export default Review;
