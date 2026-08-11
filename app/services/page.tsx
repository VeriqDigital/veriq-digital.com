import Link from "next/link";
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "./services.module.css";

const serviceChapters = [
  {
    number: "01",
    id: "business-websites",
    title: "Business Websites",
    statement: "A sharper digital presence built to earn attention and trust.",
    description:
      "A strong business website should clarify your value, build credibility, and turn attention into action. We shape the strategy, content, design, SEO foundations, and conversion paths around those goals, then implement the site in Squarespace or through custom development based on what the work requires.",
    note: "Best for marketing-focused websites, redesigns, and businesses that need to build trust and generate leads.",
    capabilities: [
      "Strategy & information architecture",
      "Custom visual & responsive design",
      "Messaging & conversion paths",
      "CMS setup & content management",
      "Local & technical SEO foundations",
      "Analytics & conversion tracking",
    ],
    outcome:
      "A credible, effective website built to attract the right customers and remain practical to manage.",
  },
  {
    number: "02",
    id: "custom-development",
    title: "Custom Development",
    statement:
      "Functionality built around the way your business actually works.",
    description:
      "When a website needs to do more than communicate, we design and build the functionality behind it—from quote and intake systems to portals, dashboards, workflow tools, integrations, and application-like web experiences.",
    note: "Best for projects that need custom functionality, connected systems, or workflows that off-the-shelf tools cannot handle well.",
    capabilities: [
      "Customer & staff portals",
      "Quote and intake systems",
      "Dashboards & reporting tools",
      "Booking & workflow tools",
      "API integrations & automation",
      "Custom website functionality",
    ],
    outcome:
      "Focused technical capability that solves a real business need without adding unnecessary complexity.",
  },
  {
    number: "03",
    id: "ongoing-support",
    title: "Growth & Support",
    statement: "A digital presence that keeps improving after launch.",
    description:
      "Launch creates a baseline. We use ongoing SEO, content, analytics, design iteration, maintenance, performance work, and continued development to strengthen results over time.",
    note: "Best for businesses that want a long-term growth partner rather than occasional updates or emergency technical help.",
    capabilities: [
      "Ongoing SEO & content improvements",
      "Analytics & conversion optimization",
      "Performance & technical maintenance",
      "Content updates & design iteration",
      "Continued web development",
      "Domain & hosting guidance",
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
      "Bring the approved direction to life on the chosen platform, with close collaboration and careful testing throughout.",
  },
  {
    title: "Launch",
    description:
      "Deploy, test, and refine every detail to ensure a smooth and successful launch.",
  },
  {
    title: "Grow",
    description:
      "Measure performance and keep improving SEO, content, conversion, design, and functionality over time.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Web Design & Custom Development Services",
  description:
    "Explore business websites, custom development, SEO, and ongoing growth support from Veriq Digital in Central Iowa and beyond.",
  path: "/services",
});

const servicesStructuredData = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Veriq Digital services",
  itemListElement: serviceChapters.map((service, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "Service",
      "@id": `${siteConfig.url}/services#${service.id}`,
      name: service.title,
      description: service.description,
      url: `${siteConfig.url}/services#${service.id}`,
      provider: {
        "@id": `${siteConfig.url}/#organization`,
      },
      areaServed: [
        {
          "@type": "City",
          name: `${siteConfig.location.city}, ${siteConfig.location.region}`,
        },
        {
          "@type": "AdministrativeArea",
          name: "Central Iowa",
        },
      ],
    },
  })),
} as const;

export default function ServicesPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(servicesStructuredData),
        }}
      />
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                What we do
              </p>
              <h1>
                Beautiful Websites <span>are just the beginning.</span>
              </h1>
              <div className={styles.heroSummary}>
                <p>
                  We design, build, and improve the websites and digital
                  experiences that help businesses earn trust, generate
                  opportunities, and grow.
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
                  {service.id === "business-websites" ? (
                    <Link
                      href="/des-moines-web-design"
                      className={styles.chapterLink}
                    >
                      Explore web design for Des Moines businesses
                      <span aria-hidden="true">↗</span>
                    </Link>
                  ) : null}
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
            <h2>Let&apos;s BUILD WHAT YOUR BUSINESS NEEDS TO GROW.</h2>
            <div className={styles.closingActions}>
              <Link href="/contact" className={styles.closingLink}>
                Start a project
                <span aria-hidden="true">↗</span>
              </Link>
              <BookingLink
                className={styles.bookingLink}
                placement="services_closing"
              >
                Book a 20-minute call
                <span aria-hidden="true">↗</span>
              </BookingLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
