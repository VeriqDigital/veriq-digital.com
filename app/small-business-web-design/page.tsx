/*
THESIS: Turn the small-business website decision into a practical brief, not a generic agency pitch or a keyword-heavy service page.
OWN-WORLD: Veriq's restrained light/dark surfaces, cyan technical linework, condensed display type, and crisp editorial spacing.
STORY: An owner identifies what the website must do, sees which requirements shape the platform, understands Veriq's process, and starts a scoped conversation.
FIRST VIEWPORT: A direct small-business offer and CTA sit beside a compact website brief that connects business needs to website requirements.
FORM: The seventh grounded Persuade structure, a requirements blueprint selected with seed 9a94af6f and adapted to Veriq's established visual system.
*/
import Image from "next/image";
import Link from "next/link";
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import styles from "./small-business-web-design.module.css";

const websiteRequirements = [
  { title: "Clarity", description: "Explain the business, services, audience, and next step without making visitors decode the offer." },
  { title: "Credibility", description: "Use consistent design, accurate details, and real proof to make the business easier to trust." },
  { title: "Customer action", description: "Build useful paths to call, inquire, book, request a quote, visit, or buy based on how customers decide." },
  { title: "Mobile usability", description: "Make navigation, content, forms, and primary actions work comfortably across current screen sizes." },
  { title: "Performance and access", description: "Treat speed, semantic structure, readable contrast, keyboard use, and resilient interactions as core quality." },
  { title: "Search foundations", description: "Create crawlable pages, deliberate internal links, unique metadata, canonicals, sitemaps, and measurement." },
] as const;

const processSteps = [
  { title: "Understand the business", description: "Clarify the customers, services, current-site problems, business goals, content, and operational constraints." },
  { title: "Define the right scope", description: "Plan the pages, messages, customer path, functionality, platform, responsibilities, and launch criteria." },
  { title: "Design with real content", description: "Shape the visual system and responsive layouts around what the business actually needs to communicate." },
  { title: "Build and verify", description: "Implement the site, connect forms and integrations, and test accessibility, performance, metadata, and devices." },
  { title: "Launch and support", description: "Deploy carefully, confirm measurement and indexation, then continue maintenance and improvement when useful." },
] as const;

const faqs = [
  {
    question: "Does Veriq build custom websites or use Squarespace?",
    answer: "Both. Squarespace can be a strong fit for a marketing-focused website that should be straightforward to manage. Custom development makes sense when the experience needs greater flexibility, integrations, specialized content, or functionality. Veriq recommends the approach that fits the business rather than treating one platform as universally better.",
  },
  {
    question: "How much does a small-business website cost?",
    answer: "The cost depends on the scope, content, design requirements, page types, integrations, ecommerce, custom functionality, migration, and ongoing support. Veriq defines those requirements before providing a proposal rather than publishing a one-size-fits-all package.",
  },
  {
    question: "How long does a small-business website take?",
    answer: "A focused business website can often be completed within several weeks, while the actual schedule depends on scope, content readiness, feedback, functionality, integrations, and launch requirements. Custom software timelines depend on the work involved.",
  },
  {
    question: "Can Veriq redesign an existing business website?",
    answer: "Yes. A redesign can improve messaging, structure, visual design, mobile usability, performance, accessibility, SEO foundations, editing, or functionality while preserving the parts of the existing site that still work.",
  },
  {
    question: "Will a new website automatically generate leads or rankings?",
    answer: "No. A stronger website can improve clarity, credibility, discoverability, and the path to inquiry, but traffic, competition, reputation, offer quality, and continued marketing also affect results. Veriq does not guarantee rankings or lead volume.",
  },
  {
    question: "What happens after launch?",
    answer: "Veriq can continue with hosting, maintenance, analytics, SEO, content updates, performance work, design improvements, and feature development. The support model is defined around the business rather than required for every project.",
  },
] as const;

const featuredProjects = projects.slice(0, 2);

export const metadata = createPageMetadata({
  title: "Small Business Web Design for Growing Businesses",
  description: "Professional small-business web design through Squarespace or custom development, shaped around credibility, leads, usability, SEO foundations, and growth.",
  path: "/small-business-web-design",
});

