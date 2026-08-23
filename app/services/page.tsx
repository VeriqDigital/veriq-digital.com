/*
THESIS: Make Veriq's three offers understandable in seconds without replacing the established Services-page identity.
OWN-WORLD: Dark charcoal fields, warm-white type, signal cyan, heavy Geist Sans headlines, mono indices, fine rules, and asymmetrical editorial layouts.
STORY: Choose a website path, understand how local visibility supports it, see what conversion tools can add, then learn how Veriq can keep improving the site after launch.
FIRST VIEWPORT: Oversized positioning statement on the left, two direct actions below, and a ruled three-service index on the right.
FORM: Existing editorial chapter sequence, refined with Option B's information clarity; brief-pinned, no concept seed.
*/

import Link from "next/link";
import Container from "@/components/ui/Container";
import BookingLink from "@/components/ui/BookingLink";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "./services.module.css";

const serviceChapters = [
  {
    number: "01",
    id: "web-design-development",
    title: "Web Design & Development",
    summary: "Build a new website or substantially improve the one you have.",
    statement: "WEBSITES BUILT AROUND YOUR BUSINESS, NOT A TEMPLATE.",
    description:
      "From streamlined Squarespace builds to fully custom Next.js websites, Veriq chooses the approach around the business, its customers, and what the site actually needs to accomplish. That can mean starting fresh or redesigning an existing site that no longer performs or represents the company well.",
    note: "Best for businesses that need a new website, a substantial redesign, or a clearer and more useful digital presence.",
    capabilities: [
      "Custom Next.js websites",
      "Squarespace websites",
      "Website redesigns",
      "Responsive, mobile-first design",
      "CMS and content setup",
      "Conversion-focused page structure",
    ],
    outcome:
      "A credible, responsive website built with the right level of flexibility and complexity for the business.",
  },
  {
    number: "02",
    id: "seo-growth",
    title: "SEO & Local Visibility",
    summary:
      "Improve the foundation that helps the right customers find your business in search.",
    statement:
      "A website that can't be found is a website that can't help the business.",
    description:
      "SEO starts with the structure and technical quality of the website itself, then expands into local search, Google Business Profile optimization, useful service and location content, and continued improvement. Veriq builds that foundation without promising shortcuts or guaranteed rankings.",
    note: "Especially useful for small and local businesses that need stronger visibility in Des Moines, across Iowa, or in the markets they actually serve.",
    capabilities: [
      "Local SEO",
      "Technical SEO",
      "Google Business Profile optimization",
      "On-page optimization",
      "Analytics and conversion tracking",
      "Service and location content",
      "Ongoing optimization",
    ],
    outcome:
      "A stronger technical, local, and content foundation that helps the business appear in relevant search results.",
  },
  {
    number: "03",
    id: "custom-website-tools",
    title: "Conversion & Website Tools",
    summary:
      "Give customers better ways to quote, book, order, calculate, and take action.",
    statement: "Your website can do more than display information.",
    description:
      "When a standard form or plugin isn't enough, Veriq can build focused functionality directly into your website. From quote calculators and booking systems to customer ordering and lead capture, every tool is built around one goal: making it easier for visitors to take the next step.",
    note: "Best for businesses that need a better way for website visitors to quote, book, order, calculate, or inquire.",
    capabilities: [
      "Quote & estimate tools",
      "Booking & scheduling",
      "Customer ordering",
      "Calculators & interactive tools",
      "Forms & lead capture",
      "Custom website functionality",
    ],
    outcome:
      "Focused website functionality that makes it easier for customers to take action.",
  },
] as const;

