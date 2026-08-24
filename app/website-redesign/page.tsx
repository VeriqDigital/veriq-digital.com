/*
THESIS: Treat a custom website redesign as an evidence-based decision about what to keep, improve, migrate, or rebuild—not a cosmetic reset.
OWN-WORLD: Veriq's existing light/dark surfaces, cyan signals, condensed headings, mono labels, rules, and restrained rounded panels.
STORY: A business owner recognizes structural problems, sees how the current site is audited, understands the possible paths, protects useful equity, and starts a scoped conversation.
FIRST VIEWPORT: A direct redesign offer and CTA sit beside a current-site dossier that classifies business gap, working assets, likely path, and migration rule.
FORM: A redesign decision dossier, fifth in the grounded structure list, staged as an addressable audit record; seed 5eed7263.
*/
import Image from "next/image";
import Link from "next/link";
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { projects } from "@/data/projects";
import styles from "./website-redesign.module.css";

const redesignSignals = [
  {
    title: "The business has moved on",
    description:
      "Services, audience, positioning, team, locations, or brand presentation no longer match what customers see online.",
  },
  {
    title: "Customers meet friction",
    description:
      "Navigation, mobile layouts, forms, accessibility, speed, or calls to action make common tasks harder than they should be.",
  },
  {
    title: "The site resists updates",
    description:
      "Routine content changes break layouts, require workarounds, or depend on a system the team can no longer manage confidently.",
  },
  {
    title: "Growth exposed constraints",
    description:
      "New services, content, integrations, locations, or customer journeys no longer fit the current platform or structure.",
  },
] as const;

const decisionPaths = [
  {
    path: "Improve",
    condition: "The foundation is sound and the failures are contained.",
    work: "Focused messaging, layout, speed, accessibility, form, or conversion improvements.",
  },
  {
    path: "Redesign",
    condition: "Problems repeat across the customer experience.",
    work: "A shared visual, content, responsive, and interaction system while preserving useful foundations.",
  },
  {
    path: "Rebuild",
    condition: "Structural or technical constraints control the outcome.",
    work: "Preserve useful equity while replacing the site with a custom design, modern development, and an explicit migration plan.",
  },
] as const;

const auditAreas = [
  "Business goals and current positioning",
  "Navigation, page hierarchy, and content",
  "Mobile and responsive behavior",
  "Performance and third-party scripts",
  "Accessibility and interaction states",
  "Lead paths, forms, and integrations",
  "Editing, ownership, and maintenance",
  "Indexed URLs, metadata, and analytics",
] as const;

const redesignWork = [
  {
    title: "Message and structure",
    description:
      "Clarify the offer, audiences, page hierarchy, navigation, and the path from a customer question to a useful next step.",
  },
  {
    title: "Responsive experience",
    description:
      "Recompose content, controls, forms, media, and conversion actions so the experience works across current screen sizes.",
  },
  {
    title: "Performance and access",
    description:
      "Reduce unnecessary weight, improve loading behavior, use semantic structure, and build keyboard, contrast, and form quality into the system.",
  },
  {
    title: "Forms and functionality",
    description:
      "Repair or replace contact flows, booking, quoting, CRM connections, ecommerce, and customer-facing integrations where needed.",
  },
  {
    title: "Search foundations",
    description:
      "Plan page intent, crawlability, metadata, canonicals, internal links, structured data where valid, and redirects when URLs change.",
  },
  {
    title: "Editing and ownership",
    description:
      "Choose an implementation the business can operate, with clear account ownership, content responsibilities, and support after launch.",
  },
] as const;

const preservationItems = [
  ["Indexed URLs", "Keep useful URLs where practical; map relevant redirects when they change."],
  ["Page intent", "Preserve the purpose and value of pages that already serve customers or search demand."],
  ["Content and media", "Retain accurate, credible material instead of rewriting everything by default."],
  ["Analytics history", "Document current measurement and verify meaningful events after launch."],
  ["Backlinks", "Identify external links pointing to URLs that may move or disappear."],
  ["Working functions", "Test and preserve forms and customer-facing integrations that still support the website."],
] as const;

