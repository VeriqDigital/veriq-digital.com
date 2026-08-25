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
        />
      </div>
    </aside>
  );
};

export default HomepageCampaignOffer;
