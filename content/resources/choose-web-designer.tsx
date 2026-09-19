import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function ChooseWebDesignerArticle() {
  return (
    <>
      <ArticleSection id="define-project" title="Define the problem before comparing providers">
        <p>
          A designer can only be a good fit in relation to the project. Before
          opening a dozen portfolio tabs, write down why the website needs to
          change. Common reasons include weak credibility, poor mobile use,
          unclear services, too few qualified inquiries, difficult updates, or
          a customer action the current site cannot support.
        </p>
        <p>
          Add the constraints that matter: who will approve the work, what
          content exists, whether there is a launch date, which systems must
          connect, and who should maintain the finished site. This brief does
          not need to prescribe technology or page layouts. It should give
          providers a clear business problem to respond to.
        </p>
        <p>
          Send the same brief to each provider. If the proposals solve different
          problems, their prices will not tell you much. Use the{" "}
          <Link href="/resources/how-much-does-a-small-business-website-cost">
            small-business website cost guide
          </Link>{" "}
          to establish a budget and separate launch requirements from work that
          can wait.
        </p>
      </ArticleSection>

      <ArticleSection id="evaluate-work" title="Look past the portfolio thumbnail">
        <p>
          Strong visuals matter, but a polished screenshot does not tell you
          whether the site is useful. Open the live work when possible and test
          it as a customer would. Can you understand the business quickly? Are
          services easy to find? Does the primary action make sense? Does the
          experience remain clear on a phone?
        </p>
        <p>
          Ask the designer what they were responsible for. Strategy, copy,
          photography, interface design, development, and ongoing optimization
          may come from different people. That is normal, but you should know
          which capabilities the work actually demonstrates.
        </p>
        <ul>
          <li>
            <strong>Demonstration or concept work</strong> can show design and
            development ability. It does not establish a paid client
            relationship or a business outcome. Ask which parts are working
            and which are illustrative.
          </li>
          <li>
            <strong>Client work</strong> should identify the provider’s actual
            contribution. A site built by several specialists is relevant
            evidence when you understand the role of the person you may hire.
          </li>
          <li>
            <strong>Measured results</strong> need context. If a case study
            reports more inquiries, ask about the measurement period, starting
            point, tracking method, and other changes such as advertising.
            A screenshot alone cannot substantiate that result.
          </li>
        </ul>
        <ArticleCallout title="Watch how the provider explains decisions">
          <p>
            A useful case study connects a design choice to a user or business
            need. Be cautious when every explanation stops at “modern,”
            “beautiful,” or “on brand.” Those qualities are valuable, but they
            are not a strategy by themselves.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="technical-baseline" title="Check the technical baseline">
        <p>
          You do not need to become a developer to ask good questions. The
          provider should be able to explain how they handle the fundamentals
          in plain language:
        </p>
        <ul>
          <li>Responsive behavior across current phones, tablets, and desktops.</li>
          <li>Page speed, image handling, and avoidance of unnecessary scripts.</li>
          <li>Keyboard use, readable contrast, form labels, and other accessibility basics.</li>
          <li>Unique page titles, descriptions, crawlable content, sitemap, and redirects.</li>
          <li>Form reliability, spam protection, security updates, and backups.</li>
          <li>Analytics setup that measures meaningful actions rather than page views alone.</li>
        </ul>
        <p>
          No provider can honestly guarantee rankings or perfect performance
          scores in every situation. They should be able to describe the
          technical standard they build toward and the tradeoffs a particular
          feature introduces.
        </p>
      </ArticleSection>

      <ArticleSection id="ownership-support" title="Clarify ownership, hosting, and support">
        <p>
          Before signing, establish who owns the domain, content, design files,
          code, analytics accounts, and third-party subscriptions. Ideally,
          critical business accounts are created in the client’s name with the
          provider receiving appropriate access.
        </p>
        <p>
          Ask what happens after launch. Some businesses want a handoff and an
          editing guide. Others prefer a partner to handle hosting,
          maintenance, content, analytics, SEO, and continued development.
          Either model can work when expectations, response times, and ongoing
          costs are explicit.
        </p>
        <p>
          Communication belongs in this conversation too. Find out who leads
          the project, who does the work, how feedback is collected, and how
          often you will see progress. The best process is one your team can
          participate in without becoming the project manager.
        </p>
      </ArticleSection>

      <ArticleSection id="proposal-worksheet" title="Compare proposals using the same worksheet">
        <p>
          Copy these rows into your notes and record an answer for each
          shortlisted provider. Mark each item as included, excluded, optional,
          or unanswered, with a reference to the relevant proposal section.
          A missing answer is a follow-up question, not an automatic rejection.
        </p>
        <ComparisonTable
          caption="Website proposal-comparison worksheet: questions and evidence to record for each provider"
          columns={["Compare", "Ask each provider", "Record for each proposal"]}
          rows={[
            [
              "Deliverables and page types",
              "Which pages, distinct layouts, features, and integrations will be delivered? What is outside the scope?",
              "Page list, repeated versus unique layouts, working features, and exclusions.",
            ],
            [
              "Content and imagery",
              "Who writes, edits, sources, licenses, and approves text and images?",
              "Named responsibility, content deadlines, and any separate copy or photography costs.",
            ],
            [
              "Who performs the work",
              "Who plans, designs, develops, and manages the project? Will other specialists participate?",
              "Your contact, delivery roles, and responsibilities for outside contributors.",
            ],
            [
              "Relevant capabilities",
              "Which examples demonstrate the specific work our project needs, and what did you contribute?",
              "Relevant live work or demos, the provider’s role, and evidence behind any claimed results.",
            ],
            [
              "Review and approval",
              "When do we review work, who approves it, and how are revisions or scope changes handled?",
              "Review stages, included revisions, decision deadlines, and the change-approval process.",
            ],
            [
              "Mobile, accessibility, and functionality",
              "What devices, browsers, keyboard paths, forms, and integrations will be tested? How are issues resolved?",
              "Testing scope, accessibility checks, acceptance criteria, and who confirms fixes.",
            ],
            [
              "Accounts and handoff",
              "Who controls the domain, hosting, analytics, and other accounts? What files, access, and instructions transfer?",
              "Account holders, access levels, handoff materials, licensing limits, and portability questions.",
            ],
            [
              "Launch responsibilities",
              "Who connects the domain, checks forms, handles redirects, and verifies the live site?",
              "Launch owner, dependencies, go-live approval, and a plan if a launch problem occurs.",
            ],
            [
              "Ongoing support and costs",
              "What continues after launch, what does it cost, and what happens when support ends?",
              "Recurring charges, edit limits, support hours, response expectations, and handoff or cancellation terms.",
            ],
            [
              "Unresolved questions",
              "Which assumptions still need a decision before we can approve the work?",
              "Open questions, who answers them, and any effect on price or schedule.",
            ],
          ]}
        />
        <p>
          Ask providers to resolve material gaps in writing before choosing.
          If one quote includes content, migration, and launch testing while
          another leaves them to you, compare that responsibility as well as
          the total. A higher fee may cover more work; it still needs to match
          what your business actually requires.
        </p>
      </ArticleSection>

      <ArticleSection id="specific-answers" title="Turn broad promises into specific answers">
        <p>
          The examples below are invented illustrations, not quotations from
          providers or statements of Veriq’s terms. They show the level of
          detail to seek when a proposal uses a broad label.
        </p>
        <ComparisonTable
          caption="Illustrative vague and specific website proposal answers"
          columns={["Vague answer", "What remains unclear", "A more specific illustrative answer"]}
          rows={[
            [
              "SEO included",
              "Which pages and tasks are covered? Does this include ongoing content or only launch setup?",
              "We will write unique titles and descriptions for the agreed pages, add a sitemap, implement the agreed redirect list, and set up Search Console access. Ongoing content and outreach are excluded.",
            ],
            [
              "Ongoing support",
              "Which tasks, costs, availability, and response expectations apply?",
              "The support fee covers software updates and restoring backups. Copy edits and new pages are quoted separately. The support schedule lists the fee, service hours, response target, and excluded work.",
            ],
            [
              "You own the website",
              "Which accounts and files transfer? What depends on a platform or third-party license?",
              "Your business holds the domain and analytics accounts. Handoff includes the agreed source files and editing guide. The proposal lists licensed assets, platform dependencies, and what can be moved to another host.",
            ],
          ]}
        />
        <p>
          Specific language makes proposals easier to evaluate, but wording
          alone does not settle contractual rights. Confirm that the agreement,
          account arrangements, and third-party licenses match what you expect.
          Paying upfront or monthly does not answer these questions by itself;
          the guide to{" "}
          <Link href="/resources/one-time-website-pricing-vs-monthly-plans">
            one-time website pricing and monthly plans
          </Link>{" "}
          explains how to compare continuing costs and responsibilities.
        </p>
      </ArticleSection>

      <ArticleSection id="questions" title="Questions worth asking before you sign">
        <ol>
          <li>How will you learn about our business and customers?</li>
          <li>Why does your proposed approach fit the problem in our brief?</li>
          <li>What do you need from us, and what could delay the timeline?</li>
          <li>Which unanswered assumptions could still change the price or scope?</li>
        </ol>
        <p>
          Compare the specificity of the answers, not just the confidence with
          which they are delivered. A thoughtful provider will sometimes ask
          for more context before recommending a solution. If the choice is
          between a solo provider and a larger team, our{" "}
          <Link href="/resources/local-web-designer-vs-large-agency">
            local designer and agency comparison
          </Link>{" "}
          covers the differences in capacity and communication to check.
        </p>
        <ArticleCallout title="Where Veriq fits">
          <p>
            Veriq is based in Des Moines and works with businesses in Central
            Iowa and remotely. You work directly with the person planning,
            designing, and building the project. Our{" "}
            <Link href="/des-moines-web-design">
              Des Moines website design approach
            </Link>{" "}
            starts with the business and continues through launch, with ongoing
            support defined around the project. Review the approach to decide
            whether that working model fits your needs.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
