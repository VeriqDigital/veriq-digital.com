import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import styles from "./services.module.css";

const serviceChapters = [
  {
    number: "01",
    id: "websites",
    title: "Websites and Conversion",
    statement: "Make it easier for the right customers to find you, trust you, and take action.",
    description: "Veriq plans, designs, and develops websites that clearly explain the business, present the offer professionally, and guide visitors toward a useful next step.",
    note: "A strong starting point when the current site is dated, unclear, difficult to find, or not producing useful inquiries.",
    capabilities: ["Business websites", "Landing pages", "Site strategy and structure", "Local SEO foundations", "Quote, contact, and booking flows", "Analytics and conversion tracking"],
    outcome: "A clear, credible website with a practical path from visit to inquiry.",
  },
  {
    number: "02",
    id: "operations",
    title: "Custom Software",
    statement: "Replace repetitive work and disconnected tools with software built around the workflow.",
    description: "When spreadsheets, manual handoffs, and generic platforms begin creating friction, Veriq can build focused tools around the way the business actually operates.",
    note: "Best for teams spending too much time copying information, working around rigid tools, or managing processes by hand.",
    capabilities: ["Customer and staff portals", "Quote and intake systems", "Dashboards and reporting", "Workflow automation", "Platform integrations", "Internal business tools"],
    outcome: "A focused tool that removes avoidable steps without adding unnecessary complexity.",
  },
  {
    number: "03",
    id: "support",
    title: "Ongoing Support",
    statement: "Keep the work current, fast, secure, and useful after launch.",
    description: "Websites and software need maintenance, measurement, and refinement. Veriq can continue supporting the work after launch without forcing the business into a large agency retainer.",
    note: "Useful when the business needs a dependable technical partner for practical updates and continued attention.",
    capabilities: ["Hosting and maintenance", "Content updates", "Performance monitoring", "Technical fixes", "Analytics review", "Ongoing design and development"],
    outcome: "Reliable support that keeps the original investment working as the business changes.",
  },
] as const;

const startingPoints = [
  { number: "01", problem: "Customers cannot find or trust the business", recommendation: "Website Design and Local Visibility", description: "Clarify the offer, strengthen credibility, and create a better path to an inquiry.", href: "/web-design", label: "View Web Design" },
  { number: "02", problem: "The team relies on repetitive manual work", recommendation: "Custom Software and Automation", description: "Map the workflow and identify where a focused tool can remove repeated steps.", href: "/contact", label: "Discuss the Workflow" },
  { number: "03", problem: "The current site or system needs continued attention", recommendation: "Ongoing Support", description: "Handle maintenance, fixes, content, measurement, and useful refinements over time.", href: "/contact", label: "Discuss Support" },
] as const;

const processSteps = [
  ["Discover", "Understand the business, the problem, and the people affected."],
  ["Prioritize", "Choose the clearest next step and define the work that matters."],
  ["Design", "Shape the structure, interface, and practical details together."],
  ["Build", "Develop and test the work with direct, focused feedback."],
  ["Launch and Improve", "Deploy carefully, measure what matters, and refine when useful."],
] as const;