const websitePaths = [
  {
    code: "01A",
    id: "custom-websites",
    title: "Custom Website",
    description:
      "Built with custom code when the business needs maximum flexibility, stronger performance control, unique functionality, or a highly differentiated experience.",
    bestFor:
      "Conversion-focused functionality, customer-facing integrations, and businesses that do not want the platform to set the ceiling.",
    href: "/small-business-web-design",
    linkLabel: "Explore custom websites",
  },
  {
    code: "01B",
    id: "squarespace-websites",
    title: "Squarespace Website",
    description:
      "A professional, well-structured website on a platform that makes routine content management straightforward for the business.",
    bestFor:
      "Marketing-focused sites that need a practical editing experience without unnecessary technical complexity.",
    href: "/small-business-web-design",
    linkLabel: "Explore Squarespace websites",
  },
  {
    code: "01C",
    id: "website-redesigns",
    title: "Website Redesign",
    description:
      "A substantial rethink for an existing site that feels outdated, performs poorly, communicates badly, or no longer reflects the business.",
    bestFor:
      "Businesses that already have a website but need better structure, clearer messaging, stronger design, or a more capable platform.",
    href: "/website-redesign",
    linkLabel: "Explore website redesigns",
  },
] as const;

const supportItems = [
  "Content updates",
  "Technical maintenance",
  "Performance monitoring",
  "Local and technical SEO improvements",
  "New service and landing pages",
  "Feature additions",
  "Analytics and conversion improvements",
  "Domain and hosting guidance",
] as const;

