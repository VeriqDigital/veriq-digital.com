import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function LocalWebsiteEssentialsArticle() {
  return (
    <>
      <ArticleSection id="first-screen" title="The first screen should answer three questions">
        <p>
          A visitor should not have to decode the business. Near the top of the
          page, make it clear what you do, who or where you serve, and what the
          visitor can do next. A short, specific statement is more useful than a
          broad slogan that could belong to any company.
        </p>
        <p>
          The primary action should match the way customers actually buy. That
          might be calling, requesting a quote, booking an appointment, visiting
          a location, or reviewing services. A secondary action can help people
          who need more information, but five equal buttons create a decision
          problem rather than solving one.
        </p>
        <ArticleCallout title="A quick clarity test">
          <p>
            Show the first screen to someone outside the business for five
            seconds. Ask what the company does, who it serves, and what they
            would click next. Confusion here is usually a messaging problem,
            not a color problem.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="core-pages" title="Core pages and practical information">
        <p>
          The right page list follows the customer’s questions. Most local
          businesses benefit from a focused set of pages, but they do not all
          need the same menu.
        </p>
        <ul>
          <li>
            <strong>Home:</strong> the clearest overview of the offer, audience,
            proof, and next step.
          </li>
          <li>
            <strong>Services:</strong> enough detail for a customer to recognize
            the right solution and understand what happens next.
          </li>
          <li>
            <strong>About:</strong> the people, approach, and relevant context
            that make the business easier to trust.
          </li>
          <li>
            <strong>Contact:</strong> accurate phone, email, form, hours, and
            expectations for a response.
          </li>
          <li>
            <strong>Location or service area:</strong> where customers can visit
            or where the business legitimately provides service.
          </li>
          <li>
            <strong>Work, results, or FAQs:</strong> only when the content is
            real, relevant, and useful to the decision.
          </li>
        </ul>
        <p>
          Keep essential facts consistent with the Google Business Profile and
          other major listings. If hours, phone numbers, or service areas change,
          update the website as part of the same process.
        </p>
      </ArticleSection>

      <ArticleSection id="trust" title="Trust comes from specific, verifiable detail">
        <p>
          Trust signals should help a customer reduce uncertainty. Depending on
          the business, that may include real team information, clear process,
          relevant licenses, original project photos, detailed examples, honest
          policies, or customer reviews from a source visitors can verify.
        </p>
        <p>
          Avoid copying badges, client logos, testimonials, or claims onto the
          site without permission and context. Generic claims such as “best in
          town” carry little weight when the page does not explain how the work
          is done or what a customer should expect.
        </p>
        <p>
          Good service pages build trust through substance: what is included,
          who the service fits, how the process works, common constraints, and
          what happens after someone gets in touch.
        </p>
      </ArticleSection>

      <ArticleSection id="quality" title="Mobile usability, speed, and accessibility are essentials">
        <p>
          A local customer may be comparing providers from a parking lot, a job
          site, or a slow mobile connection. The phone experience deserves the
          same attention as the desktop layout. Text should be readable without
          zooming, controls should be easy to tap, and important actions should
          not depend on hover.
        </p>
        <ul>
          <li>Compress and size images for the space where they appear.</li>
          <li>Keep navigation predictable and forms short enough for the task.</li>
          <li>Use descriptive headings and links so pages are easy to scan.</li>
          <li>Provide labels for form fields and visible keyboard focus.</li>
          <li>Maintain readable contrast and do not rely on color alone.</li>
          <li>Test calls, email links, booking flows, and form confirmation.</li>
        </ul>
        <p>
          These choices support conversion, accessibility, and technical SEO at
          the same time. They are part of the product, not a final checklist
          after the visual design is finished.
        </p>
      </ArticleSection>

      <ArticleSection id="measurement" title="Plan for local search, measurement, and upkeep">
        <p>
          Each important page should have a unique title, a clear main heading,
          crawlable text, and a logical place in the site’s navigation or
          internal links. Describe services and locations naturally. A genuine
          service area is useful; a collection of nearly identical city pages
          is not.
        </p>
        <p>
          Connect Google Search Console to monitor indexing and search queries.
          Use analytics to measure valuable actions such as submitted forms,
          calls, bookings, or quote starts. Then assign responsibility for
          software updates, backups, content changes, and periodic testing.
        </p>
        <ArticleCallout title="Turn the checklist into a scope">
          <p>
            Once you know what the site must include, read{" "}
            <Link href="/resources/how-much-does-a-website-cost-in-des-moines">
              what shapes website cost in Des Moines
            </Link>{" "}
            or see how Veriq plans and builds{" "}
            <Link href="/small-business-web-design">professional small-business websites</Link>.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
