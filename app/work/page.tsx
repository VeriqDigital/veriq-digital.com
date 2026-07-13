import WorksSection from "@/components/sections/WorksSection";
import Section from "@/components/ui/Section";

export const metadata = {
  title: "Work",
  description: "Selected website and software projects by Veriq.",
};

export default function WorkPage() {
  return (
    <div className="pt-20">
      <Section>
        <WorksSection />
      </Section>
    </div>
  );
}
