/*
THESIS: Pricing is a clear project map, not a fixed-package checkout or a generic SaaS comparison table.
OWN-WORLD: Warm-white and graphite chapters, cyan signal color, heavy Geist headlines, fine rules, compact mono labels, and restrained rounded slabs.
STORY: A business owner sees the entry point, compares realistic scopes, understands what changes cost, confirms the fundamentals, resolves common questions, and starts a conversation.
FIRST VIEWPORT: A compact split hero pairs the direct pricing promise and two actions with a ruled $1,000 starting-point panel.
FORM: Brief-specified editorial pricing sequence in the established Veriq world; no concept seed was used because the structure and visual constraints were explicit.
*/

import Link from "next/link";
import FAQ from "@/components/sections/FAQ";
import BookingLink from "@/components/ui/BookingLink";
import Container from "@/components/ui/Container";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import { createPageMetadata } from "@/config/seo";
import { isWebsiteAuditDiscoverable } from "@/lib/website-audit/runtime-config";
import styles from "./pricing.module.css";

export const metadata = createPageMetadata({
  title: "Website Pricing",
  description:
    "Explore Veriq website pricing for small businesses. Custom website projects currently start at $1,000, with pricing based on your goals, scope, and functionality.",
  path: "/pricing",
});

const pricingGuides = [
  {
    id: "essential",
    label: "Essential",
    prefix: "Starting at",
    price: "$1,000",
    description:
      "For small businesses that need a focused, professional web presence.",
    features: [
      "Custom design",
      "1–3 core pages, depending on scope",
      "Mobile responsive",
      "Contact or lead form",
      "Basic on-page SEO setup",
      "Performance optimization",
      "Analytics setup",
      "Launch support",
    ],
    cta: "Start a Project",
    featured: false,
  },
  {
    id: "growth",
    label: "Growth",
    badge: "Recommended",
    prefix: "Starting at",
    price: "$2,500",
    description:
      "For businesses that need a larger website built around generating and converting leads.",
    features: [
      "Everything in Essential",
      "Expanded multi-page site",
      "More advanced page layouts",
      "Service-specific pages",
      "Conversion-focused structure",
      "Enhanced SEO foundations",
      "Additional forms or lead flows",
      "Content organization",
      "Analytics and tracking setup",
    ],
    cta: "Start a Project",
    featured: true,
  },
  {
    id: "custom",
    label: "Custom",
    prefix: "Built for the requirement",
    price: "Custom quote",
    description:
      "For businesses that need custom functionality, integrations, or more complex web applications.",
    features: [
      "Customer portals",
      "Authentication and login systems",
      "Online ordering",
      "Custom forms and workflows",
      "Third-party integrations",
      "Database-backed functionality",
      "Internal tools",
      "Unique business requirements",
    ],
    cta: "Tell Us About Your Project",
    featured: false,
  },
] as const;

const priceFactors = [
  {
    title: "Pages and structure",
    description:
      "More pages, page types, and navigation decisions add planning, design, development, and review time.",
  },
  {
    title: "Design complexity",
    description:
      "A focused brochure site and a highly art-directed website require different levels of exploration and production.",
  },
  {
    title: "Copy and content",
    description:
      "The amount of writing, editing, content organization, and media preparation can meaningfully change the scope.",
  },
  {
    title: "Forms and lead flows",
    description:
      "Simple contact forms take less work than conditional forms, quote tools, scheduling, or multi-step inquiries.",
  },
  {
    title: "Integrations and functionality",
    description:
      "Logins, portals, ordering, databases, and third-party systems require additional planning, development, and testing.",
  },
  {
    title: "SEO scope",
    description:
      "Technical foundations are included. Deeper research, local strategy, and expanded service content are scoped to the project.",
  },
] as const;

const includedFundamentals = [
  "Responsive development",
  "Custom design tailored to the business",
  "Performance-conscious implementation",
  "Basic SEO foundations",
  "Analytics setup",
  "Contact and lead capture",
  "Launch assistance",
  "Ongoing support options",
] as const;

const pricingFaqs = [
  {
    question: "Is $1,000 the total price of every website?",
    answer:
      "No. $1,000 is the current starting point for smaller website projects. Final pricing depends on the size, functionality, content, and overall scope of the project.",
  },
  {
    question: "Do I have to choose a package?",
    answer:
      "No. These tiers are meant to give you a realistic idea of budget. We’ll recommend an approach based on what your business actually needs.",
  },
  {
    question: "Do you require a deposit?",
    answer:
      "Payment terms are outlined clearly in your project proposal before work begins.",
  },
  {
    question: "Do you offer monthly payment plans?",
    answer:
      "Payment structure depends on the scope of the project and will be outlined in your proposal.",
  },
  {
    question: "Can you work with an existing website?",
    answer:
      "Yes. Veriq can redesign or rebuild an existing site as well as create new websites from scratch.",
  },
  {
    question: "Do you offer ongoing support?",
    answer:
      "Yes. Ongoing updates and support can be discussed based on what your business needs after launch.",
  },
] as const;

