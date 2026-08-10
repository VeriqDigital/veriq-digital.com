import Link from "next/link";
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
      "Not every business needs custom software behind its website. Some need a polished, easy-to-manage Squarespace site. Others benefit from a custom-built marketing site with greater control or integrations. We recommend the approach that fits the business, then design it around your brand, content, customers, and goals.",
    note: "Best for marketing-focused websites, redesigns, and businesses that need to build trust and generate leads.",
    capabilities: [
      "Strategy & information architecture",
      "Custom visual & responsive design",
      "Squarespace development & CMS setup",
      "Custom Next.js development",
      "Local & technical SEO foundations",
      "Analytics & conversion tracking",
    ],
    outcome:
      "A credible, practical website without paying for complexity you do not need.",
  },
  {
    number: "02",
    id: "custom-software",
    title: "Custom Software",
    statement: "Tools designed around the way your business actually works.",
    description:
      "When a project needs to handle business processes—not just explain the business—custom engineering earns its place. We build focused tools around your team, customers, integrations, and existing workflow.",
    note: "Best for teams that need application-like functionality or are losing time to manual processes, disconnected tools, or rigid software.",
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
      "Whether you have a Squarespace site, a custom website, or a larger software system, we can stay involved with maintenance, measurement, content, and thoughtful improvements as your business changes.",
    note: "Best for businesses that want a dependable technical partner rather than occasional emergency help.",
    capabilities: [
      "Domain & hosting guidance",
      "Content updates & continued design",
      "Technical maintenance & monitoring",
      "Performance and security reviews",
      "SEO and content improvements",
      "Analytics and reporting",
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
      "Provide ongoing support, maintenance, and improvements to help your business continue growing.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Web Design & Custom Software Services",
  description:
    "Des Moines web design, website redesign, custom software, and ongoing digital support for businesses across Central Iowa and beyond.",
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
                  From focused business websites to custom digital systems, we
                  choose the approach based on what will create real value for
                  the business.
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
            <h2>Let&apos;s BUILD WHAT YOUR BUSINESS NEEDS TO GROW.</h2>
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
