import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function SignsWebsiteIsOutdatedArticle() {
  return (
    <>
      <ArticleSection id="business" title="The website no longer represents the business">
        <p>
          A website is outdated when it communicates an earlier version of the
          company. Services have changed, the best customers are different,
          locations or team details are wrong, or the visual identity no longer
          matches how the business presents itself elsewhere. Visitors then
          make decisions from incomplete or misleading information.
        </p>
        <p>
          Look beyond surface style. The larger warning is a gap between what
          the business now does and what the website helps a customer
          understand. Updated colors alone will not correct old positioning,
          buried services, or a customer path built around the wrong offer.
        </p>
      </ArticleSection>

      <ArticleSection id="customers" title="Customers struggle to use it under real conditions">
        <ul>
          <li>Navigation is confusing or important pages are difficult to find.</li>
          <li>The layout breaks, clips, or becomes cramped on a phone.</li>
          <li>Pages load slowly or shift while someone tries to read or tap.</li>
          <li>Forms fail, ask for too much, or provide no useful confirmation.</li>
          <li>Text has poor contrast or controls cannot be used with a keyboard.</li>
          <li>Calls to action no longer match how customers contact or buy.</li>
        </ul>
        <p>
          These are not merely signs of an old visual trend. They are evidence
          that the site is making a current customer work around decisions made
          for another device, another offer, or another stage of the business.
        </p>
      </ArticleSection>

      <ArticleSection id="operations" title="Routine updates have become risky or expensive">
        <p>
          An outdated website often reveals itself behind the scenes. Staff
          cannot change content without breaking a layout, simple updates need
          a developer, plugins create recurring conflicts, account ownership is
          unclear, or no one knows which forms and integrations still work.
        </p>
        <p>
          Difficult editing does not always justify a rebuild. The content
          model, permissions, and reusable layouts may be repairable. But when
          every update adds another workaround, the maintenance cost is
          evidence that the underlying system no longer fits the business.
        </p>
      </ArticleSection>

      <ArticleSection id="measurement" title="The site cannot support useful measurement or growth">
        <p>
          The website may have no reliable analytics, track only page views, or
          send leads into a form inbox no one reviews consistently. It may also
          lack pages for important services, flexible content types, or the
          integrations needed for the next stage of operations.
        </p>
        <p>
          Growth that has outpaced the site is a stronger redesign signal than
          age. The question is whether the current structure can support new
          information and customer tasks without becoming harder to understand
          or maintain.
        </p>
      </ArticleSection>

      <ArticleSection id="age" title="Age alone does not mean the website needs a redesign">
        <p>
          A site can be several years old and still be clear, accurate, fast,
          accessible, dependable, and aligned with the business. It can also be
          recently launched and already fail those tests. There is no useful
          expiration date that applies to every website.
        </p>
        <ArticleCallout title="Audit outcomes, not fashion">
          <p>
            Check accuracy, customer tasks, mobile use, performance,
            accessibility, editing, search visibility, and measurement. Then
            classify each failure as a focused fix, a shared design problem, or
            a structural constraint.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="next-step" title="Decide what actually needs to change">
        <p>
          Start with the most expensive failure. If one form is broken, repair
          it. If mobile problems repeat across every template, or the content
          structure no longer fits the offer, a coordinated redesign may be
          more efficient than another round of patches.
        </p>
        <p>
          The guide to{" "}
          <Link href="/resources/website-redesign-vs-rebuild">
            website redesign versus rebuild
          </Link>{" "}
          explains those paths. For specific customer-experience symptoms,
          review the{" "}
          <Link href="/resources/website-mistakes-that-cost-local-businesses-customers">
            website mistakes that cost businesses customers
          </Link>
          .
        </p>
      </ArticleSection>
    </>
  );
}