export default function PricingPage() {
  const auditEnabled = isWebsiteAuditDiscoverable();

  return (
    <main id="main-content" className={styles.page}>
      <section className={styles.hero} aria-labelledby="pricing-title">
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>
                <span aria-hidden="true" />
                Website pricing
              </p>
              <h1 id="pricing-title">
                Straightforward pricing.
                <span>Built around your business.</span>
              </h1>
              <p className={styles.heroDescription}>
                Every website is different, but you shouldn’t have to contact
                an agency just to find out whether you’re even in the right
                price range. Veriq projects currently start at $1,000, with
                final pricing based on your scope, goals, and functionality.
              </p>
              <div className={styles.heroActions}>
                <Link href="/contact" className={styles.primaryLink}>
                  Start a Project <span aria-hidden="true">↗</span>
                </Link>
                <BookingLink
                  placement="pricing_hero"
                  className={styles.secondaryLink}
                >
                  Book a Call <span aria-hidden="true">↗</span>
                </BookingLink>
              </div>
            </div>

            <aside
              className={styles.startingPoint}
              aria-label="Current project starting point"
            >
              <p>Current starting point</p>
              <strong>$1,000</strong>
              <span>Custom design and development, scoped to the business.</span>
              <div>
                <Link href="/services">Explore services</Link>
                <Link href="/work">View the work</Link>
              </div>
            </aside>
          </div>
        </Container>
      </section>

      <section className={styles.pricing} aria-labelledby="pricing-guides-title">
        <Container>
          <header className={styles.sectionHeader}>
            <div>
              <p className={styles.sectionLabel}>Project starting points</p>
              <h2 id="pricing-guides-title">A useful range before we talk.</h2>
            </div>
            <p>
              Use these guides to find the closest fit. The final recommendation
              is based on the work your business actually needs.
            </p>
          </header>

          <div className={styles.pricingGrid}>
            {pricingGuides.map((guide) => (
              <article
                className={`${styles.priceCard}${guide.featured ? ` ${styles.featuredCard}` : ""}`}
                key={guide.id}
                aria-labelledby={`${guide.id}-title`}
              >
                <header className={styles.cardHeader}>
                  <div className={styles.cardLabelRow}>
                    <h3 id={`${guide.id}-title`}>{guide.label}</h3>
                    {"badge" in guide ? <span>{guide.badge}</span> : null}
                  </div>
                  <div className={styles.price}>
                    <small>{guide.prefix}</small>
                    <strong>{guide.price}</strong>
                  </div>
                  <p className={styles.cardDescription}>{guide.description}</p>
                </header>

                <ul aria-label={`${guide.label} project examples`}>
                  {guide.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>

                <Link href="/contact" className={styles.cardCta}>
                  {guide.cta} <span aria-hidden="true">↗</span>
                </Link>
              </article>
            ))}
          </div>

          <aside className={styles.pricingNote} aria-label="Pricing clarification">
            <span>Important context</span>
            <p>
              Every project is different. Pricing above represents starting
              points, not fixed package prices. After learning about your
              business and what you need, we’ll provide a clear project quote
              before work begins.
            </p>
          </aside>
        </Container>
      </section>

      <section className={styles.factors} aria-labelledby="price-factors-title">
        <Container>
          <div className={styles.factorIntro}>
            <div>
              <p className={styles.sectionLabel}>What affects price</p>
              <h2 id="price-factors-title">
                What determines the cost of a website?
              </h2>
            </div>
            <p>
              Two businesses can both need a new website and still need very
              different amounts of work. These are the biggest factors that
              affect project pricing.
            </p>
          </div>

          <div className={styles.factorGrid}>
            {priceFactors.map((factor) => (
              <article key={factor.title}>
                <h3>{factor.title}</h3>
                <p>{factor.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.included} aria-labelledby="included-title">
        <Container>
          <div className={styles.includedLayout}>
            <div className={styles.includedIntro}>
              <p className={styles.sectionLabel}>Every Veriq website</p>
              <h2 id="included-title">The fundamentals aren’t add-ons.</h2>
              <p>
                Every Veriq site is built to be fast, usable, easy to find,
                and designed around the business it represents.
              </p>
              <div className={styles.contextLinks}>
                <Link href="/services">See how Veriq works</Link>
                <Link href="/work">Review selected work</Link>
                {auditEnabled ? (
                  <WebsiteAuditLink placement="pricing_included">
                    Audit your current website
                  </WebsiteAuditLink>
                ) : null}
              </div>
            </div>

            <ul className={styles.includedList}>
              {includedFundamentals.map((item) => (
                <li key={item}>
                  <span aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className={styles.faqSection} aria-label="Pricing FAQ">
        <Container>
          <FAQ
            items={pricingFaqs}
            label="Pricing questions"
            title="Clear answers before a proposal."
            description="The proposal defines the exact scope, price, payment structure, and responsibilities before work begins."
            contactLabel="Ask about your project"
            questionsName="pricing-faq"
            showLabelLine
          />
        </Container>
      </section>

      <section className={styles.closing} aria-labelledby="pricing-closing-title">
        <Container>
          <div className={styles.closingInner}>
            <p>Need help placing your project?</p>
            <div>
              <h2 id="pricing-closing-title">Not sure where your project fits?</h2>
              <p className={styles.closingCopy}>
                Tell us what you’re trying to build. We’ll help you figure out
                the right scope and give you a clear quote.
              </p>
            </div>
            <div className={styles.closingActions}>
              <Link href="/contact" className={styles.closingPrimary}>
                Start a Project <span aria-hidden="true">↗</span>
              </Link>
              <BookingLink
                placement="pricing_closing"
                className={styles.closingSecondary}
              >
                Book a Call <span aria-hidden="true">↗</span>
              </BookingLink>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
