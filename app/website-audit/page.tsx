/*
THESIS: Turn a technical website audit into a clear triage order for a business owner, refusing a dense developer dashboard.
OWN-WORLD: Veriq's light/dark surfaces, cyan signals, condensed headings, mono measurement labels, fine rules, and restrained panels.
STORY: A visitor enters a URL, sees the honest demo boundary, understands six areas of site health, explores prioritized sample findings, and can ask Veriq for help.
FIRST VIEWPORT: Direct audit copy and the URL form occupy the left; a compact sample scorecard proves the result format on the right.
FORM: A prioritized triage board, fourth in the grounded structure list, moving from overall health to category evidence and an action queue; seed e38a36de.
*/
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import AuditForm from "@/components/website-audit/AuditForm";
import AuditPreview from "@/components/website-audit/AuditPreview";
import AuditResults from "@/components/website-audit/AuditResults";
import { demoAuditResult } from "@/components/website-audit/demo-audit";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "@/components/website-audit/website-audit.module.css";

const auditCategories = [
  {
    label: "Search visibility",
    description:
      "Whether search engines can discover, understand, and index the pages that matter.",
  },
  {
    label: "Performance",
    description:
      "How quickly useful content appears and whether the experience stays stable as it loads.",
  },
  {
    label: "Mobile experience",
    description:
      "How comfortably visitors can read, navigate, and take action on smaller screens.",
  },
  {
    label: "Accessibility",
    description:
      "Whether structure, contrast, forms, and controls work for a wider range of people.",
  },
  {
    label: "Conversion / UX",
    description:
      "How clearly the site explains the offer, builds confidence, and guides the next step.",
  },
  {
    label: "Technical health",
    description:
      "The crawl, security, metadata, link, and page foundations that keep a site dependable.",
  },
] as const;

const processSteps = [
  {
    title: "Enter your website",
    description: "Share the public URL you want Veriq to analyze.",
  },
  {
    title: "We analyze the essentials",
    description:
      "The future audit engine will evaluate the signals that affect visibility, usability, performance, and customer action.",
  },
  {
    title: "Get a clear action order",
    description:
      "See what is working, what needs attention, and which fixes should come first.",
  },
] as const;

export const metadata = createPageMetadata({
  title: "Free Website Audit for Growing Businesses",
  description:
    "Explore Veriq's free website audit experience for SEO, performance, mobile usability, accessibility, conversion UX, and technical health.",
  path: "/website-audit",
});

const canonicalUrl = `${siteConfig.url}/website-audit`;
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${canonicalUrl}#webpage`,
  url: canonicalUrl,
  name: "Free Website Audit for Growing Businesses",
  description:
    "A Veriq website audit experience covering search visibility, performance, mobile usability, accessibility, conversion UX, and technical health.",
  isPartOf: { "@id": `${siteConfig.url}/#website` },
  about: auditCategories.map((category) => category.label),
  inLanguage: "en-US",
};

export default function WebsiteAuditPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <main id="main-content" className={styles.page}>
        <section className={styles.hero} aria-labelledby="audit-title">
          <Container>
            <div className={styles.heroGrid}>
              <div className={styles.heroCopy}>
                <p className={styles.heroEyebrow}>
                  <span aria-hidden="true" />
                  Free website audit
                </p>
                <h1 id="audit-title">How good is your website, really?</h1>
                <p className={styles.heroDescription}>
                  Get a clear website audit covering SEO, performance, mobile
                  usability, accessibility, technical health, and opportunities
                  to turn more visitors into customers.
                </p>
                <AuditForm />
              </div>
              <AuditPreview result={demoAuditResult} />
            </div>
          </Container>
        </section>

        <section className={styles.checksSection} aria-labelledby="checks-title">
          <Container>
            <div className={styles.sectionIntro}>
              <p>What we check</p>
              <h2 id="checks-title">Six parts of one customer experience.</h2>
              <p>
                A website can look polished and still be difficult to find,
                slow to use, or unclear about what a customer should do next.
                The audit keeps those connected problems in one view.
              </p>
            </div>
            <dl className={styles.checkList}>
              {auditCategories.map((category) => (
                <div key={category.label}>
                  <dt>{category.label}</dt>
                  <dd>{category.description}</dd>
                </div>
              ))}
            </dl>
          </Container>
        </section>

        <section className={styles.processSection} aria-labelledby="process-title">
          <Container>
            <div className={styles.processLayout}>
              <div className={styles.sectionIntro}>
                <p>How it works</p>
                <h2 id="process-title">From a URL to a useful next step.</h2>
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
            </div>
          </Container>
        </section>

        <section
          className={styles.resultsSection}
          id="sample-audit-results"
          aria-label="Sample website audit results"
        >
          <Container>
            <AuditResults result={demoAuditResult} />
          </Container>
        </section>

        <section className={styles.serviceCta} aria-labelledby="service-cta-title">
          <Container>
            <div className={styles.serviceCtaInner}>
              <div>
                <p>Need help with the fixes?</p>
                <h2 id="service-cta-title">Want Veriq to improve the site with you?</h2>
              </div>
              <div>
                <p>
                  Veriq designs and develops high-quality websites for businesses
                  that need stronger performance, usability, search foundations,
                  and conversion paths — built around how the business actually works.
                </p>
                <BookingLink placement="website_audit_closing" className={styles.serviceCtaLink}>
                  Book a {siteConfig.booking.durationMinutes}-minute intro call
                  <span aria-hidden="true">↗</span>
                </BookingLink>
              </div>
            </div>
          </Container>
        </section>
      </main>
    </>
  );
}

