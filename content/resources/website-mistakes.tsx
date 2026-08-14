import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";
import WebsiteAuditDiscoveryLink from "@/components/resources/WebsiteAuditDiscoveryLink";

export default function WebsiteMistakesArticle() {
  return (
    <>
      <ArticleSection id="message" title="The visitor cannot tell what you do">
        <p>
          A local customer often arrives with a specific problem and a short
          attention span. If the first screen leads with a vague slogan, a long
          company history, or a stock image without a clear explanation, the
          visitor has to work to determine whether the business can help.
        </p>
        <p>
          State the service in the customer’s language, identify the relevant
          market or audience, and give the page a clear next step. Avoid making
          every service sound equally important. The page should guide someone
          from their immediate question to the most useful detail.
        </p>
        <ArticleCallout title="Fix the message before redesigning the decoration">
          <p>
            A new color palette cannot rescue an unclear offer. Start by
            rewriting the headline, service explanation, and call to action.
            Then design the page around that clearer decision path.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="friction" title="Contact information is buried or the path is broken">
        <p>
          Some sites make a customer open the menu, visit a contact page, fill
          out a long form, and wait without confirmation. Others display a phone
          number as an image or plain text that cannot be tapped. Every extra
          step gives an urgent customer a reason to choose the next result.
        </p>
        <ul>
          <li>Place a relevant call to action where the customer reaches a decision.</li>
          <li>Make phone numbers and email addresses functional links.</li>
          <li>Ask only for information needed to respond or qualify the inquiry.</li>
          <li>Explain what happens after submission and when a reply is likely.</li>
          <li>Test forms in production, including error and confirmation states.</li>
        </ul>
        <p>
          The strongest action can vary by page. A service page may lead to a
          quote request, while a detailed guide may need only a quiet link to
          the relevant service.
        </p>
      </ArticleSection>

      <ArticleSection id="mobile-speed" title="The mobile experience is slow, cramped, or unstable">
        <p>
          A desktop design squeezed onto a phone often produces tiny type,
          overlapping controls, oversized media, and horizontal scrolling.
          Popups and sticky elements may cover the content or the button a
          customer is trying to use.
        </p>
        <p>
          Slow loading compounds the problem. Uncompressed photos, autoplaying
          video, unnecessary tracking scripts, and bulky plugins can delay the
          moment when the page becomes useful. Optimize the largest assets,
          load only what the page needs, and test on a real phone over a normal
          connection rather than relying on a fast office network.
        </p>
        <p>
          Visual stability matters too. Buttons and text should not jump when a
          late-loading image or banner appears. Reserve space for media and keep
          the primary content in the server-rendered page.
        </p>
      </ArticleSection>

      <ArticleSection id="trust-access" title="Outdated details and inaccessible patterns undermine trust">
        <p>
          Customers notice expired offers, old staff information, broken social
          links, incorrect hours, and copyright dates that suggest a site has
          been abandoned. Review the details people use to decide whether the
          business is active and dependable.
        </p>
        <p>
          Accessibility problems create a more direct loss. Low-contrast text,
          missing form labels, keyboard traps, unexplained error messages, and
          buttons identified only by icons can prevent someone from completing
          the task. Clear structure and usable controls help everyone, including
          customers in a hurry or using a device in difficult conditions.
        </p>
        <p>
          Trust should come from accurate, specific evidence. Use real work,
          clear policies, identifiable people, and verifiable reviews when
          available. Do not fill empty space with unsupported claims.
        </p>
      </ArticleSection>

      <ArticleSection id="audit" title="A quick customer-loss audit">
        <p>
          Open the site in a private browser window on your phone. Pretend you
          know nothing about the business and try to answer these questions:
        </p>
        <ol>
          <li>What does the company do, and do I appear to be the right customer?</li>
          <li>Can I find the relevant service and understand the next step?</li>
          <li>Can I call, email, book, or submit the form without friction?</li>
          <li>Does the page load cleanly and remain usable at a larger text size?</li>
          <li>Are the hours, service area, people, and policies current?</li>
          <li>Did I receive a useful confirmation after taking action?</li>
        </ol>
        <p>
          Fix failures in the customer path before adding new pages or visual
          effects. If the underlying structure is sound, targeted improvements
          may be enough. If the problems repeat across the site, a redesign may
          be more efficient than patching each symptom.
        </p>
        <p>
          Veriq&apos;s{" "}
          <WebsiteAuditDiscoveryLink>
            free website audit preview
          </WebsiteAuditDiscoveryLink>{" "}
          shows how search, speed, mobile use, accessibility, technical health,
          and conversion findings can be organized into one action order.
        </p>
        <ArticleCallout title="When the site needs more than a patch">
          <p>
            Veriq&apos;s{" "}
            <Link href="/website-redesign">
              website redesign service
            </Link>{" "}
            addresses clear messaging, mobile use, performance, accessibility,
            and dependable lead paths together when the problems repeat across
            an existing site. The first step is still determining what actually
            needs to change.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
