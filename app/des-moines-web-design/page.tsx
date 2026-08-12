/*
THESIS: Show a business website as a working customer path, not a decorative portfolio object or an oversized SEO article.
OWN-WORLD: Veriq's restrained light/dark surfaces, cyan technical linework, condensed display type, and precise editorial spacing.
STORY: A Des Moines owner recognizes the business problem, sees the full design-and-build capability, understands the process, verifies the work, and starts a conversation.
FIRST VIEWPORT: A direct local offer and CTA sit beside a live path diagram from first impression to qualified inquiry.
FORM: An established-world Persuade extension with an outcome-path composition; no new visual identity or microsite grammar.
*/
import Image from "next/image";
import Link from "next/link";
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import styles from "./des-moines-web-design.module.css";

const capabilities = [
  {
    title: "Positioning and structure",
    description:
      "Clarify what the business offers, who it serves, and how pages should guide a visitor from first question to next step.",
  },
  {
    title: "Custom responsive design",
    description:
      "Create a visual system and page layouts around your brand and content, with deliberate behavior across phones, tablets, and desktops.",
  },
  {
    title: "Website development",
    description:
      "Build the approved experience as a fast, maintainable site with reliable forms, integrations, and content management where appropriate.",
  },
  {
    title: "Performance and accessibility",
    description:
      "Treat loading speed, keyboard use, contrast, semantic structure, and resilient interactions as part of the product rather than final polish.",
  },
  {
    title: "SEO foundations",
    description:
      "Implement crawlable content, unique metadata, canonicals, sitemaps, redirects, structured data where valid, and measurement through Search Console and analytics.",
  },
  {
    title: "Conversion and lead paths",
    description:
      "Shape calls to action, service explanations, trust signals, and contact flows around how a qualified customer actually makes a decision.",
  },
] as const;

const processSteps = [
  {
    title: "Understand",
    description:
      "Start with the business, customers, current-site problems, goals, content, and operational constraints.",
  },
  {
    title: "Plan",
    description:
      "Define the scope, information architecture, priority messages, conversion path, technical needs, and launch criteria.",
  },
  {
    title: "Design",
    description:
      "Turn real content into responsive layouts and a visual system, then refine the work through focused feedback.",
  },
  {
    title: "Develop",
    description:
      "Build and integrate the site, testing performance, accessibility, forms, metadata, and real content as the work progresses.",
  },
  {
    title: "Launch and improve",
    description:
      "Deploy carefully, confirm measurement and indexation, then support maintenance and continued improvements when needed.",
  },
] as const;

const faqs = [
  {
    question: "How much does a business website cost?",
    answer:
      "Veriq scopes each project around the business goal, content, page types, functionality, integrations, and support needs rather than using a fixed package. After an initial conversation, we can define the work and provide a clear proposal. Our website cost guide explains the variables worth comparing.",
  },
  {
    question: "How long does a website project take?",
    answer:
      "Most business websites are completed within two to six weeks. The actual schedule depends on scope, content readiness, feedback, functionality, integrations, and launch requirements. We establish the timeline before work begins and make the dependencies clear.",
  },
  {
    question: "Can Veriq redesign an existing website?",
    answer:
      "Yes. A project can begin with an existing site. We can improve the structure, messaging, design, performance, accessibility, technical SEO, integrations, or content workflow based on what the business actually needs.",
  },
  {
    question: "Do you only work with businesses in Des Moines?",
    answer:
      "No. Veriq is based in Des Moines and works with businesses in Central Iowa as well as remotely. The process is designed to keep communication direct whether the business is nearby or elsewhere.",
  },
  {
    question: "What happens after the site launches?",
    answer:
      "Veriq can continue with hosting, maintenance, performance improvements, analytics, SEO, content updates, and feature development. The appropriate support model is defined with the project rather than forced into every engagement.",
  },
] as const;

const featuredProjects = projects.slice(0, 2);

export const metadata = createPageMetadata({
  title: "Des Moines Web Design for Growing Businesses",
  description:
    "Custom Des Moines web design and development for businesses that need a clear, credible, responsive website built around customers and business outcomes.",
  path: "/des-moines-web-design",
});

