import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import ServicesSection from "@/components/sections/ServicesSection";
import Section from "@/components/ui/Section";
import Works from "@/components/sections/WorksSection";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";

export const metadata = createPageMetadata({
  description: siteConfig.description,
  path: "/",
});

const organizationId = `${siteConfig.url}/#organization`;
const structuredData = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteConfig.url}/#website`,
    name: siteConfig.name,
    alternateName: "Veriq Digital",
    url: siteConfig.url,
    inLanguage: "en-US",
    publisher: {
      "@id": organizationId,
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": organizationId,
    name: siteConfig.name,
    alternateName: "Veriq Digital",
    url: siteConfig.url,
    logo: `${siteConfig.url}/icon.svg`,
    description: siteConfig.description,
    email: siteConfig.contact.email,
    telephone: siteConfig.contact.phoneE164,
    foundingDate: "2026",
    address: {
      "@type": "PostalAddress",
      addressLocality: siteConfig.location.city,
      addressRegion: siteConfig.location.regionCode,
      addressCountry: siteConfig.location.countryCode,
    },
    areaServed: [
      {
        "@type": "City",
        name: `${siteConfig.location.city}, ${siteConfig.location.region}`,
      },
      {
        "@type": "Country",
        name: siteConfig.location.country,
      },
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      email: siteConfig.contact.email,
      telephone: siteConfig.contact.phoneE164,
      areaServed: siteConfig.location.countryCode,
      availableLanguage: "English",
    },
  },
] as const;

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      <Hero />
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
