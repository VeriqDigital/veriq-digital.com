import Link from "next/link";
import Container from "@/components/ui/Container";
import styles from "./HomepageSections.module.css";

const processSteps = [
  ["Discover", "Understand the business, customer, goals, and constraints."],
  ["Strategy", "Define the message, structure, functionality, and path to action."],
  ["Design", "Shape the responsive experience around real content."],
  ["Build", "Implement, integrate, and test the approved direction."],
  ["Launch", "Deploy carefully and confirm the technical foundations."],
  ["Improve", "Use support, SEO, and iteration where they add value."],
] as const;

export default function HomeWebsiteApproach() {
  return (
    <>
      <section className={styles.approach} aria-labelledby="approach-title">
        <Container>
          <div className={styles.approachIntro}>
            <h2 id="approach-title">
              Start with the website problem.
            </h2>
            <p>
              Some businesses need a completely new custom website. Others need
              to replace what is holding an existing site back. Veriq starts
              with the business, customer journey, and next useful outcome.
            </p>
          </div>

          <div className={styles.approachComparison}>
            <article>
              <div className={styles.approachTitle}>
                <span>New website</span>
                <h3>Build something new</h3>
              </div>
              <p>
                Plan, design, and develop a custom website around what customers
                need to understand, trust, and do next.
              </p>
              <ul>
                <li>Custom responsive design</li>
                <li>Modern Next.js development</li>
                <li>Search-ready page structure</li>
                <li>Clear conversion paths</li>
              </ul>
            </article>

            <article>
              <div className={styles.approachTitle}>
                <span>Existing presence</span>
                <h3>Improve what you have</h3>
              </div>
              <p>
                Rebuild an ineffective website or strengthen its visibility,
                conversion path, and customer-facing functionality.
              </p>
              <ul>
                <li>Website redesigns</li>
                <li>SEO and local visibility</li>
                <li>Google Business Profile assistance</li>
                <li>Quote, booking, and lead tools</li>
              </ul>
            </article>
          </div>

          <Link
            className={styles.approachLink}
            href="/services"
          >
            Explore website services
            <span aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>

      <section className={styles.process} aria-labelledby="process-title">
        <Container>
          <div className={styles.processHeader}>
            <div>
              <p className={styles.kicker}>How it works</p>
              <h2 id="process-title">
                A clear path with communication every step of the way.
              </h2>
            </div>
            <p>
              You do not need a finished brief or a technical approach picked out. We
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
