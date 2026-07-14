import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "./about.module.css";

const beliefs = [
  {
    number: "01",
    title: "Clarity over noise",
    description:
      "Every page, interaction, and decision should help someone understand what matters next.",
  },
  {
    number: "02",
    title: "Useful beats flashy",
    description:
      "Good design can be memorable without getting in the way of the job it needs to do.",
  },
  {
    number: "03",
    title: "Built for change",
    description:
      "Businesses evolve. Their websites and tools should be able to evolve with them.",
  },
  {
    number: "04",
    title: "Care is a feature",
    description:
      "The details people do not consciously notice are often the ones that make an experience feel right.",
  },
] as const;

const reasons = [
  {
    title: "Direct collaboration",
    description:
      "We work closely with our clients to ensure all requirements are met.",
  },
  {
    title: "Dedicated attention",
    description:
      "Being a smaller studio allows us to focus on client needs and provide quick response times.",
  },
  {
    title: "Built around the business",
    description:
      "The solution follows your goals and workflow instead of forcing them into a rigid template.",
  },
  {
    title: "Support beyond launch",
    description:
      "There is a clear path for maintenance, iteration, and growth after the first version goes live.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "About",
  description:
    "Meet the founder and explore the philosophy behind Veriq, a Des Moines digital studio serving local and remote clients.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                About {siteConfig.name}
              </p>
              <h1>
                Small studio. <span>Serious digital work.</span>
              </h1>
              <div className={styles.heroSummary}>
                <p>
                  Veriq is an independent digital studio creating websites and
                  software that help businesses look sharper, work smarter, and
                  move forward with confidence.
                </p>
                <div className={styles.heroActions}>
                  <Link href="#philosophy" className={styles.primaryLink}>
                    Our philosophy
                    <span aria-hidden="true">↓</span>
                  </Link>
                  <Link href="/work" className={styles.textLink}>
                    See the work
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </div>

            <div className={styles.heroAside}>
              <span>Independent</span>
              <span>Thoughtful</span>
              <span>Built to last</span>
            </div>

            <div className={styles.heroGraphic} aria-hidden="true">
              <span className={styles.graphicOuter} />
              <span className={styles.graphicInner} />
              <span className={styles.graphicNode} />
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.philosophy} id="philosophy">
        <Container>
          <div className={styles.philosophyInner}>
            <div className={styles.sectionMarker}>
              <span>01</span>
              Our philosophy
            </div>
            <div className={styles.philosophyStatement}>
              <h2>
                Digital work should make a business feel more capable,
                <span> not more complicated.</span>
              </h2>
              <div className={styles.philosophyCopy}>
                <p>
                  Technology is only valuable when it gives people more clarity,
                  more momentum, or more time for the work that matters.
                </p>
                <p>
                  That means understanding the business before choosing the
                  solution, removing what does not help, and giving every detail
                  a reason to exist.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.beliefs}>
        <Container>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionMarker}>
              <span>02</span>
              What we believe
            </div>
            <h2>Principles that shape the work.</h2>
          </div>

          <div className={styles.beliefGrid}>
            {beliefs.map((belief) => (
              <article className={styles.beliefCard} key={belief.number}>
                <span>{belief.number}</span>
                <div>
                  <h3>{belief.title}</h3>
                  <p>{belief.description}</p>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.founder}>
        <Container>
          <div className={styles.founderInner}>
            <div className={styles.founderVisual} aria-hidden="true">
              <span className={styles.founderOrbit} />
              <span className={styles.founderMonogram}>V</span>
              <p>Founder-led digital studio</p>
            </div>

            <div className={styles.founderCopy}>
              <div className={styles.sectionMarker}>
                <span>03</span>
                Meet the founder
              </div>
              <h2>Hi, I&apos;m Mick.</h2>
              <p>
                I started Veriq because I believe businesses deserve websites
                and software that are as professional as the work they do every
                day.
              </p>
              <p>
                I enjoy building thoughtful digital experiences that combine
                clean design with practical technology to help businesses grow.
              </p>
              <div className={styles.founderRole}>
                <span>Mick Enev</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.whyVeriq}>
        <Container>
          <div className={styles.whyInner}>
            <div className={styles.whyHeading}>
              <div className={styles.sectionMarker}>
                <span>04</span>
                Why {siteConfig.name}
              </div>
              <h2>Less distance between the idea and the outcome.</h2>
              <p>
                A smaller studio means fewer layers, clearer ownership, and more
                attention on the decisions that make the work effective.
              </p>
            </div>

            <ol className={styles.reasonList}>
              {reasons.map((reason, index) => (
                <li key={reason.title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <div>
                    <h3>{reason.title}</h3>
                    <p>{reason.description}</p>
                  </div>
                  <i aria-hidden="true">↘</i>
                </li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className={styles.closing}>
        <Container>
          <div className={styles.closingInner}>
            <p>Have a project in mind?</p>
            <h2>Let&apos;s build something your business can grow into.</h2>
            <Link href="/contact" className={styles.closingLink}>
              Start a conversation
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