const processSteps = [
  {
    title: "Discover",
    description:
      "Understand the business, the audience, the current site, and the problem the work needs to solve.",
  },
  {
    title: "Design",
    description:
      "Shape the structure, content, interface, and right implementation path before development begins.",
  },
  {
    title: "Develop",
    description:
      "Build the approved direction with responsive behavior, accessibility, performance, and maintainability in mind.",
  },
  {
    title: "Launch",
    description:
      "Test the complete experience, connect the required systems, and move the work into production carefully.",
  },
  {
    title: "Improve",
    description:
      "Keep improving content, search visibility, conversions, performance, and functionality when the business needs it.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Web Design, Local SEO & Conversion Tools",
  description:
    "Explore custom and Squarespace web design, website redesigns, local and technical SEO, and conversion-focused website functionality from Veriq Digital in Des Moines, Iowa.",
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
    <main id="main-content" className={styles.page} data-services-page>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(servicesStructuredData),
        }}
      />

      <section className={styles.hero}>
        <div className={styles.heroGrid} aria-hidden="true" />
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroStatement}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                Services
              </p>
              <h1>
                Pick the right path
                <span>for your business</span>
              </h1>
            </div>

            <nav
              className={styles.serviceIndex}
              aria-label="Services on this page"
            >
              <p>Primary services</p>
              {serviceChapters.map((service) => (
                <Link href={`#${service.id}`} key={service.id}>
                  <span>{service.number}</span>
                  <strong>{service.title}</strong>
                  <small>{service.summary}</small>
                  <i aria-hidden="true">↘</i>
                </Link>
              ))}
            </nav>

            <div className={styles.heroDetails}>
              <p className={styles.heroDescription}>
                Veriq follows a simple plan: build a stronger website, help the
                right customers find it, create clearer paths to conversion,
                and keep improving after launch.
              </p>
              <div className={styles.heroActions}>
                <BookingLink
                  placement="services_hero"
                  className={styles.primaryLink}
                >
                  Book a Call
                  <span aria-hidden="true">↗</span>
                </BookingLink>
                <Link href="/contact" className={styles.secondaryLink}>
                  Get in Touch
                  <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.overview} aria-labelledby="service-overview">
        <Container>
          <div className={styles.overviewHeader}>
            <p className={styles.sectionLabel}>The whole offer</p>
            <h2 id="service-overview">Three services. One plan.</h2>
          </div>
          <ol className={styles.overviewList}>
            {serviceChapters.map((service) => (
              <li key={service.id}>
                <Link href={`#${service.id}`}>
                  <span>{service.number}</span>
                  <div>
                    <h3>{service.title}</h3>
                    <p>{service.summary}</p>
                    <ul aria-label={`${service.title} examples`}>
                      {service.capabilities.slice(0, 3).map((capability) => (
                        <li key={capability}>{capability}</li>
                      ))}
                    </ul>
                  </div>
                  <i aria-hidden="true">↓</i>
                </Link>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <div className={styles.chapters}>
        {serviceChapters.map((service, index) => (
          <section id={service.id} className={styles.chapter} key={service.id}>
            <Container wide={service.id === "web-design-development"}>
              <div
                className={`${styles.chapterInner} ${
                  index === 1 ? styles.chapterReverse : ""
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

                  {service.id === "web-design-development" ? (
                    <div className={styles.inlineLinks}>
                      <Link href="/small-business-web-design">
                        Small business web design{" "}
                        <span aria-hidden="true">↗</span>
                      </Link>
                      <Link href="/des-moines-web-design">
                        Des Moines web design <span aria-hidden="true">↗</span>
                      </Link>
                    </div>
                  ) : null}

                  {service.id === "seo-growth" ? (
                    <WebsiteAuditLink
                      placement="services_seo"
                      className={styles.auditLink}
                    >
                      See how your site performs
                      <span>Free website audit</span>
                      <i aria-hidden="true">↗</i>
                    </WebsiteAuditLink>
                  ) : null}
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

              {service.id === "web-design-development" ? (
                <div className={styles.pathSection}>
                  <div className={styles.pathHeading}>
                    <p className={styles.sectionLabel}>Choose the right path</p>
                    <h3>Custom, Squarespace, or a complete redesign.</h3>
                    <p>
                      These are different implementation paths—not pricing
                      tiers. Veriq recommends the approach that fits the
                      business and the job the website needs to do.
                    </p>
                  </div>
                  <div className={styles.pathGrid}>
                    {websitePaths.map((path) => (
                      <article id={path.id} key={path.id}>
                        <span className={styles.pathCode}>{path.code}</span>
                        <h4>{path.title}</h4>
                        <p>{path.description}</p>
                        <div className={styles.bestFor}>
                          <span>Best for</span>
                          <p>{path.bestFor}</p>
                        </div>
                        <Link href={path.href}>
                          {path.linkLabel}
                          <span aria-hidden="true">↗</span>
                        </Link>
                      </article>
                    ))}
                  </div>
                </div>
              ) : null}
            </Container>
          </section>
        ))}
      </div>

      <section id="ongoing-support" className={styles.support}>
        <Container>
          <div className={styles.supportLayout}>
            <div className={styles.supportCopy}>
              <p className={styles.sectionLabel}>Ongoing support</p>
              <h2>Keep making the site better.</h2>
              <p>
                The launch is not the finish line. When it is useful, Veriq can
                continue helping with maintenance, content, local search
                visibility, performance, conversion work, and new
                functionality. Ongoing support can match what the business
                needs; it is not required for every project.
              </p>
            </div>
            <ul className={styles.supportList}>
              {supportItems.map((item, index) => (
                <li key={item}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className={styles.process}>
        <Container>
          <div className={styles.processHeader}>
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              How we work
            </p>
            <h2>The path from problem to solution.</h2>
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
                {index < processSteps.length - 1 ? (
                  <span className={styles.processArrow} aria-hidden="true">
                    ↓
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.closing}>
        <Container>
          <div className={styles.closingInner}>
            <p>Not sure what the business actually needs?</p>
            <div>
              <h2>
                Start with the problem. We&apos;ll find the right approach.
              </h2>
              <p className={styles.closingCopy}>
                You do not need to know whether the answer is Next.js,
                Squarespace, SEO, a redesign, or custom functionality before
                reaching out.
              </p>
            </div>
            <div className={styles.closingActions}>
              <Link href="/contact" className={styles.closingLink}>
                Start a project
                <span aria-hidden="true">↗</span>
              </Link>
              <WebsiteAuditLink
                placement="services_closing"
                className={styles.closingAuditLink}
              >
                Run a free website audit
                <span aria-hidden="true">↗</span>
              </WebsiteAuditLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
