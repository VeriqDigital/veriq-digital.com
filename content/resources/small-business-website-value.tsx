import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function SmallBusinessWebsiteValueArticle() {
  return (
    <>
      <ArticleSection id="short-answer" title="The short answer: usually, but the site can be simple">
        <p>
          A small business does not need a complicated website simply because
          the calendar says 2026. It does need a reliable place where a
          prospective customer can understand the business, verify important
          details, and take the next step without depending entirely on a
          platform the business does not control.
        </p>
        <p>
          For some businesses, that job can be handled by a concise site with a
          home page, service information, proof, and contact options. Others
          need location pages, resources, online scheduling, ecommerce,
          quoting, or customer tools. The useful question is not whether every
          business needs a large website. It is what customers need before they
          feel comfortable calling, visiting, booking, or buying.
        </p>
      </ArticleSection>

      <ArticleSection id="social-vs-owned" title="Social profiles help discovery; a website gives you control">
        <p>
          A Google Business Profile, Facebook page, Instagram account, or
          industry marketplace can be valuable. Customers already use those
          platforms, and they may be the first place someone encounters the
          business. But each platform decides how the profile is displayed,
          what content receives reach, which features remain available, and how
          customers move through the experience.
        </p>
        <p>
          A website gives the business a stable destination under its own
          domain. You control the order of information, the calls to action, the
          brand presentation, the forms, the analytics, and the relationship
          between pages. It can support search queries that do not fit neatly
          into a social post or directory category, and it remains useful when
          a platform changes its interface or policies.
        </p>
        <ArticleCallout title="Think in roles, not replacements">
          <p>
            Your website does not need to replace social media or a Google
            Business Profile. Those channels can introduce the business; the
            website can answer the deeper questions and guide the customer
            toward a decision.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="simple-site" title="When a simple website is enough">
        <p>
          A focused site may be sufficient when the offer is easy to understand,
          the service area is limited, most leads come from referrals, and the
          customer only needs a few pieces of information before making contact.
          A simple site should still be complete, current, mobile-friendly, and
          easy to use.
        </p>
        <ul>
          <li>A clear explanation of what the business does and who it serves.</li>
          <li>Core services, service area, hours, and accurate contact details.</li>
          <li>Visible evidence that the business is legitimate and dependable.</li>
          <li>One or two obvious next steps, such as calling or requesting a quote.</li>
          <li>A technical setup that search engines can crawl and customers can use on a phone.</li>
        </ul>
        <p>
          Simple is not the same as vague. One strong page can outperform ten
          thin pages when it answers the customer’s real questions and removes
          friction.
        </p>
      </ArticleSection>

      <ArticleSection id="substantial-site" title="When a more substantial site makes sense">
        <p>
          More depth is justified when customers research carefully, services
          differ significantly, the business covers multiple markets, or the
          buying process has several steps. Detailed pages can explain complex
          work, qualify leads, address objections, and give search engines a
          clearer understanding of the business.
        </p>
        <p>
          Additional functionality may also carry real operational value.
          Scheduling, quoting, intake, account areas, payments, document
          exchange, or integrations can reduce manual work while giving
          customers a better experience. Those features should be added because
          they improve a process, not because the site needs to feel “advanced.”
        </p>
      </ArticleSection>

      <ArticleSection id="decision" title="Make the decision from customer behavior">
        <p>
          Search for the business by name and by the services customers use.
          Review what they see, then try to complete the most important action
          from a phone. If the path depends on scattered profiles, outdated
          information, direct messages, or a platform account, a website can
          provide a clearer foundation.
        </p>
        <p>
          If a useful site already exists, the answer may be maintenance rather
          than replacement. Keep the information accurate, test the forms,
          review performance, and improve the pages customers rely on most.
        </p>
        <ArticleCallout title="Start with the essentials">
          <p>
            Use our guide to{" "}
            <Link href="/resources/what-should-a-local-business-website-include">
              what a local business website should include
            </Link>{" "}
            to define a sensible first version. If the project calls for a
            custom build, Veriq’s{" "}
            <Link href="/small-business-web-design">small business web design service</Link>{" "}
            connects those requirements to a clear design and development
            process.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
