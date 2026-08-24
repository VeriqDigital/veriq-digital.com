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
          The useful comparison is therefore not “builder bad, custom code
          good.” It is whether the business should supply the strategy, writing,
          design judgment, setup, and maintenance itself or hire someone to
          guide and execute those decisions.
        </p>
      </ArticleSection>

      <ArticleSection id="comparison" title="Compare the responsibilities, not just the subscription">
        <ComparisonTable
          caption="DIY website builder compared with hiring a web designer"
          columns={["Consideration", "DIY builder", "Professional designer"]}
          rows={[
            [
              "Cash cost",
              "Usually lower at launch because the owner supplies the labor.",
              "Higher because planning, design, production, and quality control are part of the service.",
            ],
            [
              "Time",
              "Requires the owner to learn the system, prepare content, make decisions, and troubleshoot.",
              "Still needs owner input, but the provider leads the process and performs the production work.",
            ],
            [
              "Quality",
              "Depends on the owner’s writing, visual judgment, technical setup, and willingness to test.",
              "Should reflect an established process and relevant expertise; verify the provider’s actual work.",
            ],
            [
              "Flexibility",
              "Fast within the platform’s standard features and patterns.",
              "Can range from a professionally built platform site to fully custom development.",
            ],
            [
              "Maintenance",
              "The owner manages content, settings, renewals, and problems unless support is purchased.",
              "Responsibilities can be handed off or covered through ongoing support, depending on the agreement.",
            ],
          ]}
        />
      </ArticleSection>

      <ArticleSection id="diy-fit" title="When building it yourself is a sensible decision">
        <p>
          DIY can be appropriate when the business is new, the offer is simple,
          the budget is genuinely limited, and the owner has more available
          time than cash. It also works better when the website is primarily a
          credible reference point rather than a major source of qualified
          leads.
        </p>
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
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="designer-fit" title="When professional help earns its cost">
        <p>
          Hiring a designer becomes more valuable when the site affects
          credibility, lead quality, local search, or a complicated customer
          decision. It can also reduce risk during a redesign, when existing
          URLs, analytics, content, domains, and integrations need to survive the
          move.
        </p>
        <ul>
          <li>The services are difficult to explain or prioritize.</li>
          <li>The website must look consistent with an established business.</li>
          <li>Mobile use, accessibility, performance, and technical SEO matter.</li>
          <li>The site needs booking, quoting, ecommerce, intake, or integrations.</li>
          <li>The owner cannot reasonably lead writing, design, setup, and testing.</li>
          <li>The business wants continued support after launch.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="decision" title="Choose the operating model that fits the business">
        <p>
          Write down the site’s primary job, required functionality, launch
          deadline, available owner time, content readiness, and maintenance
          expectations. If a proven builder can support the requirements, the
          remaining question is who should plan and implement it. If the
          platform limits a necessary customer action or experience, custom
          development may be the better route.
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
