import WorksSection from "@/components/sections/WorksSection";
import Section from "@/components/ui/Section";
import { createPageMetadata } from "@/config/seo";

export const metadata = createPageMetadata({
  title: "Website & Software Work",
  description:
    "Explore website and software projects by Veriq, including the business problem, what was built, and what each project was designed to improve.",
  path: "/work",
});

export default function WorkPage() {
  return (
    <div className="pt-20">
      <h1 className="sr-only">Website and software work by Veriq</h1>
      <Section>
        <WorksSection detailed />
      </Section>
    </div>
  );
}
