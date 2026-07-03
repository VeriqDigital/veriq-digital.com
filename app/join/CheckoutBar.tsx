import type { MembershipPlan } from "./membershipPlans";

type CheckoutBarProps = {
  selectedPlan: MembershipPlan | null;
};

const CheckoutBar = ({ selectedPlan }: CheckoutBarProps) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-black/95 px-6 py-4">
      <div className="mx-auto grid max-w-6xl grid-cols-[minmax(0,1fr)_auto] items-center gap-6 md:grid-cols-[minmax(0,1fr)_16rem_9rem]">
        <div className="min-w-0">
          <p className="text-xs uppercase text-white/50">Iron Palace Member</p>
          <p className="font-bold uppercase">Your Name</p>
          <p className="truncate text-xs text-white/60">
            {selectedPlan ? selectedPlan.name : "Choose a plan"} &middot; All
            Access
          </p>
        </div>

        <div className="hidden grid-cols-2 gap-8 md:grid">
          <div className="w-28">
            <p className="text-xs uppercase text-white/50">Due Today</p>
            <p className="font-bold tabular-nums">
              {selectedPlan?.dueToday ?? "$..."}
            </p>
          </div>
          <div className="w-28">
            <p className="text-xs uppercase text-white/50">Monthly</p>
            <p className="font-bold tabular-nums">
              {selectedPlan?.monthly ?? "$..."}
            </p>
          </div>
        </div>

        <button
          type="button"
          disabled={!selectedPlan}
          className="w-36 cursor-pointer rounded-md bg-white px-8 py-4 text-sm font-black uppercase tracking-widest text-black transition duration-200 hover:scale-[1.03] hover:bg-(--primary) disabled:cursor-not-allowed disabled:bg-white/30 disabled:text-white/40 disabled:hover:scale-100"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default CheckoutBar;
