import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import styles from "./services.module.css";

const serviceChapters = [
  {
    number: "01",
    id: "business-websites",
    title: "Business Websites",
    statement: "A sharper digital presence built to earn attention and trust.",
    description:
      "We shape your positioning, content, and user experience into a fast, focused website that makes it easy for the right customers to understand your value and take the next step.",
    note: "Best for businesses that have outgrown a dated, unclear, or hard-to-manage website.",
    capabilities: [
      "Strategy & information architecture",
      "Responsive web design",
      "Performance & accessibility",
      "Content systems & CMS setup",
      "Analytics & conversion tracking",
    ],
    outcome:
      "A credible website that works as hard as the rest of your business.",
  },
  {
    number: "02",
    id: "custom-software",
    title: "Custom Software",
    statement: "Tools designed around the way your business actually works.",
    description:
      "When off-the-shelf software creates more friction than it removes, we design and build focused digital tools around your team, customers, and existing workflow.",
    note: "Best for teams losing time to manual processes, disconnected tools, or rigid software.",
    capabilities: [
      "Customer & staff portals",
      "Quote and intake systems",
      "Dashboards & reporting tools",
      "Booking and workflow automation",
      "API and platform integrations",
    ],
    outcome:
      "Purpose-built software that removes friction instead of adding it.",
  },
  {
    number: "03",
    id: "ongoing-support",
    title: "Ongoing Support",
    statement: "A digital presence that keeps improving after launch.",
    description:
      "Websites and software are living business tools. We stay involved with maintenance, measurement, and thoughtful improvements so your investment remains useful as your company changes.",
    note: "Best for businesses that want a dependable technical partner rather than occasional emergency help.",
    capabilities: [
      "Hosting, monitoring & maintenance",
      "Performance and security reviews",
      "SEO and content improvements",
      "Analytics and reporting",
      "Ongoing design & development",
    ],
    outcome:
      "Steady support, clearer decisions, and fewer technical distractions.",
  },
] as const;

const processSteps = [
  {
    title: "Discover",
    description:
      "Understand your business, goals, challenges, and the people you're building for.",
  },
  {
    title: "Design",
    description:
      "Collaborate to shape a thoughtful solution through planning, feedback, and refinement.",
  },
  {
    title: "Develop",
    description:
      "Build iteratively while working closely together to ensure every feature aligns with your vision.",
  },
  {
    title: "Launch",
    description:
      "Deploy, test, and refine every detail to ensure a smooth and successful launch.",
  },
  {
    title: "Grow",
    description:
      "Provide ongoing support, maintenance, and improvements to help your business continue growing.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Web Design & Software Services",
  description:
    "Business websites, custom software, and ongoing digital support from a Des Moines studio working with clients locally and remotely.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                What we do
              </p>
              <h1>
                Digital foundations <span>built for what comes next.</span>
              </h1>
              <div className={styles.heroSummary}>
                <p>
                  From the first impression to the systems behind it, we build
                  digital work that helps ambitious businesses operate with more
                  clarity and confidence.
                </p>
                <div className={styles.heroActions}>
                  <Link
                    href="#business-websites"
                    className={styles.primaryLink}
                  >
                    Explore services
                    <span aria-hidden="true">↓</span>
                  </Link>
                  <Link href="/contact" className={styles.textLink}>
                    Start a conversation
                    <span aria-hidden="true">↗</span>
                  </Link>
                </div>
              </div>
            </div>

            <nav
              className={styles.serviceIndex}
              aria-label="Services on this page"
            >
              <p>Three ways we can help</p>
              {serviceChapters.map((service) => (
                <Link href={`#${service.id}`} key={service.id}>
                  <span>{service.number}</span>
                  {service.title}
                  <i aria-hidden="true">↘</i>
                </Link>
              ))}
            </nav>

            <div className={styles.heroGraphic} aria-hidden="true">
              <span className={styles.graphicOrbit} />
              <span className={styles.graphicCore} />
              <span className={styles.graphicNode} />
            </div>
          </div>
        </Container>
      </section>

      <div className={styles.chapters}>
        {serviceChapters.map((service, index) => (
          <section id={service.id} className={styles.chapter} key={service.id}>
            <Container>
              <div
                className={`${styles.chapterInner} ${
                  index % 2 === 1 ? styles.chapterReverse : ""
                }`}
              >
                <div className={styles.chapterCopy}>
                  <p className={styles.chapterLabel}>
                    <span>{service.number}</span>
                    {service.title}
                  </p>
                  <h2>{service.statement}</h2>
                  <p className={styles.chapterDescription}>
                    {service.description}
                  </p>
                  <div className={styles.fitNote}>
                    <span>Good fit</span>
                    <p>{service.note}</p>
                  </div>
                </div>

                <aside className={styles.capabilityPanel}>
                  <div className={styles.panelHeading}>
                    <span>Core capabilities</span>
                    <i aria-hidden="true">{service.number}</i>
                  </div>
                  <ol>
                    {service.capabilities.map((capability, capabilityIndex) => (
                      <li key={capability}>
                        <span>
                          {String(capabilityIndex + 1).padStart(2, "0")}
                        </span>
                        {capability}
                      </li>
                    ))}
                  </ol>
                  <p className={styles.panelOutcome}>{service.outcome}</p>
                </aside>
              </div>
            </Container>
          </section>
        ))}
      </div>

      <section className={styles.process}>
        <Container>
          <div className={styles.processHeader}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              How we work
            </p>
            <h2>A clear path from first conversation to what comes next.</h2>
          </div>

          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li className={styles.processStep} key={step.title}>
                <span className={styles.stepNumber}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
                {index < processSteps.length - 1 && (
                  <span className={styles.processArrow} aria-hidden="true">
                    ↓
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.closing}>
        <Container>
          <div className={styles.closingInner}>
            <p>Have something specific in mind?</p>
            <h2>Let&apos;s figure out what your business actually needs.</h2>
            <Link href="/contact" className={styles.closingLink}>
              Start a project
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
