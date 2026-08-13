import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function WhyWebsiteIsSlowArticle() {
  return (
    <>
      <ArticleSection id="measure" title="Slow can mean loading late, responding late, or moving around">
        <p>
          A slow website does not always show one obvious spinner. The first
          useful content may appear late, a button may ignore the first tap
          while scripts run, or the layout may jump as images and banners load.
          Each symptom can have a different cause, so begin with the page and
          device customers actually use rather than one overall score.
        </p>
        <p>
          Test important landing and service pages on a normal phone connection.
          Note when the main message appears, when the page responds to input,
          and whether content shifts. Browser performance tools and field data
          can help confirm the pattern, but the customer task should determine
          which problem matters first.
        </p>
      </ArticleSection>

      <ArticleSection id="media" title="Images, video, and fonts often carry more weight than the page needs">
        <p>
          Large photographs uploaded directly from a camera, oversized image
          dimensions, autoplaying video, and multiple font families can delay
          the first useful view. The problem is not that a site uses rich media.
          It is that the browser downloads more bytes, variants, or styles than
          the experience can justify.
        </p>
        <ul>
          <li>Resize and compress images for their rendered dimensions.</li>
          <li>Use modern formats and responsive image sources where supported.</li>
          <li>Load below-the-fold media when it approaches the viewport.</li>
          <li>Reserve dimensions so late assets do not shift the layout.</li>
          <li>Limit font files, weights, and blocking requests.</li>
        </ul>
      </ArticleSection>

      <ArticleSection id="scripts" title="Scripts and third-party tools can delay the useful experience">
        <p>
          Analytics, advertising pixels, chat widgets, scheduling tools,
          embedded maps, personalization, and review widgets can all add network
          requests and browser work. Some support real business needs. Others
          remain because no one has reviewed them since installation.
        </p>
        <p>
          Inventory every third-party script, identify its owner and purpose,
          and test the page without it. Delay nonessential tools, replace heavy
          embeds with intentional user actions, and remove integrations that no
          longer support a measured outcome.
        </p>
      </ArticleSection>

      <ArticleSection id="platform" title="Plugins, hosting, and architecture can create deeper limits">
        <p>
          Bloated themes, overlapping plugins, inefficient database work,
          render-blocking assets, weak caching, slow hosting, and an application
          that sends too much JavaScript to the browser can make optimization
          harder. These problems are broader than one image or widget, but they
          still need evidence before they justify a rebuild.
        </p>
        <p>
          A managed platform may already provide reliable hosting and image
          handling, while a poorly assembled site on that platform can still be
          slow. Custom development can provide more control, while unnecessary
          custom code can create its own weight. Evaluate the implementation,
          not the category label.
        </p>
        <ArticleCallout title="A perfect score is not the business goal">
          <p>
            Optimize the experience customers use and the actions the business
            depends on. Performance scores are diagnostic signals, not proof
            that a page is useful, accessible, or likely to generate leads.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="decision" title="Optimize first unless the system resists useful change">
        <p>
          Start with high-impact assets, unnecessary scripts, loading order,
          caching, and the slowest critical templates. Measure the same pages
          and tasks again. Focused optimization is usually the smallest and
          safest answer when the site structure and platform remain sound.
        </p>
        <p>
          Broader architectural or platform change becomes reasonable when the
          site cannot meet business needs without fragile plugins, duplicated
          code, unmaintainable themes, or excessive client-side work. Use the{" "}
          <Link href="/resources/website-redesign-vs-rebuild">
            redesign-versus-rebuild framework
          </Link>{" "}
          to separate a performance repair from a structural project.
        </p>
        <ArticleCallout title="Performance is one part of a responsible redesign">
          <p>
            Veriq&apos;s{" "}
            <Link href="/website-redesign">website redesign work</Link>{" "}
            evaluates speed alongside messaging, mobile usability,
            accessibility, conversion paths, editing, and migration risk.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
