export type MembershipPlan = {
  id: "month-to-month" | "scrubs-and-scholars" | "valor" | "yearly" | "yearly-mtm";
  name: string;
  eyebrow?: string;
  subtitle: string;
  dueToday: string;
  monthly: string;
  note: string;
  requirement?: string;
};

export const membershipPlans: MembershipPlan[] = [
  {
    id: "month-to-month",
    name: "Month to Month",
    eyebrow: "Most Popular",
    subtitle: "All-access, no commitment",
    dueToday: "$199.99",
    monthly: "$89.99",
    note: "Cancel any time.",
  },
  {
    id: "scrubs-and-scholars",
    name: "Squires",
    subtitle: "Students",
    dueToday: "$199.99",
    monthly: "$69.99",
    note: "Discounted rate for students.",
    requirement:
      "School ID required at first visit. Must be 18 or older to join without a parent or guardian.",
  },
  {
    id: "valor",
    name: "Knights and Stewards",
    subtitle: "Military and first responders",
    dueToday: "$199.99",
    monthly: "$79.99",
    note: "Discounted rate for Active Duty/Retired Military, Police, Fire, EMT.",
    requirement:
      "Proof of military service or first responder employment required at first visit",
  },
  {
    id: "yearly-mtm",
    name: "Month To Month",
    subtitle: "Annual commitment, month-to-month billing",
    dueToday: "$199.99",
    monthly: "$79.99",
    note: "Save money with an annual commitment.",
  },
  {
    id: "yearly",
    name: "Yearly",
    eyebrow: "Best Value",
    subtitle: "Annual membership, billed once per year",
    dueToday: "$999.99",
    monthly: "$0",
    note: "Save money with an annual commitment.",
  },
];
