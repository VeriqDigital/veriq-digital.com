import Link from "next/link";
import Image from "next/image";
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
    title: "Substance Over Hype",
    description:
      "Good design can be memorable without getting in the way of the job it needs to do.",
  },
  {
    number: "03",
    title: "Built To Evolve",
    description:
      "The right foundation should be practical to manage today and capable of supporting what comes next.",
  },
  {
    number: "04",
    title: "Beyond The Brief",
    description:
      "Great work rarely stops at the requirements. We look for thoughtful ways to improve the final result and create lasting value beyond the original brief.",
  },
] as const;

const reasons = [
  {
    title: "Direct collaboration",
    description:
      "Work directly with the person designing and building your project from the first conversation through launch.",
  },
  {
    title: "Dedicated attention",
    description:
      "We intentionally take on a limited number of projects so every client receives thoughtful communication, focused execution, and the attention their business deserves.",
  },
  {
    title: "Built around the business",
    description:
      "No recycled strategies or predetermined platforms. Every recommendation starts with how your business actually operates.",
  },
  {
    title: "Support beyond launch",
    description:
      "Launch isn&apos;t the finish line. We continue improving your digital presence as your business grows.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "About Our Des Moines Digital Studio",
  description:
    "Meet Veriq Digital founder Mick Enev and learn how this Des Moines studio approaches web design, custom development, and long-term growth support.",
  path: "/about",
});

export default function AboutPage() {
  return (
    <main id="main-content" className={styles.page}>
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
                  digital experiences that help businesses look sharper, work
                  smarter, and move forward with confidence.
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
                  approach, removing what does not help, and making every design
                  and technology decision earn its place.
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

      <section className={styles.founder} id="founder">
        <Container>
          <div className={styles.founderInner}>
            <div className={styles.founderVisual} aria-hidden="true">
              <span className={styles.founderOrbit} />
              <span className={styles.founderMonogram}>
                <Image
                  src="/mick.png"
                  alt="Mick Enev"
                  fill
                  sizes="(max-width: 480px) 100vw, (max-width: 720px) 92vw, (max-width: 980px) 44vw, 540px"
                  quality={100}
                  preload
                  className={styles.founderPhoto}
                />
              </span>
              <p className={styles.founderCaption}>Founder-led digital studio</p>
            </div>

            <div className={styles.founderCopy}>
              <div className={styles.sectionMarker}>
                <span>03</span>
                Meet the founder
              </div>
              <h2>Hi, I&apos;m Mick.</h2>
              <p>
                I started Veriq because I believe businesses deserve websites
                that not only look professional, but help them perform better.
                Every project is designed around the way a business actually
                operates, with the goal of building something thoughtful,
                distinctive, and built to support long-term growth.
              </p>
              <p>
                My software engineering background lets Veriq handle both
                straightforward business websites and technically complex
                projects. The technology can change; the goal is always to make
                a business easier to discover, easier to trust, and easier to
                do business with.
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
