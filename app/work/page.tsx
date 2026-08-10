import WorksSection from "@/components/sections/WorksSection";
import Section from "@/components/ui/Section";
import { createPageMetadata } from "@/config/seo";

export const metadata = createPageMetadata({
  title: "Website Design Work & Concepts",
  description:
    "Explore website design and digital work by Veriq Digital, including focused concepts for service businesses and local brands.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <main id="main-content" className="pt-20">
      <Section>
        <WorksSection headingLevel="h1" />
      </Section>
    </main>
  );
}
