import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function WebsiteRedesignVsRebuildArticle() {
  return (
    <>
      <ArticleSection id="terms" title="Redesign and rebuild describe different kinds of change">
        <p>
          Teams often use “redesign” to mean any substantial website project.
          In practice, the work can range from refining a few weak pages to
          replacing the platform and rebuilding every template. Clear terms
          matter because each path changes cost, schedule, migration risk, and
          what the business must provide.
        </p>
        <ComparisonTable
          caption="Website improvement paths"
          columns={["Path", "What changes", "When it can fit"]}
          rows={[
            [
              "Refine",
              "Targeted copy, layout, speed, accessibility, or conversion improvements.",
              "The structure and platform are sound and the failures are contained.",
            ],
            [
              "Redesign",
              "The visual system, page layouts, messaging, and customer paths are reworked.",
              "The site needs coordinated experience changes but useful foundations can remain.",
            ],
            [
              "Restructure",
              "Navigation, page hierarchy, content model, and internal links change.",
              "The business or service offering has outgrown the current organization.",
            ],
            [
              "Migrate",
              "Content and functionality move to another platform or implementation.",
              "Editing, hosting, support, or platform constraints justify the move.",
            ],
            [
              "Rebuild",
              "Templates, components, and technical foundations are implemented again.",
              "Technical debt or required functionality makes patching the old system impractical.",
            ],
          ]}
        />
      </ArticleSection>

      <ArticleSection id="fix" title="Fix the existing website when the foundation still works">
        <p>
          A rebuild is wasteful when the platform is stable, the content model
          fits the business, the site can be edited, and the main problems are
          limited to a few pages or components. Focused work can improve
          messaging, mobile layouts, images, forms, accessibility, speed, and
          calls to action without moving everything.
        </p>
        <p>
          This path works best when the issues can be isolated and tested. If a
          contact flow is weak, repair that flow. If a group of service pages
          no longer reflects the offer, rewrite and redesign those pages. The
          business should not absorb migration risk merely to make the project
          feel more substantial.
        </p>
      </ArticleSection>

      <ArticleSection id="redesign" title="Redesign when the experience needs a shared system">
        <p>
          A redesign becomes useful when problems repeat across the site:
          unclear hierarchy, inconsistent pages, weak mobile behavior,
          difficult navigation, inaccessible interactions, or conversion paths
          that no longer match how customers buy. Correcting each symptom
          separately can create another layer of inconsistency.
        </p>
        <p>
          The existing platform may still be appropriate. A redesigned
          Squarespace site can be the right answer for a marketing-focused
          business that values straightforward editing. Custom development can
          make sense when specialized content, performance control,
          customer-facing integrations, or conversion functionality requires
          more flexibility.
        </p>
      </ArticleSection>

      <ArticleSection id="rebuild" title="Rebuild when technical constraints control the outcome">
        <p>
          Rebuilding is more likely when the code or theme is brittle, the
          content structure cannot represent the business, routine editing
          breaks layouts, plugins or extensions create recurring failures, or
          required integrations cannot be supported safely. Serious
          accessibility and performance problems can also be architectural
          rather than cosmetic.
        </p>
        <p>
          A rebuild does not require discarding everything. Useful copy,
          imagery, domain authority, indexed URLs, analytics history, customer
          workflows, and recognizable brand elements can still be preserved or
          mapped into the new system.
        </p>
        <ArticleCallout title="Platform change is a consequence, not the goal">
          <p>
            Choose a new platform only when its editing model, capabilities,
            ownership, support, or technical constraints better fit the work.
            Custom code is not automatically superior, and a managed platform
            is not automatically limiting.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="decision" title="Choose the smallest complete solution">
        <ol>
          <li>Document the business goals and current customer paths.</li>
          <li>Inventory useful pages, URLs, content, integrations, and analytics.</li>
          <li>Identify whether each problem is local, repeated, or architectural.</li>
          <li>Test what the current platform can support without fragile workarounds.</li>
          <li>Compare improvement, redesign, migration, and rebuild risk.</li>
          <li>Define what must remain true after launch.</li>
        </ol>
        <p>
          The answer may combine paths: preserve the domain and strongest
          content, restructure the navigation, redesign the customer-facing
          pages, and rebuild only the templates or functions that need it.
        </p>
        <ArticleCallout title="Plan the redesign around the current site">
          <p>
            Review the{" "}
            <Link href="/resources/signs-your-website-is-outdated">
              signs that a website is outdated
            </Link>{" "}
            before defining scope, then use the guide to{" "}
            <Link href="/resources/how-much-does-a-website-redesign-cost">
              website redesign cost
            </Link>
            . Veriq can evaluate the full path through its{" "}
            <Link href="/website-redesign">website redesign service</Link>.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
