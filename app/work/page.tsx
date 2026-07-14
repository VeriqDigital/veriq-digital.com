import WorksSection from "@/components/sections/WorksSection";
import Section from "@/components/ui/Section";
import { createPageMetadata } from "@/config/seo";

export const metadata = createPageMetadata({
  title: "Work",
  description:
    "Selected website and software projects designed and developed by Veriq.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <div className="pt-20">
      <Section>
        <WorksSection />
      </Section>
    </div>
  );
}
