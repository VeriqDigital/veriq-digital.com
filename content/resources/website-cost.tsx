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
          Asking what a website costs is a little like asking what a building
          costs. A one-room office, a restaurant, and a warehouse all have
          walls and doors, but they solve different problems. Websites are the
          same. A five-page informational site and a custom quoting platform
          should not carry the same scope or price.
        </p>
        <p>
          That is why a useful proposal begins with the business goal. Is the
          site meant to establish credibility, generate qualified leads,
          support multiple service areas, sell products, or connect to an
          existing system? Once the outcome is clear, a designer can define
          what the website actually needs instead of pricing an arbitrary page
          count.
        </p>
        <ArticleCallout title="A better first question">
          <p>
            Instead of asking, “How much is a website?” ask, “What must this
            website help the business accomplish, and what work is required to
            make that happen?” The answer gives you something useful to compare
            across proposals.
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
            Veriq does not publish a one-size-fits-all price because the right
            scope depends on the business. Explore our approach to{" "}
            <Link href="/des-moines-web-design">
              professional web design in Des Moines
            </Link>
            , then share the problem you want the site to solve. We can define
            the work before discussing a proposal.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
