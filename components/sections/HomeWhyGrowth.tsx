import Link from "next/link";
import Container from "@/components/ui/Container";
import styles from "./HomepageSections.module.css";

const principles = [
  {
    title: "Business-first",
    description:
      "The message, platform, and functionality follow a concrete business objective.",
  },
  {
    title: "No platform dogma",
    description:
      "Squarespace when it fits. Custom development when the requirements justify it.",
  },
  {
    title: "Technical quality",
    description:
      "Responsive behavior, performance, accessibility, maintainability, and SEO fundamentals are part of the work.",
  },
  {
    title: "Built to grow",
    description:
      "The first version creates a foundation for better content, search, tools, campaigns, and continued improvement.",
  },
] as const;

const growthPath = ["Website", "Search", "Content", "Campaigns", "Leads", "Optimization"] as const;

export default function HomeWhyGrowth() {
  return (
    <>
      <section className={styles.why} aria-labelledby="why-title">
        <Container>
          <div className={styles.whyHeader}>
            <p className={styles.kicker}>Why Veriq</p>
            <h2 id="why-title">Good decisions before more deliverables.</h2>
            <p>
              Veriq is a focused, founder-led studio. You work directly with the
              person planning, designing, and building the project, with the
              tradeoffs explained in plain language.
            </p>
          </div>
          <div className={styles.principles}>
            {principles.map((principle) => (
              <article key={principle.title}>
                <h3>{principle.title}</h3>
                <p>{principle.description}</p>
              </article>
            ))}
          </div>
          <Link className={styles.aboutLink} href="/about">
            Learn how Veriq works <span aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>

      <section className={styles.growth} aria-labelledby="growth-title">
        <Container>
          <div className={styles.growthLayout}>
            <div>
              <p className={styles.kicker}>A foundation for what comes next</p>
              <h2 id="growth-title">Your website should be ready for the traffic you send to it.</h2>
            </div>
            <p>
              Search, content, social media, and future advertising all send
              people somewhere. A clear, credible, measurable website gives
              those efforts a stronger destination without pretending every
              business needs every channel today.
            </p>
          </div>
          <ol className={styles.growthPath} aria-label="A website-led growth path">
            {growthPath.map((step, index) => (
              <li key={step}>
                <span>{step}</span>
                {index < growthPath.length - 1 ? <i aria-hidden="true">→</i> : null}
              </li>
            ))}
          </ol>
        </Container>
      </section>
    </>
  );
}

export function HomeFinalCta() {
  return (
    <section className={styles.finalCta} aria-labelledby="final-cta-title">
      <Container>
        <div className={styles.finalCtaInner}>
          <p>Make the next version count</p>
          <h2 id="final-cta-title">Build a website that earns its place in your business.</h2>
          <p>
            Tell Veriq what is not working, what needs to change, or what you
            are ready to build. A rough idea is enough to start.
          </p>
          <div className={styles.finalActions}>
            <Link href="/contact" className={styles.primaryAction}>
              Start a project <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/work" className={styles.secondaryAction}>
              View selected work <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
