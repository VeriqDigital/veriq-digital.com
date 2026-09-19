import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function WebDesignerVsWebsiteBuilderArticle() {
  return (
    <>
      <ArticleSection id="real-choice" title="The real choice is DIY versus professional help">
        <p>
          A website builder is software. A web designer is a person or team
          responsible for decisions. The categories overlap because a
          professional may work within a managed builder when it fits the
          project, while a business owner may use the same software alone.
        </p>
        <p>
          The useful comparison is who supplies the planning, writing, design
          judgment, setup, and maintenance. Professionals can use builders,
          content management systems, and templates. Buying the software alone
          does not assign someone to organize your services or test the customer path.
        </p>
        <p>
          You can also split the work: build the site yourself but hire a writer,
          or hire someone to launch it and manage routine updates yourself.
          Decide who is responsible for each task before comparing the price.
        </p>
      </ArticleSection>

      <ArticleSection id="comparison" title="Compare the responsibilities, not just the subscription">
        <ComparisonTable
          caption="Website responsibilities to assign in a DIY or professional project"
          columns={["Responsibility", "DIY builder", "Professional engagement"]}
          rows={[
            ["Goals and requirements", "You define the audience, customer action, and required features.", "You supply business knowledge; the provider can help turn it into a scoped plan."],
            ["Page structure", "You organize pages, navigation, and the route to contacting or buying.", "Ask whether page planning and navigation are included, and who approves them."],
            ["Copy and imagery", "You prepare content or arrange separate writing and photography help.", "Writing and image sourcing may be included, shared, or excluded. Confirm who supplies each."],
            ["Visual design", "You choose layouts, type, imagery, and how the brand appears.", "The provider makes design decisions within the agreed scope; you give feedback and approval."],
            ["Responsive behavior", "You check your actual content and controls at different screen sizes.", "Confirm which page types and devices the provider will implement and test."],
            ["Forms and integrations", "You configure connections and verify the complete customer path.", "Specify the integrations, test cases, and who supplies account access."],
            ["Accessibility and quality", "You review keyboard use, labels, contrast, errors, and readability.", "Ask what checks are included and how issues found during review are handled."],
            ["SEO foundations", "You configure titles, indexing settings, links, and redirects where needed.", "Agree on specific setup and migration tasks; a promise of SEO alone is too vague."],
            ["Analytics", "You set up measurement and check that meaningful events are recorded.", "Confirm account access, event setup, consent requirements, and validation responsibilities."],
            ["Launch", "You connect the domain, check production settings, and resolve launch issues.", "Name who launches, who approves, and who checks the live site."],
            ["Ongoing maintenance", "The platform may maintain infrastructure; you still own content, renewals, and troubleshooting.", "Handoff or ongoing support depends on the agreement; confirm coverage and costs."],
            ["Future changes", "You implement changes within your skills and the platform’s capabilities, or seek help.", "Confirm the editing handoff and how new work is requested and priced."],
          ]}
        />
        <p>
          These are responsibilities to discuss, not services automatically
          included with either option. Even a fully managed engagement needs
          accurate business information and timely decisions from the owner.
        </p>
      </ArticleSection>

      <ArticleSection id="diy-fit" title="When building it yourself is a sensible decision">
        <p>
          DIY can work for a new or established business when the scope is
          manageable and the owner wants to operate the site. A carefully
          prepared builder site can be clear, credible, and useful.
        </p>
        <ul>
          <li>The site has a small page set and a simple customer path.</li>
          <li>The platform’s standard features cover the requirements without fragile workarounds.</li>
          <li>The message, branding, copy, and imagery are already reasonably clear.</li>
          <li>You have time and interest to learn the editor and test the result.</li>
          <li>Little custom functionality is required, and help is available if you reach a limit.</li>
          <li>The time spent building will not delay more valuable business work.</li>
        </ul>
        <p>
          Keep the first version focused. Use a supported template, write a
          clear explanation of the service, include accurate contact details,
          create one obvious next step, and test the site on a phone. Avoid
          adding apps and visual effects before the core path works.
        </p>
        <ArticleCallout title="Count the owner’s time honestly">
          <p>
            DIY is not free. It trades professional fees for hours spent
            learning, writing, designing, configuring, and maintaining the
            site. That can be a good trade when the business has the time and
            the website is simple enough.
          </p>
          <p>
            For cash planning, the <Link href="/resources/how-much-does-a-small-business-website-cost">small-business website cost guide</Link>{" "}
            separates project work from recurring operating costs. Include your
            own time alongside those expenses when weighing the trade.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="designer-fit" title="When hiring help may fit">
        <p>
          Hiring a designer becomes more valuable when the site affects
          credibility, lead quality, local search, or a complicated customer
          decision. It can also reduce risk during a redesign, when existing
          URLs, analytics, content, domains, and integrations need to survive the
          move.
        </p>
        <ul>
          <li>The site supports meaningful lead generation, and a broken launch would disrupt inquiries.</li>
          <li>Several services or audiences make the message and page structure difficult to prioritize.</li>
          <li>The website must look consistent with an established business.</li>
          <li>You need help implementing and checking mobile behavior, accessibility, performance, or technical SEO.</li>
          <li>The site needs booking, quoting, ecommerce, intake, or integrations.</li>
          <li>The owner cannot reasonably lead writing, design, setup, and testing.</li>
          <li>The business wants continued support after launch.</li>
        </ul>
        <p>
          Relevant expertise and a clear testing process are reasons to hire;
          the job title alone is not evidence of either. Professional work
          cannot guarantee leads or rankings. During a redesign, ask how the
          provider will <Link href="/resources/website-redesign-seo-checklist">preserve and check existing search foundations</Link>.
        </p>
      </ArticleSection>

      <ArticleSection id="decision" title="A short decision worksheet">
        <p>
          Write an answer and name a responsible person for each question.
          An unanswered item is a task to resolve, not a point against DIY.
        </p>
        <ul>
          <li>Do I know which pages, content, and customer actions the site needs?</li>
          <li>Can I build and test them without delaying other business work?</li>
          <li>Have I checked that the platform supports every essential requirement?</li>
          <li>Who will test mobile layouts, keyboard use, forms, and measurement before launch?</li>
          <li>Who will fix a problem after launch, and what access will they need?</li>
          <li>Who will maintain content and renew accounts?</li>
          <li>What happens when the site needs more pages, services, or functionality?</li>
        </ul>
        <p>
          If the answers are clear and the work fits your capacity, DIY may be
          a sound choice. If a few gaps remain, focused help may be enough. If
          planning, production, and launch all lack an owner, compare a broader
          professional engagement.
        </p>
        <p>
          Once responsibility is clear, consider <Link href="/resources/custom-website-vs-template-for-small-business">whether a template, established platform, or more custom development fits the implementation</Link>.
          That is a separate decision: hiring help does not automatically
          require custom code.
        </p>
        <p>
          When evaluating professional help, use the questions in our guide to{" "}
          <Link href="/resources/how-to-choose-a-web-designer-in-des-moines">
            choosing a web designer
          </Link>
          . The framework applies beyond geography even though the article is
          written for Des Moines buyers.
        </p>
        <ArticleCallout title="Veriq provides custom website design and development">
          <p>
            Veriq plans, designs, and develops custom websites around the
            business, its customers, and the actions the site needs to support.
            Explore the{" "}
            <Link href="/small-business-web-design">
              small-business website design approach
            </Link>{" "}
            to see how those requirements shape the broader process.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