const canonicalUrl = `${siteConfig.url}/des-moines-web-design`;
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": `${canonicalUrl}#service`,
      name: "Des Moines web design and development",
      serviceType: [
        "Business website design",
        "Custom website development",
        "Website redesign",
        "Responsive web design",
      ],
      description:
        "Custom website strategy, design, development, launch, and ongoing support for businesses in Des Moines and Central Iowa.",
      url: canonicalUrl,
      provider: { "@id": `${siteConfig.url}/#organization` },
      areaServed: [
        {
          "@type": "City",
          name: `${siteConfig.location.city}, ${siteConfig.location.region}`,
        },
        { "@type": "AdministrativeArea", name: "Central Iowa" },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": `${canonicalUrl}#breadcrumbs`,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: siteConfig.url,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "Des Moines Web Design",
          item: canonicalUrl,
        },
      ],
    },
  ],
} as const;

export default function DesMoinesWebDesignPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <section className={styles.hero}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Des Moines web design</li>
            </ol>
          </nav>

          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Websites for Central Iowa businesses</p>
              <h1>Des Moines web design built around your business.</h1>
              <p className={styles.heroLead}>
                Veriq plans, designs, and develops clear, credible websites that
                help customers understand your value and take the next step.
                The work is shaped around business outcomes, not a premade
                layout.
              </p>
              <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryAction}>
                  Start a website project <span aria-hidden="true">↗</span>
                </Link>
                <Link href="#approach" className={styles.secondaryAction}>
                  See the approach <span aria-hidden="true">↓</span>
                </Link>
              </div>
            </div>

            <figure className={styles.outcomePath}>
              <figcaption>What the website must do</figcaption>
              <ol>
                <li>
                  <span>01</span>
                  <strong>Earn attention</strong>
                  <small>Relevant message</small>
                </li>
                <li>
                  <span>02</span>
                  <strong>Build confidence</strong>
                  <small>Clear services and proof</small>
                </li>
                <li>
                  <span>03</span>
                  <strong>Remove friction</strong>
                  <small>Fast, accessible experience</small>
                </li>
                <li>
                  <span>04</span>
                  <strong>Create the next step</strong>
                  <small>Useful inquiry or action</small>
                </li>
              </ol>
            </figure>
          </div>
        </Container>
      </section>

      <section id="approach" className={styles.approach}>
        <Container>
          <div className={styles.approachIntro}>
            <p className={styles.sectionLabel}>A business tool, not a brochure</p>
            <div>
              <h2>Design starts with the decision your customer needs to make.</h2>
              <p>
                A good-looking website can still leave people unsure what a
                business does, whether it is right for them, or how to get
                started. Veriq connects the message, structure, interface, and
                technology so the finished site supports a real customer path.
              </p>
            </div>
          </div>

          <dl className={styles.businessCases}>
            <div>
              <dt>New business website</dt>
              <dd>
                Establish a credible foundation with focused services, a clear
                value proposition, and a dependable lead path.
              </dd>
            </div>
            <div>
              <dt>Website redesign</dt>
              <dd>
                Replace an outdated, slow, unclear, or hard-to-manage site while
                preserving what already works.
              </dd>
            </div>
            <div>
              <dt>Custom customer experience</dt>
              <dd>
                Add quoting, booking, intake, portals, or integrations when the
                website needs to support more than marketing.
              </dd>
            </div>
          </dl>
        </Container>
      </section>

      <section className={styles.capabilities}>
        <Container>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>What the work covers</p>
            <h2>Custom website design and development, end to end.</h2>
          </div>

          <div className={styles.capabilityList}>
            {capabilities.map((capability, index) => (
              <article key={capability.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{capability.title}</h3>
                <p>{capability.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.localSection}>
        <Container>
          <div className={styles.localGrid}>
            <div>
              <p className={styles.sectionLabel}>Local context, applied carefully</p>
              <h2>Made for how Des Moines businesses actually win trust.</h2>
            </div>
            <div className={styles.localCopy}>
              <p>
                Veriq works best with established local and regional service
                businesses that have outgrown a weak website or an inefficient
                customer process. That can include contractors, auto shops,
                professional services, gyms, and other businesses where
                credibility and an easy next step matter.
              </p>
              <p>
                Local relevance comes from accurately explaining the services,
                audience, and legitimate market, then keeping business details
                consistent across the website and major profiles. It does not
                come from duplicating thin pages for every nearby city.
              </p>
              <p>
                Veriq is based in Des Moines and serves Central Iowa as well as
                remote clients. You work directly with the person planning,
                designing, and building the project, which keeps business
                context close to the work.
              </p>
              <p>
                Businesses outside the local market can explore Veriq&apos;s
                broader{" "}
                <Link href="/small-business-web-design">
                  small business web design service
                </Link>
                , which covers the same business-first approach without a
                geographic focus.
              </p>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.process}>
        <Container>
          <div className={styles.sectionHeader}>
            <p className={styles.sectionLabel}>The process</p>
            <h2>A clear path from first conversation to launch.</h2>
          </div>
          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.workSection}>
        <Container>
          <div className={styles.workHeader}>
            <div>
              <p className={styles.sectionLabel}>Selected demonstrations</p>
              <h2>Examples of the thinking in practice.</h2>
            </div>
            <p>
              These are self-directed concept projects, not client case studies
              or claims of customer results. They demonstrate Veriq’s design,
              frontend, responsive, and conversion-path capabilities.
            </p>
          </div>

          <div className={styles.workGrid}>
            {featuredProjects.map((project) => (
              <Link href={`/work/${project.slug}`} key={project.slug}>
                <div className={styles.workImage}>
                  <Image
                    src={project.image}
                    alt={project.imageAlt}
                    fill
                    sizes="(max-width: 720px) calc(100vw - 3rem), 50vw"
                    className={styles.workImageAsset}
                  />
                </div>
                <div className={styles.workMeta}>
                  <span>{project.category}</span>
                  <h3>{project.title}</h3>
                  <i aria-hidden="true">View project ↗</i>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.buyingGuides}>
        <Container>
          <div className={styles.guidesIntro}>
            <p className={styles.sectionLabel}>Before you hire</p>
            <h2>Make the next decision with better information.</h2>
          </div>
          <div className={styles.guideLinks}>
            <Link href="/resources/how-much-does-a-website-cost-in-des-moines">
              <span>Cost and scope</span>
              <strong>How much does a website cost in Des Moines?</strong>
              <i aria-hidden="true">↗</i>
            </Link>
            <Link href="/resources/how-to-choose-a-web-designer-in-des-moines">
              <span>Provider fit</span>
              <strong>How to choose a web designer in Des Moines</strong>
              <i aria-hidden="true">↗</i>
            </Link>
            <Link href="/resources/how-long-does-it-take-to-build-a-small-business-website">
              <span>Project planning</span>
              <strong>What determines a small business website timeline?</strong>
              <i aria-hidden="true">↗</i>
            </Link>
          </div>
        </Container>
      </section>

      <section className={styles.faqSection}>
        <Container>
          <div className={styles.faqGrid}>
            <div className={styles.faqIntro}>
              <p className={styles.sectionLabel}>Common questions</p>
              <h2>What to know before starting.</h2>
            </div>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <details key={faq.question} open={index === 0} name="web-design-faq">
                  <summary>
                    <span>{faq.question}</span>
                    <i aria-hidden="true">+</i>
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.closing}>
        <Container>
          <div className={styles.closingInner}>
            <p>Have a website problem worth solving?</p>
            <h2>Build a clearer path from search to customer.</h2>
            <div className={styles.closingActions}>
              <Link href="/contact">
                Start a conversation <span aria-hidden="true">↗</span>
              </Link>
              <BookingLink placement="des_moines_closing">
                Book a 20-minute call <span aria-hidden="true">↗</span>
              </BookingLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
