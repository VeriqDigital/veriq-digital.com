"use client";

import { track } from "@vercel/analytics";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { FreeLandingPageLeadPayload } from "@/lib/submit-lead";
import styles from "./HomepageCampaign.module.css";

const FreeLandingPageModal = dynamic(
  () => import("@/components/campaign/FreeLandingPageModal"),
);

export type CampaignTracking = Pick<
  FreeLandingPageLeadPayload,
  "source" | "offer" | "page"
>;

type HomepageCampaignCtaProps = CampaignTracking & {
  ctaLabel: string;
  spotCount: number;
};

const HomepageCampaignCta = ({
  ctaLabel,
  offer,
  page,
  source,
  spotCount,
}: HomepageCampaignCtaProps) => {
  const [hasOpened, setHasOpened] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hasTrackedView = useRef(false);
  const tracking = { offer, page, source };

  useEffect(() => {
    if (hasTrackedView.current) {
      return;
    }

    hasTrackedView.current = true;
    track("free_offer_viewed", { offer, page, source, spotCount });
  }, [offer, page, source, spotCount]);

  const openModal = () => {
    track("free_offer_opened", tracking);
    setHasOpened(true);
    setIsOpen(true);
  };

  return (
    <>
      <button
        type="button"
        className={styles.campaignCta}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        onClick={openModal}
      >
        {ctaLabel}
        <span aria-hidden="true">↗</span>
      </button>

      {hasOpened && (
        <FreeLandingPageModal
          isOpen={isOpen}
          offer={offer}
          onClose={() => setIsOpen(false)}
          page={page}
          source={source}
          spotCount={spotCount}
        />
      )}
    </>
  );
};

export default HomepageCampaignCta;
