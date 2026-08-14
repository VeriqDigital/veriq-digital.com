import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";
import WebsiteAuditDiscoveryLink from "@/components/resources/WebsiteAuditDiscoveryLink";

export default function WebsiteNotOnGoogleArticle() {
  return (
    <>
      <ArticleSection
        id="indexed"
        title="First, check whether Google knows the page exists"
      >
        <p>
          A website can be absent from Google for two different reasons: the
          page is not indexed at all, or it is indexed but does not rank where
          you expect. Those problems require different responses.
        </p>
        <p>
          Search Google for the exact business name and a distinctive phrase
          from the page. You can also try a <code>site:yourdomain.com</code>
          search for a rough view of known pages. The better source is Google{" "}
          <a
            href="https://developers.google.com/search/docs/monitor-debug/search-console-start"
            target="_blank"
            rel="noopener noreferrer"
          >
            Search Console
          </a>
          , where URL Inspection can report whether a specific URL is indexed
          and whether Google encountered a crawl or indexing issue.
        </p>
        <ArticleCallout title="Indexing is not ranking">
          <p>
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap"
              target="_blank"
              rel="noopener noreferrer"
            >
              Submitting a sitemap
            </a>{" "}
            or{" "}
            <a
              href="https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl"
              target="_blank"
              rel="noopener noreferrer"
            >
              requesting indexing
            </a>{" "}
            can help Google discover a page. It does not guarantee that the page
            will appear for a competitive search. Relevance, quality, local
            signals, authority, and time still matter.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection
        id="crawlability"
        title="Make sure search engines can reach and understand the site"
      >
        <p>
          Technical settings can unintentionally keep a site out of search. A
          developer or SEO review should check for{" "}
          <a
            href="https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag"
            target="_blank"
            rel="noopener noreferrer"
          >
            noindex directives
          </a>
          , blocked paths in robots.txt, incorrect canonical URLs, redirect
          loops, broken internal links, server errors, and pages that only
          reveal important content after a browser-side interaction.
        </p>
        <p>
          The site should have a logical page structure, descriptive links, a
          current XML sitemap, unique titles and descriptions, and one clear
          main heading per page. Important text should exist in the rendered
          HTML rather than inside an image or inaccessible widget.
        </p>
        <p>
          A brand-new domain or recently rebuilt site may simply need time to be
          crawled and reevaluated. Preserve or redirect valuable old URLs during
          a redesign so search engines and visitors do not hit dead ends.
        </p>
      </ArticleSection>

      <ArticleSection
        id="relevance"
        title="Show clear service and local relevance"
      >
        <p>
          Google cannot rank a page well for a service it barely explains. Give
          important services their own useful sections or pages when the intent
          differs, and answer the questions a prospective customer would ask.
          Use the language customers use naturally without repeating a keyword
          in every heading.
        </p>
        <p>
          For local visibility, keep the business name, contact details, hours,
          and legitimate service area accurate. Complete and maintain the Google
          Business Profile, choose appropriate categories, and link it to the
          relevant website. Local pages should contain real information about
          the service and market, not a city name swapped into duplicated copy.
        </p>
        <p>
          Helpful internal links also provide context. A guide about a customer
          problem can link to the relevant service, and a service page can point
          to a detailed explanation when it helps the reader decide.
        </p>
      </ArticleSection>

      <ArticleSection
        id="authority"
        title="Competition and authority affect visibility"
      >
        <p>
          Search results are comparative. A technically sound page may still sit
          below businesses with more established brands, stronger local
          prominence, better content, or more credible websites linking to them.
          Competitive queries take sustained work, not a hidden metadata field.
        </p>
        <p>
          Earn authority through real business activity: useful resources,
          accurate industry and local listings, partnerships, community
          involvement, public work, and coverage that deserves a link. Avoid
          buying large batches of unrelated links or publishing thin pages only
          to target keyword variations. Those tactics create risk without
          improving the customer experience.
        </p>
        <p>
          Reviews can strengthen local trust and may support discovery, but they
          should be requested and managed according to each platform’s rules.
          Never add fabricated reviews or rating markup to the website.
        </p>
      </ArticleSection>

      <ArticleSection id="next-steps" title="A sensible order of operations">
        <ol>
          <li>
            Verify the preferred domain and important URLs in Search Console.
          </li>
          <li>
            Confirm that the pages are crawlable, indexable, canonical, and
            included in the sitemap.
          </li>
          <li>
            Fix server errors, broken links, redirect problems, and missing page
            fundamentals.
          </li>
          <li>
            Improve the pages that best match real customer searches and
            business priorities.
          </li>
          <li>
            Align the Google Business Profile and other major listings with
            current information.
          </li>
          <li>
            Measure impressions, clicks, inquiries, calls, and bookings over
            time.
          </li>
        </ol>
        <p>
          If a page is indexed but not visible, resist changing everything at
          once. Establish a baseline, improve the weakest relevant signal, and
          give search engines time to recrawl the work. No legitimate provider
          can promise a specific ranking.
        </p>
        <ArticleCallout title="Strengthen the foundation first">
          <p>
            Use Veriq&apos;s{" "}
            <WebsiteAuditDiscoveryLink>
              free website audit preview
            </WebsiteAuditDiscoveryLink>{" "}
            to see
            how indexing, technical health, and other site findings can be
            prioritized together. Then review{" "}
            <Link href="/resources/what-should-a-local-business-website-include">
              the essentials of a local business website
            </Link>{" "}
            and the{" "}
            <Link href="/resources/website-mistakes-that-cost-local-businesses-customers">
              customer-experience mistakes worth fixing
            </Link>
            . If the site needs a deeper rebuild, Veriq includes technical SEO,
            performance, and indexation foundations in its{" "}
            <Link href="/des-moines-web-design">
              Des Moines web design work
            </Link>
            .
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
