import Link from "next/link";
import {
  ArticleCallout,
  ArticleSection,
} from "@/components/resources/ArticleElements";

export default function SmallBusinessWebsiteTimelineArticle() {
  return (
    <>
      <ArticleSection id="range" title="A realistic range depends on readiness and scope">
        <p>
          A focused small-business website may take a few weeks. A larger site
          with new positioning, original content, custom functionality, or
          several decision-makers can take considerably longer. A universal
          promise is not useful because the same number of pages can hide very
          different amounts of work.
        </p>
        <p>
          Veriq currently describes most business website projects as taking
          two to six weeks. That range assumes an agreed scope and active client
          participation. A provider should confirm the timeline after learning
          what must be designed, written, built, integrated, reviewed, and
          launched.
        </p>
        <ArticleCallout title="Fast is only useful when the site is ready">
          <p>
            Compressing a schedule by skipping content decisions, mobile
            testing, redirects, analytics, or quality review moves the work past
            launch; it does not remove it.
          </p>
        </ArticleCallout>
      </ArticleSection>

      <ArticleSection id="phases" title="What happens during the project">
        <ol>
          <li>
            <strong>Discovery and scope:</strong> clarify the business goals,
            audiences, current-site problems, required pages, functionality,
            responsibilities, and launch constraints.
          </li>
          <li>
            <strong>Structure and content:</strong> plan navigation, page
            hierarchy, conversion paths, messages, copy, and available visual
            material.
          </li>
          <li>
            <strong>Design:</strong> establish the visual direction and turn the
            content into responsive page layouts, states, and reusable patterns.
          </li>
          <li>
            <strong>Development:</strong> build the pages and components,
            connect forms and integrations, and prepare content for real use.
          </li>
          <li>
            <strong>Quality review and launch:</strong> test devices, browsers,
            accessibility, performance, metadata, analytics, forms, redirects,
            and deployment settings.
          </li>
        </ol>
        <p>
          These phases can overlap. Content work may continue while core
          components are developed, and testing should happen throughout rather
          than in one rushed day at the end.
        </p>
      </ArticleSection>

      <ArticleSection id="delays" title="What commonly delays a website">
        <p>
          The most common delays are not difficult animations or unusual code.
          They are unresolved content, slow feedback, changing scope, and
          dependencies outside the project team.
        </p>
        <ul>
          <li>Copy, photography, team details, service information, or approvals arrive late.</li>
          <li>Feedback comes from several people in separate, conflicting rounds.</li>
          <li>New pages or features are added without adjusting the schedule.</li>
          <li>Access to the domain, hosting, analytics, or third-party systems is missing.</li>
          <li>An integration behaves differently from its documentation or requires vendor support.</li>
          <li>Legal, compliance, or brand review begins only after the site is nearly complete.</li>
        </ul>
        <p>
          A good project plan makes these dependencies visible. It should also
          explain how a delayed client decision affects later milestones rather
          than pretending the launch date is independent of the work.
        </p>
      </ArticleSection>

      <ArticleSection id="prepare" title="How the business can keep the project moving">
        <p>
          Name one person who can gather internal feedback and make day-to-day
          decisions. Before kickoff, collect brand files, current analytics,
          account access, service details, accurate contact information,
          approved reviews, and any photography or documents the site will use.
        </p>
        <p>
          Decide which content the provider will create and which content the
          business owns. Set realistic review windows on the calendar. When
          feedback is due, focus it on the agreed audience, goal, and scope
          rather than collecting unranked personal preferences.
        </p>
        <p>
          Finally, separate launch requirements from later opportunities. A
          clearly defined second phase can protect the initial schedule without
          losing useful ideas.
        </p>
      </ArticleSection>

      <ArticleSection id="questions" title="Timeline questions to ask a provider">
        <ul>
          <li>What assumptions does the proposed schedule depend on?</li>
          <li>When must our content, access, and feedback be ready?</li>
          <li>How many review rounds are included, and who consolidates feedback?</li>
          <li>Which integrations or approvals create the greatest schedule risk?</li>
          <li>What testing happens before launch?</li>
          <li>How are scope changes estimated and scheduled?</li>
          <li>What support is available immediately after launch?</li>
        </ul>
        <ArticleCallout title="Plan scope and timeline together">
          <p>
            Read{" "}
            <Link href="/resources/how-much-does-a-website-cost-in-des-moines">
              what drives website cost
            </Link>{" "}
            and{" "}
            <Link href="/resources/how-to-choose-a-web-designer-in-des-moines">
              how to evaluate a web designer
            </Link>{" "}
            before comparing schedules. The fastest proposal is not necessarily
            the one that includes the work your launch requires.
          </p>
        </ArticleCallout>
      </ArticleSection>
    </>
  );
}
