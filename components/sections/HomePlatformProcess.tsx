import Link from "next/link";
import Container from "@/components/ui/Container";
import styles from "./HomepageSections.module.css";

const processSteps = [
  ["Discover", "Understand the business, customer, goals, and constraints."],
  ["Strategy", "Define the message, structure, platform, and path to action."],
  ["Design", "Shape the responsive experience around real content."],
  ["Build", "Implement, integrate, and test the approved direction."],
  ["Launch", "Deploy carefully and confirm the technical foundations."],
  ["Improve", "Use support, SEO, and iteration where they add value."],
] as const;

export default function HomePlatformProcess() {
  return (
    <>
      <section className={styles.platform} aria-labelledby="platform-title">
        <Container>
          <div className={styles.platformIntro}>
            <p className={styles.kicker}>The right tool for the problem</p>
            <h2 id="platform-title">One platform should not decide every project.</h2>
            <p>
              Veriq works in Squarespace and custom development. The choice
              follows the content, functionality, editing needs, timeline, and
              long-term plan.
            </p>
          </div>

          <div className={styles.platformComparison}>
            <article>
              <div className={styles.platformTitle}>
                <span>Managed platform</span>
                <h3>Squarespace</h3>
              </div>
              <p>
                A strong fit for many marketing-focused business websites that
                need a polished launch and a straightforward editing model.
              </p>
              <ul>
                <li>Easy content editing</li>
                <li>Faster implementation</li>
                <li>Standard forms and integrations</li>
                <li>Lower technical complexity</li>
              </ul>
            </article>

            <article>
              <div className={styles.platformTitle}>
                <span>Purpose-built</span>
                <h3>Custom development</h3>
              </div>
              <p>
                The better route when the website needs specialized behavior,
                a unique interface, deeper integrations, or room for more complex growth.
              </p>
              <ul>
                <li>Specialized functionality</li>
                <li>Maximum interface flexibility</li>
                <li>Custom integrations</li>
                <li>Application-like experiences</li>
              </ul>
            </article>
          </div>

          <Link className={styles.platformLink} href="/resources/custom-website-vs-template-for-small-business">
            Compare custom websites and managed platforms
            <span aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <Container>
          <div className={styles.processHeader}>
            <div>
              <p className={styles.kicker}>How it works</p>
              <h2 id="process-title">A clear path from first conversation to improvement.</h2>
            </div>
            <p>
              You do not need a finished brief or a platform picked out. We
              define the right scope together, make decisions visible, and keep
              the next step clear.
            </p>
          </div>

          <ol className={styles.processList}>
            {processSteps.map(([title, description], index) => (
              <li key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}