const processSteps = [
  {
    title: "Audit the current site",
    description:
      "Review goals, content, customer paths, analytics, technical constraints, ownership, and the parts that already work.",
  },
  {
    title: "Define the right intervention",
    description:
      "Separate focused fixes from shared redesign needs, migration requirements, and functionality that truly needs rebuilding.",
  },
  {
    title: "Plan content and migration",
    description:
      "Map navigation, pages, messages, existing URLs, redirects, assets, integrations, responsibilities, and launch criteria.",
  },
  {
    title: "Design and build",
    description:
      "Create the responsive system around real content, then develop the custom website and integrate the functionality it needs.",
  },
  {
    title: "Test, launch, and monitor",
    description:
      "Verify devices, accessibility, performance, forms, metadata, redirects, analytics, indexability, and production behavior.",
  },
] as const;

const faqs = [
  {
    question: "Does every outdated website need a complete rebuild?",
    answer:
      "No. A focused improvement may be enough when the platform, content structure, and core customer paths remain sound. Veriq evaluates whether problems are isolated, repeated, or architectural before recommending the scope.",
  },
  {
    question: "What happens to the current website during a redesign?",
    answer:
      "Veriq audits the current content, indexed URLs, analytics, forms, integrations, and working customer paths before planning the custom rebuild. Useful material can be preserved or migrated while outdated structure and technical constraints are replaced deliberately.",
  },
  {
    question: "Will the redesigned website be custom-built?",
    answer:
      "Yes. Veriq custom designs and develops the new website around the business, its customers, content, conversion path, and required functionality. Modern technology such as Next.js provides the technical foundation.",
  },
  {
    question: "Can the redesigned site include content editing?",
    answer:
      "Yes. A content management system can be integrated when the business needs to manage specific content after launch. Editing responsibilities, account ownership, and ongoing support are defined with the project.",
  },
  {
    question: "Will a redesign preserve current Google rankings?",
    answer:
      "No provider can guarantee unchanged rankings. Responsible redesign work can reduce avoidable risk by reviewing indexed URLs, page intent, redirects, metadata, canonicals, sitemaps, internal links, analytics, Search Console, and backlinks.",
  },
  {
    question: "How much does a website redesign cost?",
    answer:
      "Cost depends on the current site's condition, scope, content, design, migration, integrations, custom functionality, redirects, testing, and support. Veriq defines the work before providing a proposal.",
  },
] as const;

const redesignExample = projects.find((project) => project.slug === "mick-enev");

export const metadata = createPageMetadata({
  title: "Website Redesign Services for Growing Businesses",
  description:
    "Custom website redesign services for businesses that need clearer messaging, stronger mobile UX, better performance, useful functionality, and a responsible migration path.",
  path: "/website-redesign",
});

const canonicalUrl = siteConfig.url + "/website-redesign";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      "@id": canonicalUrl + "#service",
      name: "Website redesign services",
      serviceType: [
        "Website redesign",
        "Business website redesign",
        "Small business website redesign",
        "Website migration",
      ],
      description:
        "Website audit, strategy, content restructuring, custom responsive redesign, development, migration, launch, and ongoing support for businesses with an existing website.",
      url: canonicalUrl,
      provider: { "@id": siteConfig.url + "/#organization" },
      areaServed: [
        { "@type": "Country", name: siteConfig.location.country },
        {
          "@type": "City",
          name: siteConfig.location.city + ", " + siteConfig.location.region,
        },
      ],
    },
    {
      "@type": "BreadcrumbList",
      "@id": canonicalUrl + "#breadcrumbs",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
        {
          "@type": "ListItem",
          position: 2,
          name: "Website Redesign",
          item: canonicalUrl,
        },
      ],
    },
    {
      "@type": "FAQPage",
      "@id": canonicalUrl + "#faq",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    },
  ],
} as const;

