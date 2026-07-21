import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import BusinessOutcome from "@/components/sections/BusinessOutcome";
import ServicesSection from "@/components/sections/ServicesSection";
import Section from "@/components/ui/Section";
import Works from "@/components/sections/WorksSection";
import Container from "@/components/ui/Container";
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
    knowsAbout: [
      "Web design",
      "Web development",
      "Search engine optimization",
      "Custom software development",
      "Conversion rate optimization",
    ],
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Digital services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Web design and development",
            areaServed: "Des Moines, Iowa",
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Custom software development",
            areaServed: "Des Moines, Iowa",
          },
        },
      ],
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
      <BusinessOutcome />
      <Section id="services" compactTop>
        <ServicesSection />
      </Section>
      <Section id="works">
        <Works />
      </Section>
      <Section id="faq">
        <FAQ />
      </Section>
      <section className="bg-(--primary) py-20 text-black md:py-28">
        <Container>
          <div className="grid items-end gap-10 md:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.28em]">What is getting in the way?</p>
              <h2 className="mt-4 max-w-4xl font-heading text-4xl font-black uppercase md:text-6xl">Build the digital foundation your business needs next.</h2>
              <p className="mt-6 max-w-2xl leading-7">Tell us what is not working today. We will help identify whether the right next step is a website, custom tool, or ongoing support.</p>
            </div>
            <a className="inline-flex rounded-md bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white" href="/contact">Start a conversation</a>
          </div>
        </Container>
      </section>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
