import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";

export default function WebsiteRedesignSeoChecklistArticle() {
  return (
    <>
      <ArticleSection id="before-build" title="Before design: record what must survive">
        <p>
          Before changing an existing website, identify the pages people find,
          the information they need, and the paths that turn a visit into an
          inquiry. Then decide what to keep, move, improve, or retire. A redesign
          SEO checklist gives the owner and provider a shared record of those
          decisions and a way to verify them at launch.
        </p>
        <p>
          Careful work reduces avoidable mistakes; it does not guarantee unchanged
          rankings. Google explains that significant changes can cause <a href="https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes">search fluctuations while pages are recrawled and reindexed</a>.
          Preserve useful value and intent, rather than every old sentence or URL.
        </p>
        <p>
          Create one shared inventory before approving the new page structure.
          Give each item an owner, a decision, and a place to record the check result:
        </p>
        <ul>
          <li><strong>Pages worth reviewing:</strong> current URLs, organic landing pages, pages with backlinks or referral visits, and important service or location pages. Include valuable images and downloads that may move.</li>
          <li><strong>Content and search context:</strong> titles, main headings, useful answers, local details, and each page’s purpose. Save representative copies so omissions are visible later.</li>
          <li><strong>Technical behavior:</strong> the current sitemap, canonical URLs, redirects, robots.txt rules, intentional noindex decisions, and structured data that is still accurate.</li>
          <li><strong>Access and measurement:</strong> confirm business access to analytics and Search Console, record how ownership is verified, and save a baseline for important pages and queries.</li>
          <li><strong>Customer paths:</strong> forms, booking links, integrations, destinations for inquiries, and the events used to measure successful actions.</li>
        </ul>
        <ArticleCallout title="Low traffic alone is not a removal decision">
          <p>
            A specialist service page may matter to a small number of valuable
            visitors. Conversely, an old offer may no longer belong on the site.
            Check business relevance, referral value, and customer use alongside
            search data before choosing what stays.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="url-map" title="Map every changed URL to a decision">
        <p>
          Keep a useful URL when the page still serves the same purpose. For
          changes, record the final destination and expected response before
          development. The paths below are illustrative examples, not a client migration.
        </p>
        <ComparisonTable
          caption="Illustrative URL decisions for a business website redesign"
          columns={["Current URL", "Redesign decision", "Required action"]}
          rows={[
            ["/services", "Keep the same URL", "Keep the useful overview available at /services; verify it returns 200 and remains linked."],
            ["/services/repairs", "Update content at the same URL", "Retain the service intent while improving detail and layout. No redirect is needed for an unchanged URL."],
            ["/old-booking", "Move to /book", "Prepare a permanent server redirect to /book and update internal links to the destination."],
            ["/maintenance and /seasonal-care", "Merge into /services/maintenance", "Carry over useful answers; redirect both old pages only if the combined page genuinely replaces them."],
            ["/expired-offer", "Remove with no relevant replacement", "Remove internal links and sitemap references; return a real 404 or 410, with helpful navigation for visitors."],
          ]}
        />
        <p>
          For permanent moves, <a href="https://developers.google.com/search/docs/crawling-indexing/301-redirects">Google recommends permanent server-side redirects such as 301 or 308</a>.
          Send visitors directly to the closest relevant replacement. Test for
          loops, unnecessary chains, and destinations that themselves return an error.
          A homepage redirect is not a substitute for a missing service page.
        </p>
        <p>
          Keep the redirect map after launch. For URL moves, Google recommends
          <a href="https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes#start"> keeping redirects for at least a year</a>; retain useful ones longer when
          old links still bring visitors. Include existing redirects in the plan
          so a platform switch does not silently discard them.
        </p>
      </ArticleSection>

      <ArticleSection id="content" title="Preserve the answers, not the old layout">
        <p>
          A cleaner design can accidentally remove the detail that made a page
          useful. Compare old and proposed pages side by side: can a reader still
          tell what the service covers, who it fits, where it is available, and
          how to take the next step?
        </p>
        <ul>
          <li>Keep accurate service details and genuinely useful local information.</li>
          <li>Retain supporting answers and FAQs that resolve real customer questions.</li>
          <li>Make page-specific context and descriptive headings visible in the new structure.</li>
          <li>Carry forward internal links that help readers reach related services or explanations.</li>
        </ul>
        <p>
          You can rewrite, combine, or remove material when there is a reason.
          Record which new page answers the old page’s useful questions. That
          makes content review more specific than asking whether the new site
          “has enough SEO copy.”
        </p>
      </ArticleSection>

      <ArticleSection id="launch-prep" title="Before launch: check the production setup">
        <p>
          Ask the provider to record evidence against the agreed page list,
          including representative page types and important customer paths.
          Assign someone to resolve failures before approving launch.
        </p>
        <ul>
          <li><strong>Redirects:</strong> prepare the approved map and verify it in a test environment.</li>
          <li><strong>Canonicals:</strong> check that preferred page URLs use the production hostname and agree with links and sitemap entries. Avoid accidentally pointing every page at the homepage.</li>
          <li><strong>Indexability:</strong> public search pages should be accessible, return successful responses, and have no unintended noindex in HTML or HTTP headers.</li>
          <li><strong>robots.txt:</strong> review rules for the live hostname, including access to resources needed to render pages. Keep deliberate private-area restrictions separate from temporary staging rules.</li>
          <li><strong>XML sitemap:</strong> list the intended canonical, indexable production URLs, and remove retired or redirected entries from the current sitemap. Google’s <a href="https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap">sitemap guidance</a> explains URL selection and submission; submission does not guarantee indexing.</li>
          <li><strong>Navigation and links:</strong> check menus, breadcrumbs, footer links, and contextual links against the new page map.</li>
          <li><strong>Page details:</strong> review titles, descriptions, headings, and structured data. Retain markup only when it describes the current visible content accurately.</li>
          <li><strong>Customer experience:</strong> review mobile rendering, readable content, keyboard access, forms, and integrations. Use the <Link href="/resources/website-looks-bad-on-mobile">mobile diagnostic guide</Link> and <Link href="/resources/why-is-my-website-slow">speed guide</Link> for specific problems.</li>
          <li><strong>Measurement:</strong> preserve analytics and Search Console access, verification methods, and agreed conversion events; check consent behavior and avoid duplicate tracking.</li>
          <li><strong>Hosting behavior:</strong> verify HTTPS, the preferred hostname, and a helpful missing-page screen that returns a real 404 response.</li>
        </ul>
        <p>
          A canonical indicates a preferred version of duplicate or similar
          content; it does not redirect visitors. Keep these signals consistent
          using <a href="https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls">Google’s canonical URL guidance</a>.
          Google can select a different canonical, so check the result after launch too.
        </p>
        <ArticleCallout title="Staging protections need a production check">
          <p>
            Use access controls for private staging. A robots.txt block controls
            crawling, not confidentiality or guaranteed removal from search;
            Google’s <a href="https://developers.google.com/search/docs/crawling-indexing/robots/intro">robots.txt guide</a> explains that distinction.
          </p>
          <p>
            Where noindex is used, Google must be able to crawl the page to see
            the <a href="https://developers.google.com/search/docs/crawling-indexing/block-indexing">noindex tag or response header</a>.
            Before launch, identify which temporary restrictions must be removed
            from public production pages. Keep staging protected, and inspect
            the actual live response afterward; an editor setting alone is not proof.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="change-type" title="Match the checks to the type of change">
        <ul>
          <li><strong>Same-domain redesign:</strong> if URLs and infrastructure stay in place, focus on content, rendering, links, settings, and customer paths. A new layout alone is not a site move.</li>
          <li><strong>URL restructuring:</strong> changed paths need explicit mapping, redirects where appropriate, and updated links and sitemap entries.</li>
          <li><strong>Platform or hosting migration:</strong> URLs can remain unchanged while templates, settings, certificates, forms, or redirect rules change. Verify those behaviors rather than assuming they transfer.</li>
          <li><strong>Domain change:</strong> plan property verification, old-to-new domain redirects, and continued control of the old domain as a separate workstream.</li>
        </ul>
        <p>
          For hosting changes that keep URLs, follow <a href="https://developers.google.com/search/docs/crawling-indexing/site-move-no-url-changes">Google’s hosting-move guidance</a>:
          test the new infrastructure before switching traffic and monitor the
          transition before retiring the old hosting.
        </p>
        <p>
          For a domain move, verify ownership of both properties and complete
          redirects before using Search Console’s <a href="https://support.google.com/webmasters/answer/9370220">Change of Address tool</a> when applicable.
          It is not for same-domain path changes, HTTPS-only moves, or switching
          between www and non-www. Follow the linked requirements for your
          specific domain and subdomain setup rather than treating it as a redesign button.
        </p>
      </ArticleSection>

      <ArticleSection id="launch-day" title="On launch day: verify the live site">
        <p>
          Run this check against the production hostname after the release.
          Record the URL, observed result, person responsible, and any follow-up.
          Keep the previous site backup and an agreed recovery plan available.
        </p>
        <ol>
          <li>Open representative old URLs, including important landing pages and older redirected paths. Confirm they remain available or reach the intended replacement without loops.</li>
          <li>Inspect important new pages for useful content, successful responses, the intended canonical, and absence of accidental noindex or crawl blocks.</li>
          <li>Fetch the live sitemap and verify its hostname and URLs. Check navigation and contextual links, and investigate unexpected 404s.</li>
          <li>Walk the primary customer path on a phone and desktop, including menu, service page, contact options, and form validation.</li>
          <li>Verify analytics loading and agreed events using controlled test/debug facilities, with the expected consent choices.</li>
          <li>Record launch time and unresolved issues so later changes can be compared with what actually shipped.</li>
        </ol>
        <p>
          Test submissions in a sandbox or approved test route where possible.
          Only make a controlled live lead submission if the owner can identify
          and remove it and any notifications are expected. Do not place real
          orders, generate payments, or send repeated test inquiries to prove a path works.
        </p>
      </ArticleSection>

      <ArticleSection id="monitoring" title="After launch: investigate patterns, not every wobble">
        <p>
          Name who will review the following days and weeks, how they will
          report issues, and who will fix them. Launch verification and continued
          monitoring are different responsibilities; confirm both in the scope.
        </p>
        <ul>
          <li><strong>Search Console:</strong> review Page indexing issues and submitted sitemap status. Use URL Inspection on important pages to check indexing and Google’s selected canonical.</li>
          <li><strong>Site behavior:</strong> investigate unexpected 404s, server errors, redirect failures, and missing content using logs and repeat checks of the URL map. Planned removals are different from broken replacements.</li>
          <li><strong>Search performance:</strong> compare organic landing pages and page/query patterns with the saved baseline. Keep date ranges, devices, countries, and filters comparable.</li>
          <li><strong>Business measurement:</strong> confirm conversion events still represent completed customer actions. A tracking change can look like a business decline even when inquiries still arrive.</li>
        </ul>
        <p>
          Google’s <a href="https://developers.google.com/search/docs/monitor-debug/search-console-start">Search Console monitoring guide</a> explains the indexing, sitemap, and performance reports.
          Fix a confirmed block or broken redirect promptly. For performance
          movement, consider reporting delays, seasonality, changed content,
          and the time needed to process new URLs before changing the site again.
          Daily ranking movement by itself does not identify a redesign defect.
        </p>
      </ArticleSection>

      <ArticleSection id="avoid" title="What not to do">
        <ul>
          <li>Do not change every URL merely to make it shorter.</li>
          <li>Do not delete a strong page before checking its role and replacement.</li>
          <li>Do not send unrelated retired pages to the homepage.</li>
          <li>Do not launch with public production pages accidentally noindexed.</li>
          <li>Do not remove analytics or Search Console access before confirming the replacement setup.</li>
          <li>Do not treat a successful visual redesign as proof that launch verification is complete.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="where-veriq-fits" title="Where Veriq fits">
        <p>
          Veriq’s <Link href="/website-redesign">website redesign work</Link>{" "}
          starts with the current site and the parts worth keeping. When included
          in the agreed scope, that work can cover useful URLs and content,
          redirects, technical SEO foundations, and checks of launch behavior.
          Confirm the page inventory, testing responsibilities, and any
          post-launch monitoring in the proposal. Rankings cannot be guaranteed.
        </p>
        <p>
          Still deciding how much to change? The <Link href="/resources/website-redesign-vs-rebuild">redesign-versus-rebuild guide</Link>{" "}
          addresses the scope decision. The <Link href="/resources/how-much-does-a-website-redesign-cost">redesign cost guide</Link>{" "}
          explains budgeting for that work. Use this checklist to make the
          preservation and launch requirements explicit once a direction is chosen.
        </p>
      </ArticleSection>
    </>
  );
}
