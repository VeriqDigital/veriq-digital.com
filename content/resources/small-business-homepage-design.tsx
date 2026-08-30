import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function SmallBusinessHomepageDesignArticle() {
  return (
    <>
      <ArticleSection
        id="job"
        title="A homepage should orient the visitor and make the next step obvious"
      >
        <p>
          A small-business homepage has to establish what the business does,
          who it serves, and what someone can do next. It should also provide
          enough proof and context for a visitor to decide where to continue.
          That is a demanding job, but it is not the same as putting the entire
          website on one page.
        </p>
        <p>
          When I plan a homepage, I treat it as an overview and a routing page.
          It introduces the offer, shows the most important options, and sends
          people toward a service, project, location, or contact action where
          they can get the detail they need.
        </p>
        <ArticleCallout title="Give people enough information to choose, then let them continue">
          <p>
            A homepage should help visitors understand the business and
            confidently choose their next step without trying to contain the
            full version of every service, story, review, and policy.
          </p>
        </ArticleCallout>
        <p>
          The homepage sits inside the larger website structure. If the page
          list and navigation are still unsettled, start with{" "}
          <Link href="/resources/what-is-information-architecture-in-web-design">
            information architecture in web design
          </Link>{" "}
          before arranging homepage sections.
        </p>
      </ArticleSection>

      <ArticleSection
        id="first-screen"
        title="The first screen should identify the business before it tries to impress"
      >
        <p>
          Above the fold is the portion visible before someone scrolls. It is a
          starting point, not a complete sales pitch. On most service-business
          homepages, the first screen needs a specific headline, useful
          supporting copy, and one primary action. A service area, location, or
          audience belongs here when it changes whether the visitor is a fit.
        </p>
        <ComparisonTable
          caption="Weak and stronger homepage opening copy"
          columns={["Element", "Weak", "More informative"]}
          rows={[
            [
              "Headline",
              "Welcome to ABC Company",
              "Commercial Cleaning for Des Moines Businesses",
            ],
            [
              "Supporting copy",
              "Quality you can trust.",
              "Recurring office and facility cleaning for businesses throughout the Des Moines metro.",
            ],
            ["Primary action", "Learn more", "Request a Quote"],
          ]}
        />
        <p>
          The stronger version names the service, audience, and market. It also
          uses an action that matches the likely buying process. The visitor no
          longer has to infer what “quality” means or click a vague button to
          discover what the company sells.
        </p>
        <p>
          A photo, review, certification, phone number, or secondary link may
          belong in the first screen, but none is mandatory. Add an element only
          when it resolves a real question at that point. A rotating carousel of
          messages usually makes the priority less clear.
        </p>
      </ArticleSection>

      <ArticleSection
        id="hierarchy-navigation"
        title="Use hierarchy and navigation to show what matters first"
      >
        <p>
          Visual hierarchy should make the headline, supporting explanation,
          and primary action easy to identify without giving every element the
          same weight. Size, contrast, spacing, position, and grouping should
          explain the order. Decoration should reinforce that order rather than
          compete with it.
        </p>
        <p>
          Headings need a logical content hierarchy as well. The{" "}
          <a
            href="https://www.w3.org/WAI/tutorials/page-structure/headings/"
            target="_blank"
            rel="noopener noreferrer"
          >
            W3C guidance on page headings
          </a>{" "}
          explains how descriptive heading levels communicate organization and
          help people navigate the content. A heading should name the section,
          not serve as a vague slogan that requires the paragraph below it to
          make sense.
        </p>
        <p>
          Keep the main navigation understandable. Use labels such as Services,
          Work, About, and Contact when they accurately describe the
          destination. A visible quote, booking, or contact action can sit apart
          from those links. On mobile, the same routes should remain easy to
          find without turning the menu into a second sitemap.
        </p>
        <p>
          The guide to{" "}
          <Link href="/resources/what-makes-a-small-business-website-look-professional">
            what makes a small-business website look professional
          </Link>{" "}
          covers the broader visual system. Homepage hierarchy is where that
          system has to make the first set of decisions especially obvious.
        </p>
      </ArticleSection>

      <ArticleSection
        id="sections"
        title="Choose homepage sections for the questions this business must answer"
      >
        <p>
          There is no required stack of homepage sections. A visitor should see
          the information that changes the decision, in an order that makes
          sense for the business. Common options include:
        </p>
        <ul>
          <li>
            <strong>Services overview:</strong> introduce the main categories
            and link to detailed pages instead of placing the full service copy
            on the homepage.
          </li>
          <li>
            <strong>Trust and proof:</strong> use real reviews, qualifications,
            policies, process details, or business facts that reduce a specific
            concern.
          </li>
          <li>
            <strong>Work, photos, or results:</strong> show relevant evidence
            when the business genuinely has it. Do not invent performance claims
            to fill the section.
          </li>
          <li>
            <strong>Company context:</strong> explain who is behind the work and
            why the approach is relevant without copying the full About page.
          </li>
          <li>
            <strong>Reviews or testimonials:</strong> include a selective set
            when they are authentic, current, and allowed to be published.
          </li>
          <li>
            <strong>FAQ:</strong> answer recurring questions that block contact
            or purchase. Skip it when the answers already belong naturally in
            the service sections.
          </li>
          <li>
            <strong>Contact and next step:</strong> repeat the appropriate action
            after the visitor has seen enough to make a decision.
          </li>
        </ul>
        <p>
          The footer still has a job. It can hold dependable contact details,
          service-area information, utility links, legal pages, and secondary
          navigation without competing with the main page. Keep those facts
          current and make phone and email details functional links.
        </p>
        <p>
          For a whole-site inventory rather than a homepage plan, use the guide
          to{" "}
          <Link href="/resources/what-should-a-local-business-website-include">
            local business website essentials
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection
        id="length"
        title="A long homepage is a problem when sections stop earning their place"
      >
        <p>
          There is no correct screen count. A one-page business website may need
          a longer homepage because the page carries most of the site. A
          multi-page website should usually let service, work, about, and policy
          pages handle their own depth.
        </p>
        <p>
          The homepage is becoming cluttered when several sections repeat the
          same claim, every department demands equal prominence, detailed
          service explanations interrupt the overview, or the visitor meets a
          new call to action every few paragraphs. More content is justified
          only when it resolves a new question or helps someone choose a route.
        </p>
        <p>
          I usually cut or move a section when I cannot explain what decision it
          supports. That does not mean every homepage should be minimal. It means
          the page needs an editorial priority rather than a collection of
          everything the business could say.
        </p>
        <ArticleCallout title="Do not use the homepage to hide a weak site structure">
          <p>
            If every service must be explained in full because the rest of the
            site is difficult to navigate, fix the structure. The homepage
            should not become a workaround for unclear pages and labels.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection
        id="mobile-review"
        title="Review the mobile homepage as its own sequence"
      >
        <p>
          A desktop homepage does not become a good phone experience by stacking
          every column. The mobile order should still establish the business,
          show the primary action, introduce services, provide proof, and lead
          toward contact without making someone scroll through misplaced media
          or repeated copy.
        </p>
        <ul>
          <li>Check how the headline wraps and whether the service area remains visible.</li>
          <li>Keep the main action easy to tap without covering content with sticky controls.</li>
          <li>Make service links, reviews, photos, and comparison content work at narrow widths.</li>
          <li>Use intentional image crops and avoid media that delays the main message.</li>
          <li>Test the menu, phone link, form, booking flow, and confirmation in production.</li>
          <li>Make sure footer contact details remain readable and actionable.</li>
        </ul>
        <p>
          I review the phone layout as a reading order, not a compressed
          screenshot. If an image, proof block, or secondary action interrupts
          the argument after stacking, it may need to move or disappear at that
          size.
        </p>
        <p>
          If the existing homepage repeatedly fails these tests, the broader
          guide to{" "}
          <Link href="/resources/website-mistakes-that-cost-local-businesses-customers">
            website mistakes that lose customers
          </Link>{" "}
          can help separate a page-level repair from a site-wide problem.
        </p>
      </ArticleSection>

      {/* TODO: Consider adding an annotated ABC Auto Repair concept screenshot showing headline, service hierarchy, trust details, and quote action on the homepage. */}
    </>
  );
}
