import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import HomepageCampaignOffer from "@/components/campaign/HomepageCampaignOffer";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import Section from "@/components/ui/Section";
import Works from "@/components/sections/WorksSection";
import {
  createPageMetadata,
  serializeJsonLd,
  siteStructuredData,
} from "@/config/seo";
import { homepageCampaign, siteConfig } from "@/config/site";

export const metadata = createPageMetadata({
  description: siteConfig.description,
  path: "/",
});

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(siteStructuredData),
        }}
      />
      <Hero
        campaign={
          homepageCampaign.enabled ? (
            <HomepageCampaignOffer campaign={homepageCampaign} />
          ) : null
        }
      />
      <Section id="services" compactTop>
        <ServicesSection />
      </Section>
      <Section id="works">
        <Works />
      </Section>
      <Section id="faq">
        <FAQ />
      </Section>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
