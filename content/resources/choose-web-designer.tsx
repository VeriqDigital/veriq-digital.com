import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
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

      <ArticleSection id="questions" title="Questions worth asking before you sign">
        <ol>
          <li>How will you learn about our business and customers?</li>
          <li>What is included in the scope, and what commonly becomes an added cost?</li>
          <li>Who writes and approves the content?</li>
          <li>Who will design and develop the site?</li>
          <li>How will mobile usability, accessibility, performance, and SEO be checked?</li>
          <li>What do we own at launch, and can another provider take over later?</li>
          <li>What support is available after launch?</li>
          <li>What could delay the timeline, and how are changes handled?</li>
        </ol>
        <p>
          Compare the specificity of the answers, not just the confidence with
          which they are delivered. A thoughtful provider will sometimes ask
          for more context before recommending a solution.
        </p>
        <ArticleCallout title="Where Veriq fits">
          <p>
            Veriq is a founder-led option for businesses that want direct access
            to the person planning, designing, and building the work. Our{" "}
            <Link href="/des-moines-web-design">
              Des Moines website design approach
            </Link>{" "}
            starts with the business and continues through launch support. If
            that model matches what you are evaluating, the next step is a
            straightforward conversation.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
