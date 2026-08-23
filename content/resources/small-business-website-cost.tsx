import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function SmallBusinessWebsiteCostArticle() {
  return (
    <>
      <ArticleSection id="useful-range" title="A realistic range starts in hundreds and reaches tens of thousands">
        <p>
          For planning purposes, an owner-built website can cost a few hundred
          dollars a year in core software, while professional work can range
          from the low thousands to tens of thousands. A website with custom
          commerce, customer portals, or conversion tools can go higher. Those
          categories are wide because they describe different products, not
          different prices for the same product.
        </p>
        <p>
          Current market guides illustrate the spread. Clutch lists DIY builder
          fees around $10–$50 per month and a basic freelancer-built five-to-ten
          page site around $500–$5,000, while its broader set of reviewed web
          design projects often falls below $10,000 but includes much larger
          engagements. Treat those figures as market context, not a Veriq quote
          or a promise that a particular scope belongs in that range.
        </p>
        <ArticleCallout title="What these ranges do not include">
          <p>
            Published ranges rarely normalize strategy, copy, photography,
            custom design, migration, ecommerce, integrations, accessibility,
            SEO, or support. Review the{" "}
            <a
              href="https://clutch.co/resources/how-to-create-a-budget-for-a-new-website"
              target="_blank"
              rel="noopener noreferrer"
            >
              current Clutch website budget guide
            </a>{" "}
            and then compare the work included in each proposal.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="approaches" title="Use four planning bands, not one average">
        <ComparisonTable
          caption="Small-business website planning bands"
          columns={["Planning band", "Market context", "What changes the total"]}
          rows={[
            [
              "Owner-built",
              "Core builder fees commonly land in the hundreds per year before optional products and the owner’s time.",
              "Plan level, domain, email, apps, commerce fees, purchased assets, and outside help.",
            ],
            [
              "Professionally assembled",
              "A focused site built from an established system may land in the low thousands.",
              "Content readiness, template customization, page types, platform setup, and the provider’s role.",
            ],
            [
              "Professionally designed",
              "Original strategy, messaging, and responsive design commonly move the project from low to higher thousands.",
              "Research, copy, visual direction, content depth, migration, testing, and launch responsibility.",
            ],
            [
              "Custom functionality",
              "Specialized commerce, customer portals, quoting, booking, or calculators can move the work into tens of thousands or more.",
              "Product decisions, engineering, data, security, edge cases, integrations, and long-term support.",
            ],
          ]}
        />
        <p>
          These are budgeting bands, not package prices. The same platform can
          appear in more than one band: a Squarespace site built by its owner
          has a different cost structure from a professionally planned and
          custom-designed Squarespace site. Check the platform’s{" "}
          <a
            href="https://support.squarespace.com/hc/en-us/articles/206536797-Choosing-the-right-Squarespace-plan"
            target="_blank"
            rel="noopener noreferrer"
          >
            current plan guidance
          </a>{" "}
          when estimating recurring software because plan features and pricing
          can change.
        </p>
      </ArticleSection>

      <ArticleSection id="project-cost" title="What changes the project cost">
        <p>
          The largest cost drivers are usually the amount of thinking and
          production the project requires, not a single feature list.
        </p>
        <ul>
          <li>
            <strong>Page types and content depth.</strong> Repeating one service
            layout is different from planning services, locations, resources,
            portfolios, ecommerce, and gated content.
          </li>
          <li>
            <strong>Content readiness.</strong> Strategy, copywriting, editing,
            photography, and asset preparation add work when the business does
            not have launch-ready material.
          </li>
          <li>
            <strong>Design requirements.</strong> Adapting a proven system takes
            less effort than developing an original visual direction and
            responsive behavior around the brand.
          </li>
          <li>
            <strong>Integrations and commerce.</strong> Scheduling, CRM, email,
            inventory, payments, shipping, taxes, and account systems introduce
            setup, testing, and ongoing dependencies.
          </li>
          <li>
            <strong>Custom functionality.</strong> Quote and estimate tools,
            calculators, booking, ordering, lead capture, or customer portals
            need product decisions and engineering beyond a standard marketing
            site.
          </li>
          <li>
            <strong>Migration and launch risk.</strong> Existing URLs, content,
            analytics, forms, domains, and search visibility must be preserved
            carefully during a redesign.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection id="ongoing-cost" title="Budget for ownership, not only launch">
        <p>
          The project invoice is one part of the cost. Depending on the setup,
          the business may also pay for a domain, hosting or platform plan,
          email, premium software, ecommerce fees, maintenance, backups,
          security work, content updates, analytics, SEO, and future features.
        </p>
        <p>
          Ask which costs are recurring, which accounts belong to the business,
          and what happens if the relationship with the provider ends. A lower
          launch price can become expensive when routine changes require a
          specialist or the platform cannot support the next phase. The reverse
          is also true: paying for custom infrastructure is wasteful when a
          managed platform already handles the job well.
        </p>
      </ArticleSection>

      <ArticleSection id="budget" title="Turn the range into a first-year budget">
        <p>
          Build two columns: launch and twelve months of operation. Under
          launch, include strategy, content, design, development, integrations,
          migration, testing, and project management. Under operation, include
          the domain, platform or hosting, email, paid extensions, transaction
          fees, maintenance, content changes, analytics, SEO, and planned
          improvements. Add the value of owner or employee time when comparing
          DIY with professional work.
        </p>
        <p>
          Then separate launch requirements from later opportunities. Define
          the customer action the first version must support and postpone
          features that do not protect that path. Veriq does not publish a
          fixed package or invent a number before understanding the work. For
          the local buying question, use our separate guide to{" "}
          <Link href="/resources/how-much-does-a-website-cost-in-des-moines">
            website cost in Des Moines
          </Link>
          , which focuses on comparing provider proposals rather than national
          market ranges.
        </p>
        <ArticleCallout title="Need help defining the right level of investment?">
          <p>
            See how Veriq approaches{" "}
            <Link href="/small-business-web-design">
              professional websites for small businesses
            </Link>{" "}
            or compare a{" "}
            <Link href="/resources/web-designer-vs-website-builder-for-small-business">
              web designer with a DIY website builder
            </Link>{" "}
            before requesting proposals.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
