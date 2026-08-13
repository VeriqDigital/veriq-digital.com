import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function WebsiteRedesignCostArticle() {
  return (
    <>
      <ArticleSection
        id="why-prices-vary"
        title="Redesign cost depends on what the current site leaves behind"
      >
        <p>
          A website redesign is not one standardized product. One business may
          need clearer copy and a better responsive layout on its current
          platform. Another may need new information architecture, a content
          migration, rebuilt integrations, and careful URL redirects. Those
          projects should not carry the same scope or price.
        </p>
        <p>
          The existing site also creates work that a new website may not have.
          Someone has to inventory useful content, understand current traffic,
          identify working forms and integrations, decide which URLs should
          remain, and separate real platform limitations from fixable problems.
          A useful estimate starts with that evidence rather than a page count.
        </p>
        <ArticleCallout title="A useful redesign estimate starts with understanding the current site">
          <p>
            Veriq does not publish a fixed redesign package or invent a project
            total before understanding the current site. A proposal should
            explain what will be preserved, changed, migrated, rebuilt, and
            tested.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="cost-drivers" title="The main website redesign cost drivers">
        <ul>
          <li>
            <strong>Current-site condition.</strong> A stable site with coherent
            content is different from one with broken templates, outdated
            plugins, inaccessible controls, or undocumented custom code.
          </li>
          <li>
            <strong>Strategy and scope.</strong> Reworking one conversion path
            takes less effort than restructuring services, audiences,
            navigation, and the full content model.
          </li>
          <li>
            <strong>Copy and content.</strong> Editing accurate material is less
            involved than interviewing stakeholders, rewriting pages,
            producing imagery, or consolidating years of duplicated content.
          </li>
          <li>
            <strong>Design and responsive behavior.</strong> A focused visual
            refresh differs from establishing a complete design system and
            rebuilding page behavior across phones, tablets, and desktops.
          </li>
          <li>
            <strong>Migration and platform change.</strong> Moving content,
            accounts, media, products, or structured data adds mapping,
            implementation, and verification work.
          </li>
          <li>
            <strong>Functionality and integrations.</strong> Forms, booking,
            ecommerce, CRM connections, portals, quoting tools, and custom
            workflows must be preserved or deliberately replaced.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection id="migration" title="Migration and SEO work belong in the estimate">
        <p>
          A redesign can damage useful search visibility when existing URLs,
          page intent, internal links, metadata, or backlinks are ignored. That
          does not mean every URL and sentence must remain unchanged. It means
          the migration needs an explicit plan.
        </p>
        <p>
          The scope may include an indexed-URL inventory, redirect mapping,
          canonical review, metadata migration, sitemap updates, structured
          data where appropriate, analytics and Search Console checks, and
          post-launch monitoring. None of those steps guarantees rankings will
          remain unchanged, but omitting them creates avoidable risk.
        </p>
      </ArticleSection>

      <ArticleSection id="proposal" title="Compare the work, not only the total">
        <p>
          Ask each provider to separate discovery, content, design,
          development, migration, integrations, testing, launch, and support.
          Clarify whether the proposal assumes the current platform will stay,
          whether copy is supplied by the business, and how scope changes are
          handled.
        </p>
        <p>
          A lower proposal may be appropriate for a focused improvement. It may
          also exclude redirects, mobile design, accessibility review, content
          migration, or production testing. A higher proposal is not
          automatically better either. The useful question is whether the work
          matches the problems the business needs to solve.
        </p>
      </ArticleSection>

      <ArticleSection id="budget" title="Build a redesign budget around decisions and risk">
        <p>
          Start by documenting the business change behind the project, the
          customer actions the site must support, the content and functions
          that already work, and the failures that are expensive to keep. Then
          separate launch requirements from improvements that can follow later.
        </p>
        <p>
          For broader market context, review the guide to{" "}
          <Link href="/resources/how-much-does-a-small-business-website-cost">
            small-business website cost
          </Link>
          . It covers new-site approaches and ongoing ownership, while this
          guide focuses on the extra decisions and migration work created by an
          existing website.
        </p>
        <ArticleCallout title="Define the path before requesting a redesign proposal">
          <p>
            If the right scope is still unclear, compare a{" "}
            <Link href="/resources/website-redesign-vs-rebuild">
              website redesign with a rebuild
            </Link>
            . When the current site needs coordinated structural change, see
            Veriq&apos;s{" "}
            <Link href="/website-redesign">website redesign services</Link>.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
