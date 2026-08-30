import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function CustomWebsiteVsTemplateArticle() {
  return (
    <>
      <ArticleSection id="terms" title="Custom and template describe a spectrum">
        <p>
          A template supplies an established layout or component system. A
          custom website is planned and designed around a particular business,
          and may also use custom development when the required behavior cannot
          be handled well by an existing platform.
        </p>
        <p>
          Many professional projects sit between the extremes. A designer might
          customize an established content system while creating a distinct
          structure, visual system, and responsive experience. Another project
          may use custom code but rely on proven interface patterns. What
          matters is where the business benefits from original work.
        </p>
      </ArticleSection>

      <ArticleSection id="template-fit" title="A template is enough when the problem is straightforward">
        <p>
          Templates are efficient when the website has a familiar page set, a
          clear service offering, standard lead forms, and modest content
          requirements. They reduce the need to invent basic layout patterns
          and can make routine editing easier for a small team.
        </p>
        <ul>
          <li>The business needs a credible first website on a controlled scope.</li>
          <li>Content fits standard home, about, service, work, and contact pages.</li>
          <li>Existing booking, email, or ecommerce tools cover the required customer action.</li>
          <li>The brand can be expressed well within the platform’s design controls.</li>
          <li>Simple maintenance is more valuable than complete implementation freedom.</li>
        </ul>
        <p>
          Professional planning still matters. A template does not decide which
          services to prioritize, write the message, select useful proof, create
          the route from interest to action, or check accessibility and
          performance.
        </p>
      </ArticleSection>

      <ArticleSection id="custom-fit" title="Custom work creates value when constraints become business constraints">
        <p>
          Custom design is useful when the business needs a more distinctive
          presentation, a content model the template handles awkwardly, or a
          conversion path that does not fit premade sections. Custom development
          becomes valuable when the site must support specialized behavior.
        </p>
        <ul>
          <li>Complex services need a tailored information structure.</li>
          <li>The experience must connect to quoting, booking, ordering, accounts, or other customer-facing systems.</li>
          <li>Performance or accessibility requirements exceed the available template setup.</li>
          <li>Content will expand across many services, markets, resources, or data types.</li>
          <li>The website itself is part of the product or customer experience.</li>
          <li>Platform restrictions would force repeated manual work or a poor customer experience.</li>
        </ul>
        <ArticleCallout title="Custom should remove a constraint">
          <p>
            Original code is not automatically more valuable. The investment is
            justified when it supports a clearer experience, necessary
            functionality, maintainability, or a growth path the simpler route
            cannot provide.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="tradeoffs" title="Compare the tradeoffs that continue after launch">
        <ComparisonTable
          caption="Template and custom website tradeoffs for a small business"
          columns={["Decision", "Template or managed platform", "Custom implementation"]}
          rows={[
            [
              "Launch efficiency",
              "Existing systems can reduce setup and production time.",
              "More planning and testing are usually required before launch.",
            ],
            [
              "Design freedom",
              "Strong within the platform’s layout and styling model.",
              "Can be shaped around the content and experience with fewer platform constraints.",
            ],
            [
              "Functionality",
              "Best when standard features and supported integrations meet the need.",
              "Best when the customer action or integration is genuinely business-specific.",
            ],
            [
              "Maintenance",
              "The platform handles much of the infrastructure and provides familiar editing tools.",
              "Responsibilities depend on the stack, hosting, documentation, and support agreement.",
            ],
            [
              "Growth",
              "Efficient until an important requirement falls outside the platform’s model.",
              "Can be designed for planned expansion, but future work still carries cost.",
            ],
          ]}
        />
      </ArticleSection>

      <ArticleSection id="decision" title="Choose the simplest approach that protects the next phase">
        <p>
          List the required content, customer actions, integrations, editing
          needs, and likely changes over the next few years. Mark what is
          essential at launch and what is only possible future scope. Then test
          whether a managed platform can support the essential set cleanly.
        </p>
        <p>
          If it can, professional design on that platform may be the strongest
          answer. If the site would depend on workarounds, duplicated effort, or
          an awkward buying flow, custom development deserves a closer
          look. Our guide to{" "}
          <Link href="/resources/web-designer-vs-website-builder-for-small-business">
            web designers and website builders
          </Link>{" "}
          helps separate the platform decision from the question of who should
          do the work.
        </p>
        <ArticleCallout title="Veriq builds around the business">
          <p>
            Veriq provides custom website design and development when a business
            needs a site shaped around its message, customer decision process,
            performance, search visibility, and functionality. See the full{" "}
            <Link href="/small-business-web-design">
              small-business web design service
            </Link>{" "}
            for the requirements that guide the work.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
