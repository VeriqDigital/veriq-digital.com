import Section from "@/components/ui/Section";
import { siteConfig } from "@/config/site";

export default function AboutPage() {
  return (
    <Section>
      <div className="mx-auto max-w-3xl pt-24">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-(--primary)">
          About
        </p>
        <h1 className="mt-4 font-heading text-5xl font-black uppercase text-white md:text-7xl">
          About {siteConfig.name}
        </h1>
        <p className="mt-6 text-lg leading-8 text-white/70">
          Use this page to tell the business story, explain what makes the team
          credible, and give customers confidence before they reach out.
        </p>
      </div>
    </Section>
  );
}
