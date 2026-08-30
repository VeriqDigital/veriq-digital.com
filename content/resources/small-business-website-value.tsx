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
          Most small businesses still benefit from a website, but the site may
          have a narrow job. It gives prospective customers one dependable place
          to understand the offer, verify important details, and contact or buy
          from the business without piecing the story together across several
          profiles.
        </p>
        <p>
          For some businesses, that job can be handled by a concise site with a
          home page, service information, proof, and contact options. Others
          need location pages, resources, online scheduling, ecommerce,
          quoting, or customer tools. I would rather build one dependable page
          than sell a business a large site it does not need. The scope should
          follow what customers need before they feel comfortable calling,
          visiting, booking, or buying.
        </p>
      </ArticleSection>

      <ArticleSection id="social-vs-owned" title="Other platforms can introduce the business; the website carries the full explanation">
        <p>
          A Google Business Profile, Facebook page, Instagram account, or
          industry marketplace can be valuable, and any of them may be the
          first place someone encounters the business. They do different jobs:
        </p>
        <ul>
          <li>
            A Google Business Profile puts practical local information and
            reviews near map and search activity.
          </li>
          <li>
            Social profiles show current activity and give people a familiar
            way to follow or message the business.
          </li>
          <li>
            Marketplaces can place an offer in front of people already
            comparing providers or products.
          </li>
          <li>
            The website explains the full offer, connects related information,
            and supports the business&apos;s preferred next action.
          </li>
        </ul>
        <p>
          The website is the part under the business&apos;s own domain. The business
          decides how services are organized, what proof appears beside each
          claim, which forms or tools are available, and how traffic from Google,
          social posts, email, ads, referrals, and marketplaces reaches the same
          source of detailed information.
        </p>
        <ArticleCallout title="Think in roles, not replacements">
          <p>
            Do not close a productive social account or marketplace just to push
            everyone toward the website. Keep each channel doing the job it does
            well, and use the site when a customer needs more context, stronger
            proof, or a direct action the profile cannot support cleanly.
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
          thin pages when it answers the questions that delay a call or visit.
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
          Additional functionality may also carry real customer value.
          Scheduling, quoting, intake, account areas, payments, document
          exchange, or integrations can reduce friction while giving customers
          a better experience. Those features should be added because they make
          an important action easier, not because the site needs to feel
          “advanced.”
        </p>
      </ArticleSection>

      <ArticleSection id="decision" title="Make the decision from customer behavior">
        <p>
          Search for the business by name and by the services customers use.
          Review what they see, then try to complete the most important action
          from a phone. If the path depends on scattered profiles, outdated
          information, direct messages, or a platform account, a website can
          give those channels a common destination.
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