const canonicalUrl = siteConfig.url + "/small-business-web-design";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": canonicalUrl + "#service",
      name: "Small business web design and development",
      serviceType: ["Small business website design", "Business website development", "Custom website development", "Squarespace website design", "Website redesign"],
      description: "Website strategy, design, development, launch, and ongoing support for small and growing businesses.",
      url: canonicalUrl,
      provider: { "@id": siteConfig.url + "/#organization" },
      areaServed: [
        { "@type": "Country", name: siteConfig.location.country },
        { "@type": "City", name: siteConfig.location.city + ", " + siteConfig.location.region },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": canonicalUrl + "#breadcrumbs",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        { "@type": "ListItem", position: 2, name: "Small Business Web Design", item: canonicalUrl },
      ],
    },
  ],
} as const;

export default function SmallBusinessWebDesignPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }} />

      <section className={styles.hero}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol>
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Small business web design</li>
            </ol>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Professional websites for small businesses</p>
              <h1>A website built for the business you are growing.</h1>
              <p className={styles.heroLead}>
                Veriq plans, designs, and develops small-business websites that clarify your services, strengthen credibility, and give customers a useful next step. The platform follows the need: Squarespace where it fits, custom development where it matters.
              </p>
              <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryAction}>Start a website project <span aria-hidden="true">↗</span></Link>
                <Link href="#website-brief" className={styles.secondaryAction}>Build the brief <span aria-hidden="true">↓</span></Link>
              </div>
            </div>
            <aside className={styles.briefPanel} aria-label="Small business website brief">
              <div className={styles.briefHeading}><span>Website brief</span><i aria-hidden="true">SB / 01</i></div>
              <dl>
                <div><dt>Business need</dt><dd>Credibility, inquiries, or a better customer process</dd></div>
                <div><dt>Customer decision</dt><dd>Understand, trust, then take the right next step</dd></div>
                <div><dt>Build approach</dt><dd>Managed platform or custom development, based on fit</dd></div>
                <div><dt>Long-term test</dt><dd>Useful now, maintainable later, ready to grow</dd></div>
              </dl>
              <p>Start with these requirements before choosing pages or technology.</p>
            </aside>
          </div>
        </Container>
      </section>

      <section className={styles.fitSection}>
        <Container>
          <div className={styles.fitGrid}>
            <p>Designed for practical business needs</p>
            <ul>
              <li>Service businesses</li><li>Professional services</li><li>Contractors and trades</li><li>Gyms and local operators</li><li>Growing regional businesses</li>
            </ul>
          </div>
        </Container>
      </section>

      <section id="website-brief" className={styles.requirements}>
        <Container>
          <div className={styles.requirementsIntro}>
            <p className={styles.sectionLabel}>What the website needs to do</p>
            <div>
              <h2>Good business website design connects the message to the action.</h2>
              <p>The right website is not defined by a page count or a visual trend. It is a clear system for helping the right customer understand the business, reduce uncertainty, and complete the next step without unnecessary friction.</p>
            </div>
          </div>
          <div className={styles.requirementList}>
            {websiteRequirements.map((requirement, index) => (
              <article key={requirement.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{requirement.title}</h3>
                <p>{requirement.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.platformSection}>
        <Container>
          <div className={styles.platformHeader}>
            <p className={styles.sectionLabel}>Choose the platform after the requirements</p>
            <h2>Squarespace and custom development solve different versions of the problem.</h2>
          </div>
          <div className={styles.platformGrid}>
            <article>
              <div className={styles.platformTitle}><span>Managed platform</span><strong>Squarespace</strong></div>
              <p>Often a strong fit for a marketing-focused website that needs a polished experience, standard forms or integrations, and a straightforward editing and maintenance model.</p>
              <ul><li>Familiar business website content</li><li>Supported platform features</li><li>Practical in-house editing</li><li>Lower infrastructure responsibility</li></ul>
            </article>
            <article>
              <div className={styles.platformTitle}><span>Flexible implementation</span><strong>Custom development</strong></div>
              <p>Useful when the website needs specialized interactions, integrations, content structures, performance control, or functionality built around how the business operates.</p>
              <ul><li>Quote, intake, portal, or dashboard features</li><li>Business-specific integrations and workflows</li><li>Distinct content and interaction requirements</li><li>Greater implementation flexibility</li></ul>
            </article>
          </div>
          <div className={styles.platformDecision}>
            <p>Complexity, budget, functionality, maintainability, and growth plans all shape the recommendation.</p>
            <Link href="/resources/custom-website-vs-template-for-small-business">Compare custom websites and templates <span aria-hidden="true">↗</span></Link>
          </div>
        </Container>
      </section>

      <section className={styles.redesignSection}>
        <Container>
          <div className={styles.redesignGrid}>
            <div><p className={styles.sectionLabel}>New website or redesign</p><h2>Keep what works. Replace what holds the business back.</h2></div>
            <div>
              <p>A project can start from scratch or from an existing site. A redesign may need clearer messaging, stronger mobile behavior, faster pages, better editing, improved search foundations, or a lead path that matches how customers actually buy.</p>
              <p>The goal is not change for its own sake. Existing content, URLs, analytics, domain access, forms, and useful brand equity should be reviewed before anything is replaced.</p>
              <Link href="/resources/why-isnt-my-website-getting-leads">Diagnose a website that is not getting leads <span aria-hidden="true">↗</span></Link>
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.processSection}>
        <Container>
          <div className={styles.processHeader}><p className={styles.sectionLabel}>How Veriq works</p><h2>A direct process from business problem to dependable launch.</h2></div>
          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.description}</p></div></li>
            ))}
          </ol>
        </Container>
      </section>

      <section className={styles.workSection}>
        <Container>
          <div className={styles.workHeader}>
            <div><p className={styles.sectionLabel}>Demonstration work</p><h2>See the design and frontend thinking in practice.</h2></div>
            <p>These are self-directed concepts, not client case studies. They demonstrate how Veriq approaches hierarchy, responsive design, service communication, and conversion paths.</p>
          </div>
          <div className={styles.workGrid}>
            {featuredProjects.map((project) => (
              <Link href={"/work/" + project.slug} key={project.slug}>
                <div className={styles.workImage}><Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 760px) 100vw, 50vw" className={styles.workImageAsset} /></div>
                <div className={styles.workMeta}><div><span>{project.category}</span><h3>{project.title}</h3></div><i aria-hidden="true">↗</i></div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.resourcesSection}>
        <Container>
          <div className={styles.resourcesHeader}><p className={styles.sectionLabel}>Plan the right project</p><h2>Answer the buying questions before comparing proposals.</h2></div>
          <div className={styles.resourceLinks}>
            <Link href="/resources/how-much-does-a-small-business-website-cost"><span>Cost</span><strong>How much does a small-business website cost?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/web-designer-vs-website-builder-for-small-business"><span>Approach</span><strong>Web designer or website builder?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/custom-website-vs-template-for-small-business"><span>Platform</span><strong>Custom website or template?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/how-to-choose-a-web-designer-in-des-moines"><span>Provider</span><strong>How should you evaluate a web designer?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/what-should-a-local-business-website-include"><span>Essentials</span><strong>What should a useful business website include?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/what-makes-a-small-business-website-look-professional"><span>Presentation</span><strong>What makes a business website look professional?</strong><i aria-hidden="true">↗</i></Link>
          </div>
        </Container>
      </section>

      <section className={styles.localBridge}>
        <Container><div><p>Based in Des Moines, working locally and remotely</p><h2>Need a website partner who understands the Central Iowa market?</h2><Link href="/des-moines-web-design">Explore Des Moines web design <span aria-hidden="true">↗</span></Link></div></Container>
      </section>

      <section className={styles.faqSection}>
        <Container>
          <div className={styles.faqGrid}>
            <div><p className={styles.sectionLabel}>Frequently asked questions</p><h2>What to know before starting.</h2></div>
            <div className={styles.faqList}>
              {faqs.map((faq, index) => (
                <details key={faq.question}><summary><span>{String(index + 1).padStart(2, "0")}</span>{faq.question}<i aria-hidden="true">+</i></summary><p>{faq.answer}</p></details>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section className={styles.closing}>
        <Container>
          <div className={styles.closingInner}>
            <p>Bring the business problem, not a predetermined platform.</p>
            <h2>Build the website your next stage actually needs.</h2>
            <div className={styles.closingActions}>
              <Link href="/contact">Start a project <span aria-hidden="true">↗</span></Link>
              <BookingLink placement="small_business_web_design_closing">Book a 20-minute call <span aria-hidden="true">↗</span></BookingLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