export default function WebsiteRedesignPage() {
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
              <li><Link href="/">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li aria-current="page">Website redesign</li>
            </ol>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.heroCopy}>
              <p className={styles.kicker}>Website redesign services</p>
              <h1>A better website without losing what already works.</h1>
              <p className={styles.heroLead}>
                Veriq redesigns business websites that have become unclear,
                difficult to use, slow, hard to maintain, or outgrown by the
                business. The work starts with the current site: what to keep,
                what to improve, and what may need replacing.
              </p>
              <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryAction}>
                  Discuss your current site <span aria-hidden="true">↗</span>
                </Link>
                <Link href="#decision" className={styles.secondaryAction}>
                  See the redesign paths <span aria-hidden="true">↓</span>
                </Link>
              </div>
            </div>
            <aside className={styles.dossier} aria-label="Website redesign decision dossier">
              <div className={styles.dossierHeading}>
                <span>Current-site dossier</span>
                <i aria-hidden="true">WR / 03</i>
              </div>
              <dl>
                <div><dt>Starting point</dt><dd>An existing website with evidence worth reviewing</dd></div>
                <div><dt>Business gap</dt><dd>The site no longer supports current customers or goals</dd></div>
                <div><dt>Possible path</dt><dd>Improve, redesign, migrate, or rebuild selectively</dd></div>
                <div><dt>Migration rule</dt><dd>Preserve useful content, URLs, data, and working behavior</dd></div>
              </dl>
              <p>The scope follows the evidence—not a surface-level preference.</p>
            </aside>
          </div>
        </Container>
      </section>

      <section className={styles.signals}>
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>Why businesses redesign</p>
            <div>
              <h2>The site is holding back something the business now needs.</h2>
              <p>
                Age alone is not the test. A redesign becomes relevant when the
                gap between the current website and the current business creates
                repeated customer-facing, content, or technical problems.
              </p>
            </div>
          </div>
          <div className={styles.signalList}>
            {redesignSignals.map((signal, index) => (
              <article key={signal.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{signal.title}</h3>
                <p>{signal.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section id="decision" className={styles.decision}>
        <Container>
          <div className={styles.decisionHeader}>
            <p className={styles.sectionLabel}>Choose the intervention</p>
            <h2>Not every weak website needs the same kind of project.</h2>
          </div>
          <div className={styles.pathLedger}>
            {decisionPaths.map((item) => (
              <article key={item.path}>
                <h3>{item.path}</h3>
                <dl>
                  <div><dt>Use when</dt><dd>{item.condition}</dd></div>
                  <div><dt>Typical work</dt><dd>{item.work}</dd></div>
                </dl>
              </article>
            ))}
          </div>
          <Link href="/resources/website-redesign-vs-rebuild" className={styles.inlineLink}>
            Compare redesign, migration, and rebuild in detail <span aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>

      <section className={styles.audit}>
        <Container>
          <div className={styles.auditGrid}>
            <div className={styles.auditCopy}>
              <p className={styles.sectionLabel}>Before changing anything</p>
              <h2>Use the current site as evidence.</h2>
              <p>
                The audit identifies the business problem, the customer path,
                the technical constraints, and the assets worth preserving. It
                also prevents a visual preference from being mistaken for a
                complete redesign strategy.
              </p>
              <Link href="/resources/signs-your-website-is-outdated">
                Review the signs that a site is outdated <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <ol className={styles.auditList}>
              {auditAreas.map((area, index) => (
                <li key={area}><span>{String(index + 1).padStart(2, "0")}</span>{area}</li>
              ))}
            </ol>
          </div>
        </Container>
      </section>

      <section className={styles.workScope}>
        <Container>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionLabel}>What redesign can address</p>
            <div>
              <h2>Coordinate the parts customers experience as one website.</h2>
              <p>
                The scope should follow the audit. Some projects need only a few
                of these workstreams; others need them planned together because
                the failures repeat across the site.
              </p>
            </div>
          </div>
          <div className={styles.scopeGrid}>
            {redesignWork.map((item) => (
              <article key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.preservation}>
        <Container>
          <div className={styles.preservationGrid}>
            <div>
              <p className={styles.sectionLabel}>Responsible migration</p>
              <h2>A redesign should not casually erase useful equity.</h2>
              <p>
                Existing search visibility cannot be guaranteed through a
                redesign, but preventable migration mistakes can be reduced.
                Preserve what still serves the business and document deliberate
                changes before launch.
              </p>
              <Link href="/resources/why-isnt-my-business-website-showing-up-on-google">
                Review indexing and crawlability basics <span aria-hidden="true">↗</span>
              </Link>
            </div>
            <dl className={styles.preservationList}>
              {preservationItems.map(([term, description]) => (
                <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className={styles.rebuild}>
        <Container>
          <div className={styles.rebuildHeader}>
            <p className={styles.sectionLabel}>A deliberate custom rebuild</p>
            <h2>Preserve the value. Replace the constraints.</h2>
          </div>
          <div className={styles.rebuildRows}>
            <article>
              <h3>Protect useful equity</h3>
              <p>
                Carry forward accurate content, useful URLs, analytics context,
                working integrations, and recognizable brand elements when they
                still serve the business.
              </p>
            </article>
            <article>
              <h3>Rebuild around the business</h3>
              <p>
                Create a custom responsive design and develop it around the
                current message, customer journey, content, performance needs,
                and required editing model.
              </p>
            </article>
            <article>
              <h3>Make room for growth</h3>
              <p>
                Strengthen search foundations and add quoting, booking,
                ecommerce, lead capture, or other customer-facing functionality
                where it improves the journey.
              </p>
            </article>
          </div>
          <Link href="/small-business-web-design" className={styles.inlineLink}>
            Explore custom website design and development <span aria-hidden="true">↗</span>
          </Link>
        </Container>
      </section>

      <section className={styles.process}>
        <Container>
          <div className={styles.processHeader}>
            <p className={styles.sectionLabel}>Redesign process</p>
            <h2>Move from evidence to launch without losing the thread.</h2>
          </div>
          <ol className={styles.processList}>
            {processSteps.map((step, index) => (
              <li key={step.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{step.title}</h3><p>{step.description}</p></div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {redesignExample ? (
        <section className={styles.example}>
          <Container>
            <div className={styles.exampleGrid}>
              <Link href={"/work/" + redesignExample.slug} className={styles.exampleImage}>
                <Image
                  src={redesignExample.image}
                  alt={redesignExample.imageAlt}
                  fill
                  sizes="(max-width: 760px) 100vw, 55vw"
                />
              </Link>
              <div>
                <p className={styles.sectionLabel}>Relevant work</p>
                <h2>A portfolio modernization grounded in performance and presentation.</h2>
                <p>
                  This Veriq founder project replaced an outdated personal
                  portfolio with a clearer visual system, improved performance,
                  and a stronger way to present software work. It is not a
                  client case study or a promise of business results.
                </p>
                <Link href={"/work/" + redesignExample.slug}>
                  View the project details <span aria-hidden="true">↗</span>
                </Link>
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      <section className={styles.resources}>
        <Container>
          <div className={styles.resourcesHeader}>
            <p className={styles.sectionLabel}>Plan the right redesign</p>
            <h2>Diagnose the site before comparing solutions.</h2>
          </div>
          <div className={styles.resourceLinks}>
            <Link href="/resources/signs-your-website-is-outdated"><span>Signals</span><strong>Signs your website is outdated</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/website-redesign-vs-rebuild"><span>Scope</span><strong>Website redesign vs. rebuild</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/how-much-does-a-website-redesign-cost"><span>Cost</span><strong>How much does a website redesign cost?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/why-isnt-my-website-getting-leads"><span>Leads</span><strong>Why is your website not getting leads?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/why-is-my-website-slow"><span>Speed</span><strong>Why is your website slow?</strong><i aria-hidden="true">↗</i></Link>
            <Link href="/resources/website-looks-bad-on-mobile"><span>Mobile</span><strong>Why does your website look bad on mobile?</strong><i aria-hidden="true">↗</i></Link>
          </div>
          <div className={styles.serviceBridges}>
            <Link href="/small-business-web-design">Need a new small-business website instead? <span aria-hidden="true">↗</span></Link>
            <Link href="/des-moines-web-design">Looking for local web design in Des Moines? <span aria-hidden="true">↗</span></Link>
          </div>
        </Container>
      </section>

      <section className={styles.faq}>
        <Container>
          <div className={styles.faqGrid}>
            <div><p className={styles.sectionLabel}>Frequently asked questions</p><h2>What to know before changing the current site.</h2></div>
            <div className={styles.faqList}>
              {faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>{faq.question}<i aria-hidden="true">+</i></summary>
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
            <p>Bring the current website and the problems you are seeing.</p>
            <h2>Find the smallest redesign that solves the whole problem.</h2>
            <div className={styles.closingActions}>
              <Link href="/contact">Start a redesign conversation <span aria-hidden="true">↗</span></Link>
              <BookingLink placement="website_redesign_closing">Book a 20-minute call <span aria-hidden="true">↗</span></BookingLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