export const metadata = createPageMetadata({
  title: "Websites, Custom Software & Digital Growth Services",
  description: "Explore Veriq services for attracting customers, improving operations, and supporting ongoing digital growth through websites, software, analytics, and optimization.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <Container>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span aria-hidden="true" />Services</p>
              <h1>Websites, software, and support <span>built around real business problems.</span></h1>
              <div className={styles.heroSummary}>
                <p>Veriq helps businesses improve how customers find them, how work moves through the company, and how their digital tools perform over time.</p>
                <div className={styles.heroActions}>
                  <Link href="/contact" className={styles.primaryLink}>Start a conversation <span aria-hidden="true">↗</span></Link>
                  <Link href="/web-design" className={styles.textLink}>Explore Web Design <span aria-hidden="true">→</span></Link>
                </div>
              </div>
            </div>

            <nav className={styles.serviceIndex} aria-label="Services on this page">
              <p>Service index</p>
              {serviceChapters.map((service) => (
                <Link href={`#${service.id}`} key={service.id}><span>{service.number}</span>{service.title}<i aria-hidden="true">↘</i></Link>
              ))}
            </nav>

            <div className={styles.heroGraphic} aria-hidden="true"><span className={styles.graphicOrbit} /><span className={styles.graphicCore} /><span className={styles.graphicNode} /></div>
          </div>
        </Container>
      </section>

      <div className={styles.chapters}>
        {serviceChapters.map((service, index) => (
          <section
            id={service.id}
            className={styles.chapter}
            data-number={service.number}
            key={service.id}
          >
            <Container>
              <div className={`${styles.chapterInner} ${index % 2 === 1 ? styles.chapterReverse : ""}`}>
                <div className={styles.chapterCopy}>
                  <p className={styles.chapterLabel}><span>{service.number}</span>{service.title}</p>
                  <h2>{service.statement}</h2>
                  <p className={styles.chapterDescription}>{service.description}</p>
                  <div className={styles.fitNote}><span>Good fit</span><p>{service.note}</p></div>
                  {index === 0 && (
                    <Link className={styles.featuredService} href="/web-design">
                      <span>Des Moines Web Design</span>
                      <p>Explore the complete website design and development service for local and remote businesses.</p>
                      <strong>View Web Design Service →</strong>
                    </Link>
                  )}
                </div>

                <aside className={`${styles.capabilityPanel} ${index === 1 ? styles.technicalPanel : ""} ${index === 2 ? styles.supportPanel : ""}`}>
                  <div className={styles.panelHeading}><span>Core capabilities</span><i aria-hidden="true">{service.number}</i></div>
                  <ol>{service.capabilities.map((capability, capabilityIndex) => <li key={capability}><span>{String(capabilityIndex + 1).padStart(2, "0")}</span>{capability}</li>)}</ol>
                  <p className={styles.panelOutcome}>{service.outcome}</p>
                  {index === 2 && <div className={styles.supportLoop} aria-hidden="true"><span>Monitor</span><i>→</i><span>Maintain</span><i>→</i><span>Refine</span></div>}
                </aside>
              </div>
            </Container>
          </section>
        ))}
      </div>

      <section className={styles.diagnostic}>
        <Container>
          <div className={styles.diagnosticHeader}><p className={styles.eyebrow}><span aria-hidden="true" />Where to start</p><h2>Start with the problem, not a package.</h2></div>
          <div className={styles.diagnosticGrid}>{startingPoints.map((item) => <article key={item.number}><span>{item.number}</span><h3>{item.problem}</h3><p>{item.description}</p><div><small>Recommended starting point</small><strong>{item.recommendation}</strong></div><Link href={item.href}>{item.label} →</Link></article>)}</div>
        </Container>
      </section>

      <section className={styles.process}>
        <Container>
          <div className={styles.processHeader}><p className={styles.eyebrow}><span aria-hidden="true" />How we work</p><h2>A compact process with direct collaboration.</h2></div>
          <ol className={styles.processList}>{processSteps.map(([title, description], index) => <li className={styles.processStep} key={title}><span className={styles.stepNumber}>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div>{index < processSteps.length - 1 && <span className={styles.processArrow} aria-hidden="true">→</span>}</li>)}</ol>
        </Container>
      </section>

      <section className={styles.closing}><Container><div className={styles.closingInner}><p>Not sure where to begin?</p><div><h2>Let&apos;s identify the right next step.</h2><p>Tell us what is creating friction. We will help determine whether the business needs a stronger website, a focused software tool, or ongoing support.</p></div><Link href="/contact" className={styles.closingLink}>Start a conversation <span aria-hidden="true">↗</span></Link></div></Container></section>
    </main>
  );
}
