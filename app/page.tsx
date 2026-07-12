import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import FAQ from "@/components/sections/FAQ";
import Hero from "@/components/sections/Hero";
import LocationSection from "@/components/sections/LocationSection";
import ServicesSection from "@/components/sections/ServicesSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import Section from "@/components/ui/Section";

export default function Home() {
  return (
    <>
      <Hero />
      <Section id="services">
        <ServicesSection />
      </Section>
      <Section id="testimonials">
        <TestimonialsSection />
      </Section>
      <Section id="location">
        <LocationSection />
      </Section>
      <Section id="faq">
        <FAQ />
      </Section>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
