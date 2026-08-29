/*
THESIS: Veriq's homepage is a working sales path, not a thin portfolio index.
OWN-WORLD: Preserve the graphite and warm-white surfaces, cyan signal color, oversized condensed headings, precise rules, and restrained technical detail already established across the site.
STORY: A service-business owner understands the offer, recognizes what the website should accomplish, sees the available project approaches and process, reviews real work, discovers the audit, and chooses a useful next step.
FIRST VIEWPORT: A compact two-column hero pairs the outcome-led offer and clear actions with the existing project inquiry form; credibility context sits directly below the actions.
FORM: Brief-specified conversion sequence within the established Veriq world; no concept seed was used because the structure and visual constraints were explicit.
*/
import HomepageCampaignOffer from "@/components/campaign/HomepageCampaignOffer";
import HomeWebsiteApproach from "@/components/sections/HomeWebsiteApproach";
import HomeSeoAudit from "@/components/sections/HomeSeoAudit";
import HomeTrustSection from "@/components/sections/HomeTrustSection";
import HomeWhyGrowth, {
  HomeFinalCta,
} from "@/components/sections/HomeWhyGrowth";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import HomeWorksRail from "@/components/sections/HomeWorksRail";
import ServicesSection from "@/components/sections/ServicesSection";
import Section from "@/components/ui/Section";
import {
  createPageMetadata,
  serializeJsonLd,
  siteStructuredData,
} from "@/config/seo";
import { homepageCampaign, siteConfig } from "@/config/site";
import { isWebsiteAuditDiscoverable } from "@/lib/website-audit/runtime-config";
import styles from "./page.module.css";

export const metadata = createPageMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  const auditEnabled = isWebsiteAuditDiscoverable();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(siteStructuredData),
        }}
      />
      <main id="main-content">
        <Hero
          auditEnabled={auditEnabled}
          campaign={
            homepageCampaign.enabled ? (
              <HomepageCampaignOffer campaign={homepageCampaign} />
            ) : null
          }
        />
        <HomeTrustSection auditEnabled={auditEnabled} />
        <Section id="works" className={styles.worksChapter}>
          <HomeWorksRail />
        </Section>
        <Section id="services" className={styles.servicesChapter}>
          <ServicesSection />
        </Section>
        <HomeWebsiteApproach />
        <HomeSeoAudit auditEnabled={auditEnabled} />
        <HomeWhyGrowth />
        <Section id="faq" className={styles.faqChapter}>
          <FAQ />
        </Section>
        <HomeFinalCta />
      </main>
    </>
  );
}
