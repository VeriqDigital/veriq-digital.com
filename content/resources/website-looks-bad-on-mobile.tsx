import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function WebsiteLooksBadOnMobileArticle() {
  return (
    <>
      <ArticleSection id="responsive" title="A mobile website needs responsive decisions, not shrinking">
        <p>
          A desktop page reduced to phone width often keeps the wrong
          relationships. Columns become cramped, headings dominate the screen,
          controls overlap, and content appears in an order that no longer
          makes sense. Responsive design should change composition and priority
          as space changes, not merely scale every element down.
        </p>
        <p>
          Fixed widths and rigid positioning are common causes. So are layouts
          designed around one device screenshot instead of flexible content.
          Pages need useful minimums and maximums, wrapping behavior, and
          breakpoints based on when the content stops working.
        </p>
      </ArticleSection>

      <ArticleSection id="navigation" title="Navigation and touch controls create immediate friction">
        <ul>
          <li>Menu labels wrap, clip, or sit outside the viewport.</li>
          <li>Dropdowns require hover or hide important destinations.</li>
          <li>Links and buttons are too small or too close together.</li>
          <li>Sticky banners cover the navigation or primary action.</li>
          <li>The menu opens but does not manage focus or close predictably.</li>
        </ul>
        <p>
          A customer should be able to understand the menu, reach important
          services, and complete the next action with one hand and without
          precise tapping. Visible focus and logical keyboard order also matter
          on mobile devices with external or assistive input.
        </p>
      </ArticleSection>

      <ArticleSection id="content" title="Type, media, and tables need narrow-screen behavior">
        <p>
          Oversized headings, tiny body copy, long unbroken strings, and narrow
          line spacing can make the page feel unfinished. Images may crop out
          the subject or force horizontal scrolling. Videos and embeds can
          exceed the viewport, while comparison tables may simply disappear
          beyond the right edge.
        </p>
        <p>
          Use readable type with controlled line length, flexible media, and
          intentional crops. Wide data can live in a clearly labeled scrollable
          region rather than expanding the entire document. Important meaning
          should not depend on a desktop-only side-by-side arrangement.
        </p>
      </ArticleSection>

      <ArticleSection id="forms" title="Forms expose mobile problems quickly">
        <p>
          Long forms, small fields, incorrect keyboard types, unclear errors,
          and buttons hidden by the on-screen keyboard can stop an otherwise
          interested visitor. Each field needs a persistent label, enough touch
          space, useful autocomplete where appropriate, and an error message
          that explains how to recover.
        </p>
        <p>
          Test the production form on actual phones. Confirm that the page does
          not zoom unexpectedly, the keyboard matches the expected input, the
          submit button remains reachable, and success produces a clear next
          step. A static design preview cannot verify those states.
        </p>
      </ArticleSection>

      <ArticleSection id="performance" title="Mobile performance can make a visual problem worse">
        <p>
          Large media, third-party widgets, late-loading fonts, and excessive
          JavaScript have more visible consequences on slower devices and
          networks. Layout shifts can move a button under someone&apos;s finger,
          and delayed interaction can make a working control appear broken.
        </p>
        <p>
          The guide to{" "}
          <Link href="/resources/why-is-my-website-slow">
            why a website is slow
          </Link>{" "}
          covers those causes in more detail. Performance and layout should be
          tested together because each changes how the other feels.
        </p>
      </ArticleSection>

      <ArticleSection id="decision" title="Fix the component or redesign the responsive system">
        <p>
          A single overflowing table or broken image can usually be repaired
          directly. A redesign becomes more reasonable when navigation,
          typography, page hierarchy, forms, media, and conversion actions fail
          across many templates. Repeated mobile problems often indicate that
          the site lacks a coherent responsive system.
        </p>
        <ArticleCallout title="Test the customer path before choosing the scope">
          <p>
            Review the broader{" "}
            <Link href="/resources/website-mistakes-that-cost-local-businesses-customers">
              website mistakes that lose customers
            </Link>
            , then compare a{" "}
            <Link href="/resources/website-redesign-vs-rebuild">
              focused redesign with a rebuild
            </Link>
            . Veriq can evaluate recurring mobile issues through its{" "}
            <Link href="/website-redesign">website redesign service</Link>.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
