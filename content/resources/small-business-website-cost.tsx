import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

// Illustrative USD amounts only; these are not vendor quotes or Veriq prices.
export const firstYearBudgetExample = {
  project: 4000,
  domainAnnual: 20,
  hostingMonthly: 25,
  emailMonthly: 8,
  maintenanceMonthly: 50,
  optionalSoftwareMonthly: 10,
  months: 12,
} as const;

const budget = firstYearBudgetExample;
export const firstYearOperatingTotal =
  budget.domainAnnual +
  budget.months *
    (budget.hostingMonthly +
      budget.emailMonthly +
      budget.maintenanceMonthly +
      budget.optionalSoftwareMonthly);
export const firstYearBudgetTotal = budget.project + firstYearOperatingTotal;

const dollars = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function SmallBusinessWebsiteCostArticle() {
  return (
    <>
      <ArticleSection id="useful-range" title="Budget for launch and a year of operation">
        <p>
          A small-business website budget has two parts: the work needed to
          launch it and the services needed to keep it running. Building it
          yourself means paying for software and supplying the labor. Hiring a
          professional adds planning, design, development, and testing to the
          budget. Specialized functionality adds its own scope.
        </p>
        <p>
          For a concrete professional starting point, Veriq currently lists
          smaller custom website projects from $1,000 and larger Growth
          projects from $2,500. Those are starting points for scoped work,
          not national averages or an all-in annual budget. The{" "}
          <Link href="/pricing">current pricing page</Link> explains the
          distinction. The worked example below shows how to add operating
          costs to a hypothetical project fee.
        </p>
        <ArticleCallout title="Compare the same scope before comparing prices">
          <p>
            A five-page site with finished copy and a contact form is a
            different purchase from five pages requiring interviews, writing,
            photography, booking, and migration. A page count alone cannot
            tell you whether two quotes cover the same work.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="approaches" title="Use four scope bands, not one average">
        <ComparisonTable
          caption="Four small-business website scopes and the costs to budget for"
          columns={["Scope band", "What you are paying for", "What changes the total"]}
          rows={[
            [
              "Owner-built",
              "A builder or hosting plan; you handle content, design decisions, setup, and testing.",
              "Plan level, domain, email, apps, commerce fees, purchased assets, and outside help.",
            ],
            [
              "Professional work on an established system",
              "A provider configures and adapts an existing platform or template, using its supported features.",
              "Content readiness, template customization, page types, platform setup, and the provider’s role.",
            ],
            [
              "More extensive custom design and development",
              "Original structure, visual design, and implementation, with more decisions and production work.",
              "Research, copy, visual direction, content depth, migration, testing, and launch responsibility.",
            ],
            [
              "Custom functionality",
              "Specialized commerce, customer portals, or business-specific workflows that need their own specification and testing.",
              "Product decisions, engineering, data, security, edge cases, integrations, and long-term support.",
            ],
          ]}
        />
        <p>
          These scopes overlap. A professional can use an established platform
          and still provide substantial custom design. A standard booking
          integration is also different from building a booking system. Ask
          which work the provider is doing and which existing tools cover the
          requirement. For that decision, compare{" "}
          <Link href="/resources/web-designer-vs-website-builder-for-small-business">
            a web designer with a DIY website builder
          </Link>.
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
          Recurring costs pay for different things. Some may be bundled into a
          platform or support agreement; do not count them twice. Make a list
          showing the supplier, renewal amount, billing frequency, and person
          responsible for each item.
        </p>
        <ul>
          <li>
            <strong>Domain.</strong> The registration for your website address.
            Check renewals even when the first year is included. For example,{" "}
            <a href="https://wordpress.com/support/domains/register-a-free-domain/">
              WordPress.com’s annual-plan domain credit
            </a>{" "}
            covers the first year of an eligible new registration; renewal
            is separate afterward.
          </li>
          <li>
            <strong>Hosting or platform.</strong> The service that runs the
            site. Confirm whether backups, software updates, and technical
            support are included and what the business still has to manage.
          </li>
          <li>
            <strong>Business email.</strong> Mailboxes using your domain may be
            a separate subscription. Count the accounts you need and any
            migration or setup work.
          </li>
          <li>
            <strong>Maintenance and updates.</strong> Distinguish keeping the
            underlying system working from changing text, adding pages, or
            improving the site. Agree on who does each job and how extra work
            is approved.
          </li>
          <li>
            <strong>Optional software.</strong> Booking tools, paid extensions,
            email marketing, and other services may have their own fees.
            Include only the tools the site actually needs; transaction or
            usage charges require separate estimates when relevant.
          </li>
        </ul>
        <p>
          Check the amount due at checkout as well as the advertised monthly
          equivalent. Annual billing, introductory offers, and usage limits
          can change the cash you need now and at renewal. Recurring spending
          is useful when it covers work or services the business needs.
        </p>
      </ArticleSection>

      <ArticleSection id="budget" title="A worked first-year website budget">
        <p>
          <strong>Hypothetical example, in US dollars.</strong> A service
          business commissions five pages: home, services, about, work, and
          contact. The assumed project fee includes planning, design,
          development, a contact form, mobile and functional checks, basic
          on-page SEO setup, and launch. The owner supplies final copy,
          branding, and images. This is a budgeting exercise, not a market
          average, actual quote, or Veriq offer.
        </p>
        <ComparisonTable
          caption="Hypothetical budget: a five-page site plus 12 months of operation"
          columns={["Budget item", "Assumed charge", "First-year amount"]}
          rows={[
            [
              "Website project",
              `${dollars(budget.project)} once`,
              dollars(budget.project),
            ],
            [
              "Domain",
              `${dollars(budget.domainAnnual)} per year`,
              dollars(budget.domainAnnual),
            ],
            [
              "Hosting/platform",
              `${dollars(budget.hostingMonthly)} per month × ${budget.months}`,
              dollars(budget.hostingMonthly * budget.months),
            ],
            [
              "One business email account",
              `${dollars(budget.emailMonthly)} per month × ${budget.months}`,
              dollars(budget.emailMonthly * budget.months),
            ],
            [
              "Maintenance and minor updates",
              `${dollars(budget.maintenanceMonthly)} per month × ${budget.months}`,
              dollars(budget.maintenanceMonthly * budget.months),
            ],
            [
              "Optional scheduling software",
              `${dollars(budget.optionalSoftwareMonthly)} per month × ${budget.months}`,
              dollars(budget.optionalSoftwareMonthly * budget.months),
            ],
            [
              "Operating subtotal",
              "Domain plus all recurring items above",
              dollars(firstYearOperatingTotal),
            ],
            [
              "First-year total",
              "Project plus operating subtotal",
              dollars(firstYearBudgetTotal),
            ],
          ]}
        />
        <p>
          The {dollars(firstYearOperatingTotal)} operating subtotal assumes a
          full {budget.months} months after launch, unchanged charges, and no
          free introductory periods. Hosting covers infrastructure; the
          separate maintenance allowance assumes a monthly form/link check
          and minor text updates. Scheduling software is optional and paid
          separately; this example assumes a simple link to it, not a custom
          integration. Replace every assumed amount with the relevant quote
          or vendor price for your own budget.
        </p>
        <ArticleCallout title="What this example leaves out">
          <p>
            Taxes, copywriting, photography, a new logo, content migration,
            ecommerce and payment fees, custom integrations, paid advertising,
            ongoing SEO campaigns, major changes, and owner time are excluded.
            There is no contingency reserve in the total. Add any that apply
            before treating the number as your spending limit.
          </p>
        </ArticleCallout>
        <p>
          Your own budget should separate launch requirements from later
          improvements. Define the customer action the first version must
          support, then identify what can wait. If the same work is offered
          under different billing arrangements, use the guide to{" "}
          <Link href="/resources/one-time-website-pricing-vs-monthly-plans">
            one-time website pricing versus monthly plans
          </Link>{" "}
          to compare the payment schedule and continuing obligations.
        </p>
      </ArticleSection>

      <ArticleSection id="where-veriq-fits" title="Where Veriq fits">
        <p>
          Veriq publishes project starting points so you can assess fit before
          requesting a proposal. Essential starts at <strong>$1,000</strong>{" "}
          for a focused professional presence, with 1–3 core pages depending
          on scope. Growth starts at <strong>$2,500</strong> for an expanded
          multi-page site with more involved layouts, service-specific pages, and
          lead paths. Custom functionality, integrations, and more complex
          applications receive a custom quote.
        </p>
        <p>
          These are guides, not fixed packages that promise every project will
          fit the starting amount. Final scope and price depend on the work;
          payment structure and responsibilities are set out in the proposal.
          Ongoing updates and support can be discussed separately. None of the
          hypothetical operating charges above represents a Veriq fee.
        </p>
        <p>
          Review <Link href="/pricing">Veriq’s current website pricing</Link>{" "}
          alongside the approach to{" "}
          <Link href="/small-business-web-design">
            small-business website design
          </Link>
          . Bring the required pages, available content, essential
          functionality, and post-launch support needs to the conversation.
          That is enough to start defining a useful scope.
        </p>
      </ArticleSection>
    </>
  );
}
