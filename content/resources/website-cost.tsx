import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function WebsiteCostArticle() {
  return (
    <>
      <ArticleSection id="why-prices-vary" title="Why website prices vary so much">
        <p>
          There is no reliable single average for a website in Des Moines. A
          focused professional site for a service business sits at one end of
          the market. A project that also needs original content, a new design
          system, migration, local-search planning, or ongoing support requires
          more work. Quoting tools, ordering, customer portals, and custom
          integrations can turn the website into a much larger software
          project.
        </p>
        <p>
          When I scope a website, I care less about the raw page count than what
          each page and feature has to do. A five-page site with finished copy
          and a standard contact form is very different from five pages that
          require research, writing, custom photography, scheduling, and a CRM
          connection. A proposal should price the work behind the pages, not
          treat every page as an interchangeable unit.
        </p>
        <ArticleCallout title="Decide what job the website has in Des Moines">
          <p>
            A referral-driven business may only need a credible place where
            people can verify services, service area, proof, and contact details.
            A business expecting the site to produce local leads needs stronger
            service pages, a deliberate path to call or request a quote,
            consistent Google Business Profile information, measurement, and
            continued search work. Those are different scopes even when the
            menus look similar.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="cost-drivers" title="The main cost drivers">
        <p>
          Most Des Moines website proposals are shaped by a familiar set of
          variables. The combination matters more than any single line item.
        </p>
        <ul>
          <li>
            <strong>Scope and page types.</strong> A focused service page is
            different from a location system, resource library, portfolio, or
            ecommerce catalog. Reusable page types may reduce effort, while
            specialized pages add strategy and design work.
          </li>
          <li>
            <strong>Custom design.</strong> Adapting a proven template is less
            involved than creating a visual system and layouts around a
            business’s positioning, content, and customer journey.
          </li>
          <li>
            <strong>Content.</strong> If the business has polished copy and
            photography ready, production can move quickly. Content strategy,
            copywriting, editing, and image production expand the project.
          </li>
          <li>
            <strong>Local reach and lead expectations.</strong> A site that
            validates referrals needs less search and conversion work than one
            expected to compete for several services across Des Moines and
            nearby service areas.
          </li>
          <li>
            <strong>Functionality.</strong> Booking, quoting, customer portals,
            gated content, calculators, ecommerce, and account features require
            more planning, development, testing, and security review than a
            standard contact form.
          </li>
          <li>
            <strong>Integrations.</strong> Connecting a CRM, email platform,
            payment provider, scheduling tool, inventory system, or internal
            software can range from simple configuration to custom engineering.
          </li>
          <li>
            <strong>Ongoing support.</strong> Hosting, maintenance, analytics,
            content updates, SEO work, and future improvements may be included,
            optional, or handled by another provider. The proposal should say.
          </li>
        </ul>
      </ArticleSection>

      <ArticleSection id="routes" title="DIY, template, or custom work">
        <p>
          Price often reflects the route you choose. None is automatically
          right or wrong; each makes a different tradeoff between money, time,
          flexibility, and outside expertise.
        </p>
        <ComparisonTable
          caption="Comparison of common website project approaches"
          columns={["Approach", "Usually fits", "Watch for"]}
          rows={[
            [
              "DIY builder",
              "A new or very small business with simple needs, available time, and a limited budget.",
              "The owner supplies strategy, copy, design judgment, setup, and maintenance.",
            ],
            [
              "Template-based service",
              "A business that needs a straightforward site and can work within a defined system.",
              "Confirm what can be customized, who owns the content, and how the site can grow.",
            ],
            [
              "Custom website",
              "A business with specific positioning, conversion goals, workflows, or integrations.",
              "Higher upfront effort only makes sense when the scope supports a real business need.",
            ],
          ]}
        />
        <p>
          A custom site should not mean adding complexity for its own sake. It
          means the structure, content, design, and development decisions are
          made around the business rather than around the limits of a premade
          layout.
        </p>
      </ArticleSection>

      <ArticleSection id="proposal" title="How to read a website proposal">
        <p>
          Two totals are not comparable unless the underlying work is
          comparable. Look for a clear description of discovery, content
          responsibilities, design rounds, development, mobile behavior,
          accessibility, technical SEO, analytics, launch support, and
          post-launch ownership.
        </p>
        <p>
          Also check what is excluded. Domain registration, hosting, paid
          software, photography, copywriting, ecommerce fees, and ongoing
          maintenance may sit outside the project price. An honest exclusion is
          not a problem. A vague scope is.
        </p>
        <p>
          If a proposal uses a single total with no explanation of deliverables
          or process, ask for enough detail to understand what will exist at
          launch and what your team must provide along the way.
        </p>
      </ArticleSection>

      <ArticleSection id="budget" title="Plan a useful budget, not a magic number">
        <p>
          Start with the value and urgency of the problem. A business that only
          needs a credible place to send referrals has a different requirement
          than one losing leads through a broken mobile experience or replacing
          a manual quoting process.
        </p>
        <p>
          Write down the must-have outcome, the features required for launch,
          the content you already have, and the improvements that can wait. That
          gives potential partners room to recommend a sensible first version
          without hiding important work.
        </p>
        <ArticleCallout title="Ready for a scoped conversation?">
          <p>
            I would rather define a smaller first version that does its job than
            pad a proposal with pages or features the business cannot use yet.
            Explore Veriq&apos;s approach to{" "}
            <Link href="/des-moines-web-design">
              professional web design in Des Moines
            </Link>
            , then bring the business goal, current content, and required
            customer actions to the scope conversation.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
