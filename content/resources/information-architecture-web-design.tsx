import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function InformationArchitectureWebDesignArticle() {
  return (
    <>
      <ArticleSection
        id="meaning"
        title="Information architecture is the plan for how the website fits together"
      >
        <p>
          Information architecture, usually shortened to IA, is the way a
          website&apos;s content is grouped, labeled, connected, and ordered. It
          determines which pages exist, how those pages relate, what belongs in
          the navigation, and how someone moves from a question to the right
          information.
        </p>
        <p>
          This comes before colors, typefaces, or decorative details. The raw
          material may already exist: services, a service area, team
          information, project photos, policies, and contact options. IA decides
          how it fits together.
        </p>
        <p>
          Start with what people need to find and what the business needs them
          to understand. Visual design works better once those relationships are
          settled.
        </p>
      </ArticleSection>

      <ArticleSection
        id="layers"
        title="A sitemap, navigation, and page layout solve different problems"
      >
        <p>
          These terms are often treated as interchangeable, but each describes
          a different layer of the website:
        </p>
        <ul>
          <li>
            <strong>Sitemap:</strong> the planned inventory and hierarchy of
            pages, including pages that may never appear in the main menu.
          </li>
          <li>
            <strong>Navigation:</strong> the visible set of routes that helps
            visitors reach the most common or important destinations.
          </li>
          <li>
            <strong>Page layout:</strong> the order and visual priority of
            information inside one page.
          </li>
          <li>
            <strong>Internal links:</strong> contextual connections that help a
            reader continue from one related idea or service to another.
          </li>
        </ul>
        <p>
          A page can belong in the sitemap without taking space in the primary
          navigation. A detailed warranty policy, for example, may be linked
          from the relevant service page and footer. Putting every page in the
          menu would make the common routes harder to see.
        </p>
        <ArticleCallout title="The menu is an output, not the starting point">
          <p>
            If the first planning document is a menu, it is easy to copy another
            website&apos;s structure without asking whether it fits. Start with
            customer questions, services, and required actions. Then decide
            what the navigation needs to expose.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection
        id="service-structure"
        title="Group services around decisions customers can recognize"
      >
        <p>
          Service organization is where many small-business websites become
          unclear. Internal departments, old brochures, and industry language
          may not match the way customers describe their problems. Vague menu
          labels such as “Solutions” or “More Services” hide the difference
          between offers instead of explaining it.
        </p>
        <p>
          A service usually deserves its own page when it has a distinct
          audience, scope, decision process, enough specific detail, or a
          different next action. Closely related services can often share a page
          when separating them would create several thin explanations that say
          nearly the same thing.
        </p>
        <p>
          I would not create five pages merely because the business can name
          five services. I would ask whether a customer understands the labels,
          whether each page can answer a different set of questions, and whether
          the structure will still make sense when the business adds or removes
          an offer.
        </p>
        <p>
          The guide to{" "}
          <Link href="/resources/what-should-a-local-business-website-include">
            what a local business website should include
          </Link>{" "}
          covers the underlying content. Information architecture decides how
          that content should be divided and connected.
        </p>
      </ArticleSection>

      <ArticleSection
        id="example"
        title="A simple example for a local commercial cleaning company"
      >
        <p>
          Imagine a cleaning company whose website grew one page at a time. The
          main navigation now looks like this:
        </p>
        <h3>Unplanned structure</h3>
        <ul>
          <li>Home</li>
          <li>Services</li>
          <li>More Services</li>
          <li>Other Services</li>
          <li>Gallery</li>
          <li>Info</li>
          <li>Contact</li>
        </ul>
        <p>
          The labels say almost nothing. A facilities manager cannot tell where
          office cleaning ends and specialized floor care begins, and “Info”
          could contain anything.
        </p>
        <h3>Planned structure</h3>
        <ul>
          <li>Home</li>
          <li>Services overview</li>
          <li>Office cleaning</li>
          <li>Medical facility cleaning</li>
          <li>Floor and carpet care</li>
          <li>Service area</li>
          <li>About and proof</li>
          <li>Request a quote</li>
        </ul>
        <p>
          These labels tell a buyer what each page covers. Office cleaning,
          medical facility cleaning, and floor care can each explain a different
          process, constraint, and set of proof. They still do not all need a
          spot in the top navigation. The three pages might sit under one
          Services label, with the quote action visible on each page.
        </p>
        <p>
          A smaller cleaning company may not need all of these pages. If the
          same crew, process, audience, and quote path apply to every service,
          one well-organized services page may be the more honest structure.
        </p>
      </ArticleSection>

      {/* TODO: Consider adding a Veriq sitemap diagram or project screenshot showing how service hierarchy carries from navigation into page content. */}

      <ArticleSection
        id="outcomes"
        title="Good information architecture reduces confusion before visual design begins"
      >
        <p>
          Poor IA creates problems that visual polish cannot fix. Important
          services get buried, two pages compete to explain the same offer,
          navigation labels become vague, and the homepage tries to compensate
          by holding the entire website. A visitor may leave because the route
          to the right answer is unclear, even when every individual section
          looks attractive.
        </p>
        <p>
          With better structure, relevant proof and actions can sit near the
          information that leads to a decision. Analytics becomes easier to
          interpret too. The business can see which service pages attract
          attention and where people continue instead of treating every visit
          as one undifferentiated homepage session.
        </p>
        <p>
          IA can also support search visibility, but it does not guarantee
          rankings. Distinct pages with descriptive labels and{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/links-crawlable"
            target="_blank"
            rel="noopener noreferrer"
          >
            crawlable internal links
          </a>{" "}
          give search engines clearer routes for discovering related content.
          The pages still need original, relevant information that satisfies the
          search behind them.
        </p>
        <p>
          If people reach the site but still do not inquire, use the separate
          guide to diagnose{" "}
          <Link href="/resources/why-isnt-my-website-getting-leads">
            why a website is not getting leads
          </Link>
          . Structure is one possible cause, not the only one.
        </p>
      </ArticleSection>

      <ArticleSection
        id="planning"
        title="Plan the structure with real content before drawing the interface"
      >
        <ol>
          <li>Inventory the current pages, services, proof, policies, and customer actions.</li>
          <li>List the questions customers need answered before they call, visit, book, or buy.</li>
          <li>Group related information and name each group in language customers understand.</li>
          <li>Decide which ideas need separate pages and which belong as sections within a page.</li>
          <li>Draw the page relationships, then choose what the main navigation should expose.</li>
          <li>Test the labels and routes with someone who does not know the business from the inside.</li>
        </ol>
        <p>
          Real copy may reveal a missing page or an unnecessary split. Change
          the plan when that happens. Revising a sitemap is cheaper than forcing
          finished content into an interface built around the wrong assumptions.
        </p>
        <p>
          On an existing site, first determine whether the structure can be
          repaired without replacing the platform. The{" "}
          <Link href="/resources/website-redesign-vs-rebuild">
            redesign-versus-rebuild guide
          </Link>{" "}
          explains how to separate a content-organization problem from a deeper
          technical constraint.
        </p>
        <ArticleCallout title="Move from the site structure into the page">
          <p>
            Once the page relationships are sound, the next task is deciding
            what the most important page should communicate. Continue with the
            guide to{" "}
            <Link href="/resources/how-to-design-a-small-business-homepage">
              designing a small-business homepage
            </Link>
            .
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
