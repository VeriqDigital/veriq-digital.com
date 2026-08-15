import Link from "next/link";
import Container from "@/components/ui/Container";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import styles from "./HomepageSections.module.css";

const trustPoints = [
  "Custom or Squarespace",
  "SEO-conscious builds",
  "Conversion-focused",
  "Mobile-first",
  "Built around your business",
] as const;

const websiteJobs = [
  ["Explain", "Make the offer easy to understand."],
  ["Reassure", "Give customers a reason to trust the business."],
  ["Get found", "Create a sound structure for search visibility."],
  ["Convert", "Give visitors a clear, useful next step."],
  ["Perform", "Load quickly and work properly across devices."],
  ["Adapt", "Support new content, campaigns, and functionality."],
] as const;

export default function HomeTrustSection({ auditEnabled }: { auditEnabled: boolean }) {
  return (
    <>
      <section className={styles.trustStrip} aria-label="How Veriq builds">
        <Container>
          <ul>
            {trustPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </Container>
      </section>

      <section className={styles.positioning} aria-labelledby="positioning-title">
        <Container>
          <div className={styles.positioningIntro}>
            <div>
              <p className={styles.kicker}>A website with a job to do</p>
              <h2 id="positioning-title">
                Looking professional is only the starting point.
              </h2>
            </div>
            <div className={styles.positioningSummary}>
              <p>
                Your website should help the right people find you, understand
                what makes the business credible, and take the next step without
                friction. Veriq connects the message, design, technology, and
                search foundations so the site supports the business as one system.
              </p>
              <div className={styles.inlineLinks}>
                {auditEnabled ? (
                  <WebsiteAuditLink placement="homepage_quality">
                    Check your current website <span aria-hidden="true">↗</span>
                  </WebsiteAuditLink>
                ) : null}
                <Link href="/website-redesign">
                  Explore website redesigns <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>

          <dl className={styles.websiteJobs}>
            {websiteJobs.map(([term, description]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{description}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>
    </>
  );
}
