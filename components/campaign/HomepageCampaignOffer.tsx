/*
 * THESIS: Present a credible Iowa-only opportunity without competing with the hero’s primary promise.
 * OWN-WORLD: A dark operational panel, cyan availability marker, Oswald heading, and precise mono campaign details.
 * STORY: Visitors recognize the ad offer, understand the honest limit and terms, then claim a spot with one action.
 * FIRST VIEWPORT: The compact panel sits directly below the existing hero CTAs and remains part of server HTML.
 * FORM: A brief-led campaign panel, selected directly for this local extension; no concept seed was needed.
 */
import HomepageCampaignCta from "@/components/campaign/HomepageCampaignCta";
import type { HomepageCampaignConfig } from "@/config/site";
import styles from "./HomepageCampaign.module.css";

type HomepageCampaignOfferProps = {
  campaign: HomepageCampaignConfig;
};

const HomepageCampaignOffer = ({ campaign }: HomepageCampaignOfferProps) => {
  return (
    <aside
      className={styles.campaignCard}
      aria-labelledby="homepage-campaign-heading"
    >
      <div className={styles.campaignHeader}>
        <p className={styles.campaignEyebrow}>
          <span aria-hidden="true" />
          {campaign.eyebrow}
        </p>
        <p className={styles.spotBadge}>
          <strong>{campaign.spotCount}</strong> spots available
        </p>
      </div>

      <h2 id="homepage-campaign-heading" className={styles.campaignHeading}>
        {campaign.heading}
      </h2>
      <p className={styles.campaignDescription}>{campaign.description}</p>

      <div className={styles.campaignFooter}>
        <p className={styles.campaignSupport}>{campaign.supportingText}</p>
        <HomepageCampaignCta
          ctaLabel={campaign.ctaLabel}
          offer={campaign.offer}
          page={campaign.page}
          source={campaign.source}
          spotCount={campaign.spotCount}
        />
      </div>
    </aside>
  );
};

export default HomepageCampaignOffer;
