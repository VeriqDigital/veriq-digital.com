import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

// Illustrative inputs, not market averages, provider quotes, or Veriq pricing.
export const paymentExample = {
  project: { initial: 3600, monthly: 35 },
  managed: { initial: 300, monthly: 200 },
} as const;

export const paymentExampleTotal = (
  arrangement: keyof typeof paymentExample,
  months: number,
) => paymentExample[arrangement].initial + paymentExample[arrangement].monthly * months;

const dollars = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);

export default function OneTimeWebsitePricingVsMonthlyPlansArticle() {
  return (
    <>
      <ArticleSection id="arrangements" title="Compare what the payment buys">
        <p>
          One-time website pricing usually means a defined fee to plan, design,
          build, and launch an agreed website. A monthly plan may spread that
          project fee over time, or it may buy an ongoing service. Those are
          different commitments, even when the monthly bill looks similar.
        </p>
        <p>
          Start by separating the cost of creating the site from the work and
          charges that continue after launch. A project fee does not eliminate
          hosting or future updates. A recurring bill does not, by itself, tell
          you how much help is included.
        </p>
        <ComparisonTable
          caption="Three website payment arrangements and the responsibilities behind them"
          columns={["Arrangement", "What you are paying for", "What to clarify"]}
          rows={[
            ["Defined project fee", "An agreed build and launch scope, paid at once or in installments.", "Total fee, payment milestones, completion criteria, and separate operating costs."],
            ["Managed monthly service", "A continuing website service that may combine the build, hosting, maintenance, and a defined amount of editing.", "Initial charges, minimum term, included work, additional fees, and what happens when service ends."],
            ["DIY builder subscription", "Access to website-building software and its included platform features; the owner does much of the planning and production.", "Who writes, builds, tests, and maintains content; which features or add-ons cost extra."],
          ]}
        />
        <p>
          A DIY software subscription is not equivalent to hiring someone to
          deliver and maintain a finished site. Compare it separately, including
          your own time. If the question is how much to budget for the work
          itself, begin with the{" "}
          <Link href="/resources/how-much-does-a-small-business-website-cost">
            small-business website cost guide
          </Link>.
        </p>
      </ArticleSection>

      <ArticleSection id="schedule-and-rights" title="Payment timing does not define the whole deal">
        <p>
          Installments change when a project fee is paid. They do not necessarily
          change the deliverables or create a continuing support service. Ask
          whether there is a fixed total that ends after the final payment, or a
          recurring charge that continues while the service is active. Confirm
          whether installment pricing carries any additional charge.
        </p>
        <p>
          Paying upfront does not automatically guarantee unrestricted ownership
          or portability. Paying monthly does not automatically mean you own
          nothing. Ask the provider to identify the domain registrant, account
          administrators, content and asset rights, source files, licenses, and
          handoff materials in the proposal. A claim that you can “take the site
          with you” should explain what can actually be exported and where it can
          run. Access to an editing dashboard is not the same as a portable site.
        </p>
        <p>
          Confirm what happens after the last installment or on cancellation:
          whether the site stays online, who pays for its infrastructure, and
          who supplies the files or account transfer. These are questions to
          resolve in the agreement, not rights established by a payment label.
        </p>
      </ArticleSection>

      <ArticleSection id="worked-comparison" title="A worked 12- and 36-month comparison">
        <p>
          <strong>This is a hypothetical planning example in US dollars.</strong>{" "}
          It is not a market average, an actual offer, or Veriq pricing. Both
          arrangements assume the same five-page service-business website, with
          responsive layouts, an inquiry form, basic on-page SEO setup, testing,
          and launch. The owner supplies finished copy, a logo, and usable images.
        </p>
        <p>
          For the project arrangement, assume a build fee of{" "}
          {dollars(paymentExample.project.initial)} and hosting at{" "}
          {dollars(paymentExample.project.monthly)} per month. The owner handles
          routine content changes and arranges any technical maintenance or paid
          help separately. For the managed arrangement, assume a{" "}
          {dollars(paymentExample.managed.initial)} setup charge and{" "}
          {dollars(paymentExample.managed.monthly)} per month, including hosting,
          technical maintenance, and up to one hour of minor content edits each
          month, with unused time expiring.
        </p>
        <ComparisonTable
          caption="Hypothetical website payment totals; managed service includes ongoing work the project arrangement does not"
          columns={["Cost or condition", "Project fee + hosting", "Managed monthly service"]}
          rows={[
            ["Initial charge", dollars(paymentExample.project.initial), dollars(paymentExample.managed.initial)],
            ["Recurring monthly charge", `${dollars(paymentExample.project.monthly)} hosting only`, `${dollars(paymentExample.managed.monthly)} hosting, maintenance, and limited edits`],
            ["12-month cash total", `${dollars(paymentExample.project.initial)} + 12 × ${dollars(paymentExample.project.monthly)} = ${dollars(paymentExampleTotal("project", 12))}`, `${dollars(paymentExample.managed.initial)} + 12 × ${dollars(paymentExample.managed.monthly)} = ${dollars(paymentExampleTotal("managed", 12))}`],
            ["36-month cash total", `${dollars(paymentExample.project.initial)} + 36 × ${dollars(paymentExample.project.monthly)} = ${dollars(paymentExampleTotal("project", 36))}`, `${dollars(paymentExample.managed.initial)} + 36 × ${dollars(paymentExample.managed.monthly)} = ${dollars(paymentExampleTotal("managed", 36))}`],
            ["Assumed commitment", "Full project fee owed; hosting continues for every month shown.", "12-month minimum, then monthly; service continues for every month shown."],
            ["Ongoing work", "Owner time and separately purchased maintenance or edits are not priced here.", "Technical maintenance and the stated edit allowance are included; larger changes are extra."],
          ]}
        />
        <p>
          The calculation is initial charge + monthly charge × months. It assumes
          billing begins at the start of the comparison period, unchanged rates,
          no early cancellation, and no extra work. It does not model a buyout or
          transfer at the end. A real quote should specify notice periods,
          renewal changes, any remaining balance or exit fees, and handoff terms.
        </p>
        <p>
          Both totals exclude domain registration, business email, tax, copywriting,
          photography, premium software, ecommerce or payment fees, advertising,
          ongoing SEO campaigns, and future redesigns. Add those separately when
          they apply. Do not add hosting twice when it is already included.
        </p>
        <ArticleCallout title="A lower total is not automatically a better fit">
          <p>
            The managed example costs less over the first year and more over
            three years. It also includes continuing work. To compare equivalent
            support, obtain a price for the maintenance and edits you would need
            with the project arrangement, then add it to that total. If you do
            not need the managed allowance, its inclusion may offer little value
            to your business.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="quote-checklist" title="Questions to put beside each quote">
        <ul>
          <li><strong>Delivered website:</strong> Which pages, content work, functionality, testing, and launch tasks are included in the quoted amount?</li>
          <li><strong>Continuing responsibilities:</strong> Who handles hosting, renewals, backups where needed, software maintenance, and broken integrations?</li>
          <li><strong>Edits and support:</strong> What counts as an included edit, what is the allowance, and how are larger changes or urgent requests priced?</li>
          <li><strong>Access and handoff:</strong> Which accounts can you administer, which materials can you receive, and what would another provider need to take over?</li>
          <li><strong>Cancellation and commitment:</strong> Is there a minimum term, renewal, notice period, remaining balance, transfer charge, or buyout? What remains available after service ends?</li>
          <li><strong>Additional costs:</strong> Are domain, email, software licenses, taxes, usage limits, and future price changes accounted for?</li>
        </ul>
        <p>
          Keep unanswered items visible instead of assuming they are included.
          For a broader review of the provider, evidence, and approval process,
          use the{" "}
          <Link href="/resources/how-to-choose-a-web-designer-in-des-moines#proposal-worksheet">
            web-designer proposal worksheet
          </Link>.
        </p>
      </ArticleSection>

      <ArticleSection id="which-fits" title="Choose around cash flow and responsibility">
        <h3>A defined fee can fit a clear, finite project</h3>
        <p>
          It can suit a business with funds available for the build and a plan
          for operating the site afterward. Agree the scope, revisions, handoff,
          and recurring bills before treating the project fee as a complete
          budget. Paying it all at once is a schedule to agree, not a quality signal.
        </p>
        <h3>Installments can spread the same project commitment</h3>
        <p>
          They may help align cash flow with progress while keeping a defined
          total. Compare the full amount, milestones, and any added charges.
          Confirm what is due if the project pauses and when access or handoff
          occurs. Do not assume installments include support after completion.
        </p>
        <h3>A managed plan can fit an ongoing need for help</h3>
        <p>
          A recurring service can make sense when someone needs to keep the site
          operating and make regular changes. Its value depends on whether the
          actual support matches your needs. Review the minimum commitment and
          exit process as carefully as the monthly price. Recurring service is
          not inherently a poor deal, and custom development is not necessary
          for every business.
        </p>
        <p>
          A DIY subscription remains an option when a supported builder covers
          the requirements and you have time to do the work. Compare the work
          and responsibility you are taking on, not just its software bill.
        </p>
      </ArticleSection>

      <ArticleSection id="veriq" title="How Veriq approaches pricing">
        <p>
          Veriq publishes project starting points: Essential starts at $1,000 for
          a focused web presence, with 1–3 core pages depending on scope; Growth
          starts at $2,500 for a larger site built around generating and converting
          leads. Specialized functionality and integrations receive a custom quote.
          These are starting points, not a promise that every project fits those
          amounts. See the current scope descriptions on the{" "}
          <Link href="/pricing">Veriq pricing page</Link>.
        </p>
        <p>
          Payment structure and terms are outlined in the project proposal.
          Ongoing updates and support can be discussed around what your business
          needs after launch. The hypothetical monthly arrangement above is not
          a Veriq subscription offer. Confirm payment timing, support, account
          access, and handoff for your specific project before agreeing to it.
        </p>
        <p>
          The next useful step is to define the site and the help you need to run
          it. See Veriq’s{" "}
          <Link href="/small-business-web-design">small-business web design service</Link>{" "}
          for how those requirements shape the work.
        </p>
      </ArticleSection>
    </>
  );
}
