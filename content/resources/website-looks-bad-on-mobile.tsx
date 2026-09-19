import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
  ComparisonTable,
} from "@/components/resources/ArticleElements";
import styles from "./mobile-illustrations.module.css";

export default function WebsiteLooksBadOnMobileArticle() {
  return (
    <>
      <ArticleSection id="responsive" title="Start with what breaks on the phone">
        <p>
          A website that looks bad on mobile may have a layout problem, but it
          may also have content, interaction, or loading problems. Finding out
          which one is blocking a customer is more useful than assuming the
          whole site needs replacing.
        </p>
        <ul>
          <li>
            <strong>Responsive layout:</strong> columns stay too wide, sections
            overlap, or the page needs sideways scrolling.
          </li>
          <li>
            <strong>Content and media:</strong> a heading clips, text becomes
            hard to read, or an image crops out what matters.
          </li>
          <li>
            <strong>Interaction:</strong> the menu needs hover, controls are
            difficult to tap, or a form stops working comfortably.
          </li>
          <li>
            <strong>Loading:</strong> images arrive late, content jumps, or a
            control appears before it responds.
          </li>
        </ul>
        <p>
          A desktop page reduced to phone width often keeps the wrong
          relationships. Responsive design changes composition as space
          changes: columns can stack, headings can wrap, and media can fit
          their container. Google&apos;s{" "}
          <a href="https://web.dev/articles/responsive-web-design-basics">
            responsive design guidance
          </a>{" "}
          explains flexible sizing and choosing layout changes around the
          content, rather than a short list of device models.
        </p>
      </ArticleSection>

      <ArticleSection id="diagnostics" title="Match the symptom to a useful check">
        <p>
          These are possible causes, not diagnoses. Record the page address,
          phone and browser, and the steps that expose the issue. A screenshot
          or short screen recording gives whoever maintains the site something
          they can reproduce.
        </p>
        <ComparisonTable
          caption="Mobile website symptoms, possible causes, and next checks"
          columns={["Symptom", "Possible cause", "What to check / next action"]}
          rows={[
            [
              "The whole page scrolls sideways",
              "A fixed-width section, image, embed, table, or unbroken text is wider than the screen.",
              "Find where content extends past the edge. Ask for that element to fit, wrap, or scroll inside its own labeled region.",
            ],
            [
              "Headlines or content are clipped",
              "A fixed height, oversized type, or hidden overflow leaves too little space for wrapping.",
              "Check longer headings and larger text settings. The container should grow with the content instead of cutting it off.",
            ],
            [
              "An image loses its important subject",
              "A wide image is cropped into a narrow frame without a suitable focal point.",
              "Compare the original image with the mobile crop. Adjust the crop, frame, or source image so its meaning survives.",
            ],
            [
              "Navigation needs hover or precise taps",
              "A desktop dropdown has no touch behavior, or controls are too close together.",
              "Open every menu level with taps. Check that destinations are reachable and the menu closes predictably.",
            ],
            [
              "Sticky elements cover content or actions",
              "Headers, chat widgets, notices, or bottom bars compete for limited screen space.",
              "Check the top and bottom of the page while scrolling. Note the overlap so the sticky behavior or spacing can be adjusted.",
            ],
            [
              "A form is difficult with the keyboard open",
              "Fixed-height panels, sticky controls, or unsuitable input settings obstruct the form.",
              "Focus each field on a real phone. Confirm you can see the label, read errors, scroll onward, and reach the next action.",
            ],
            [
              "Content shifts during loading",
              "Images or embeds have no reserved space, a font changes the text size, or new content is inserted above it.",
              "Reload and watch what appears just before the jump. Ask the maintainer to reserve space and investigate that resource.",
            ],
          ]}
        />
      </ArticleSection>

      <ArticleSection id="content" title="Keep the content and next step in view">
        <p>
          Oversized headings, tiny body copy, long unbroken strings, and narrow
          line spacing make reading harder. Images can fit the screen and still
          lose their subject. Check the meaning of the content as well as its
          dimensions: can someone see the product, read the service description,
          and find what to do next?
        </p>
        <figure className={styles.illustration}>
          <div className={styles.examples} aria-hidden="true">
            <div className={styles.example}>
              <span className={styles.label}>Rigid columns</span>
              <div className={styles.phone}>
                <div className={styles.rigidColumns}>
                  <div className={styles.contentBlock}>Service details</div>
                  <div className={styles.actionBlock}>Next step</div>
                </div>
              </div>
              <span className={styles.explanation}>The action extends beyond the screen.</span>
            </div>
            <div className={styles.example}>
              <span className={styles.label}>Stacked for a phone</span>
              <div className={styles.phone}>
                <div className={styles.stackedContent}>
                  <div className={styles.contentBlock}>Service details</div>
                  <div className={styles.actionBlock}>Next step</div>
                </div>
              </div>
              <span className={styles.explanation}>The details lead into a reachable action.</span>
            </div>
          </div>
          <figcaption>
            <strong>Illustration, not a client before-and-after:</strong> a
            rigid two-column layout pushes the next step outside a phone-sized
            frame. Stacking the same content keeps the action in the reading path.
          </figcaption>
        </figure>
        <p>
          Wide data may still need horizontal scrolling. A comparison table can
          have its own labeled, keyboard-accessible scroll area, like the table
          above, while the rest of the page stays within the screen. Hiding
          overflow across the entire page can conceal the symptom without
          making the missing content usable.
        </p>
      </ArticleSection>

      <ArticleSection id="navigation" title="Use the menu, not just the homepage">
        <p>
          Open the actual menu and use it to reach an important service. Check
          dropdowns, back navigation, and the close control. Labels should remain
          readable, important destinations reachable, and controls sufficiently
          separated for comfortable taps. A menu that looks right while closed
          has only passed the first check.
        </p>
        <p>
          Sticky headers, notices, and chat widgets also need room. Look for
          content or actions hidden behind them, particularly after opening a
          menu or rotating the phone. With an external keyboard, check visible
          focus and a logical tab order, including where focus goes when a menu
          closes.
        </p>
      </ArticleSection>

      <ArticleSection id="forms" title="Check forms with the keyboard open">
        <p>
          A form screenshot cannot show whether someone can finish it. Focus
          each field on a real phone. Check that its label remains visible, the
          keyboard suits the input, and you can scroll to the next field and
          submit button. Useful autocomplete can reduce unnecessary typing.
        </p>
        <p>
          Errors should explain what needs correcting near the relevant field.
          Test required fields, invalid input, and the success message in a test
          environment when available. A controlled live submission is appropriate
          only when you can identify and remove the test and coordinate any
          notifications or follow-up. Do not place real orders or generate payments
          to check a layout; use the provider&apos;s test mode for those flows.
        </p>
      </ArticleSection>

      <ArticleSection id="performance" title="Separate slow loading from broken layout">
        <p>
          If the page becomes usable once everything has loaded, investigate
          loading behavior alongside the layout. Large media and third-party
          widgets can delay content or interaction. A page that jumps may need
          space reserved for images, embeds, or fonts. Google&apos;s guide to{" "}
          <a href="https://web.dev/articles/optimize-cls">
            reducing unexpected layout shifts
          </a>{" "}
          explains these common causes.
        </p>
        <p>
          Reload an important page and observe when the problem appears. Compare
          Wi-Fi with mobile data when available, and note the conditions rather
          than assuming every visitor sees the same delay. The guide to{" "}
          <Link href="/resources/why-is-my-website-slow">
            why a website is slow
          </Link>{" "}
          covers the performance investigation in more detail.
        </p>
      </ArticleSection>

      <ArticleSection id="manual-test" title="Run a short customer-path check">
        <ol>
          <li>
            <strong>Choose the important pages.</strong> Include the homepage,
            a main service or product page, and the contact or booking page.
            Add a page with a long heading, gallery, or table if those appear
            elsewhere on the site.
          </li>
          <li>
            <strong>Read on a real phone.</strong> Try portrait and landscape,
            then a different phone size if one is available. Check larger text
            settings and watch for clipping, awkward crops, and sideways scrolling.
          </li>
          <li>
            <strong>Follow the customer path.</strong> Use the menu to find a
            service, read its details, and reach the inquiry or booking step.
            Stop before confirming an appointment, order, or payment.
          </li>
          <li>
            <strong>Check the form safely.</strong> Open the keyboard, move
            through fields, and check whether labels and actions stay reachable.
            Use a test environment for submission checks, or a clearly marked
            live test only under the controlled conditions above.
          </li>
          <li>
            <strong>Record and prioritize.</strong> Save the URL, device,
            browser, and steps for each issue. Put blocked customer actions
            ahead of minor visual inconsistencies, then repeat the same path
            after a fix.
          </li>
        </ol>
        <p>
          This is a useful first pass, not a complete usability or accessibility
          assessment. A clean screenshot or automated score cannot confirm that
          the whole customer path works.
        </p>
      </ArticleSection>

      <ArticleSection id="decision" title="Choose a repair that matches the problem">
        <ul>
          <li>
            <strong>Repair an isolated component</strong> when the issue is
            contained: one image crop, overflowing table, menu control, or form
            field. Verify the repair on other pages using that component.
          </li>
          <li>
            <strong>Improve recurring responsive patterns</strong> when the
            same heading, spacing, media, or sticky-element problem appears
            across templates. A shared fix can be more coherent than adjusting
            each page separately.
          </li>
          <li>
            <strong>Consider a broader redesign</strong> when navigation,
            page hierarchy, content, and customer actions fail throughout the
            site, or routine changes keep introducing new problems. Establish
            what can be preserved before replacing the foundation.
          </li>
        </ul>
        <ArticleCallout title="Bring the problems, then define the scope">
          <p>
            Compare a{" "}
            <Link href="/resources/website-redesign-vs-rebuild">
              focused redesign with a rebuild
            </Link>{" "}
            before choosing a larger project. If problems repeat across your
            site, Veriq&apos;s{" "}
            <Link href="/website-redesign">website redesign service</Link>{" "}
            starts with evaluating what to keep, improve, or rebuild. Bring the
            affected pages and the customer tasks you could not complete.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
