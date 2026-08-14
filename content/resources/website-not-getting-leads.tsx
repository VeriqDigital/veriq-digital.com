import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";
import WebsiteAuditDiscoveryLink from "@/components/resources/WebsiteAuditDiscoveryLink";

export default function WebsiteNotGettingLeadsArticle() {
  return (
    <>
      <ArticleSection id="diagnose" title="First find where the lead path is breaking">
        <p>
          “The website is not generating leads” can describe several different
          problems. The site may receive almost no qualified traffic. The right
          people may arrive but leave without understanding the offer. They may
          want to act but encounter a weak form, missing trust information, or a
          next step that does not fit how they buy.
        </p>
        <p>
          Separate the path into four questions: Are enough relevant people
          arriving? Do they recognize that the service fits? Do they have enough
          confidence to continue? Can they complete the next step? A redesign
          aimed at the wrong stage will change the appearance without changing
          the underlying problem.
        </p>
        <ArticleCallout title="Traffic and conversion are different problems">
          <p>
            A page cannot convert visitors who never arrive, and more traffic
            will not rescue an unclear or broken experience. Establish which
            side of the equation is weak before choosing the work.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="traffic" title="Check traffic volume, quality, and intent">
        <p>
          Use Search Console and analytics to identify how people reach the site
          and which pages they enter. Low traffic may point to limited search
          visibility, weak promotion, a new domain, or an audience that relies
          on other channels. Traffic can also be high but poorly matched to the
          services the business actually sells.
        </p>
        <ul>
          <li>Compare branded searches with service-related searches.</li>
          <li>Review landing pages, geographic relevance, and referral sources.</li>
          <li>Look for queries whose intent does not match the page or offer.</li>
          <li>Check whether important pages are indexed and linked internally.</li>
          <li>Measure qualified actions rather than treating every session equally.</li>
        </ul>
        <p>
          If the site is missing from search entirely, start with the separate
          diagnostic for a{" "}
          <Link href="/resources/why-isnt-my-business-website-showing-up-on-google">
            business website that is not showing up on Google
          </Link>
          .
        </p>
      </ArticleSection>

      <ArticleSection id="message" title="Make the offer and audience unmistakable">
        <p>
          Qualified visitors still leave when the page leads with a broad slogan
          or assumes they already understand the service. The first screen should
          state what the business does, who it helps, and the most useful next
          action. Service pages should explain outcomes, scope, fit, process, and
          common constraints in the language customers use.
        </p>
        <p>
          Search intent matters here. A person reading an educational guide may
          not be ready for a quote, while someone on a specific service page may
          be. Match the call to action to the decision stage instead of using the
          same aggressive request on every page.
        </p>
      </ArticleSection>

      <ArticleSection id="trust-friction" title="Remove doubt and contact friction">
        <p>
          A visitor can understand the offer and still hesitate. Depending on
          the business, confidence may come from accurate team information,
          original work, a clear process, relevant qualifications, policies,
          service-area details, or reviews that can be verified. Use the proof
          the business genuinely has rather than filling the page with broad
          claims.
        </p>
        <p>
          Then test the action itself on a phone. Forms should ask only for what
          is necessary, explain errors clearly, confirm successful submission,
          and set a reasonable expectation for what happens next. Phone, email,
          scheduling, and quote links should work without hidden steps. Slow
          loading, confusing navigation, and intrusive overlays add friction
          before the form is even reached.
        </p>
      </ArticleSection>

      <ArticleSection id="measurement" title="Measure the path before replacing the website">
        <p>
          Track meaningful events such as completed forms, calls, bookings,
          quote starts, or purchases. Review performance by landing page and
          traffic source, then compare the numbers with lead quality in the
          business’s CRM or intake process. Analytics cannot explain every
          decision, but it can stop guesswork from being treated as evidence.
        </p>
        <ol>
          <li>Confirm forms, calls, and other primary actions work in production.</li>
          <li>Establish a baseline for qualified visits and completed actions.</li>
          <li>Fix the clearest message, trust, mobile, speed, or form failure.</li>
          <li>Measure the change over a meaningful period.</li>
          <li>Redesign when the problems are structural, repeated, or expensive to patch.</li>
        </ol>
        <p>
          A redesign can improve the conditions for lead generation, but it
          does not guarantee traffic or inquiries. It should be tied to a
          defined problem and followed by measurement.
        </p>
        <ArticleCallout title="When the whole customer path needs attention">
          <p>
            Start with Veriq&apos;s{" "}
            <WebsiteAuditDiscoveryLink>
              free website audit preview
            </WebsiteAuditDiscoveryLink>{" "}
            to see
            how a prioritized report can separate technical, usability, and
            conversion issues. Then review the broader list of{" "}
            <Link href="/resources/website-mistakes-that-cost-local-businesses-customers">
              website mistakes that cost businesses customers
            </Link>{" "}
            or see how Veriq approaches{" "}
            <Link href="/website-redesign">
              existing websites that need a clearer lead path
            </Link>
            .
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
