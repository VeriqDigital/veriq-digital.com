import Link from "next/link";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import Section from "@/components/ui/Section";
import WorksSection from "@/components/sections/WorksSection";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "./web-design.module.css";

export const metadata = createPageMetadata({
  title: "Des Moines Web Design for Growing Businesses",
  description: "Custom website design and development for Des Moines businesses that want to improve visibility, credibility, conversions, and long-term growth.",
  path: "/web-design",
});

const included = [
  ["Positioning and site structure", "Clarify the offer and organize information around what customers need to decide."],
  ["Responsive custom design", "Create a distinctive experience that works naturally across screen sizes."],
  ["Development and CMS setup", "Build a fast, maintainable site and make routine content manageable."],
  ["Performance and accessibility", "Reduce friction with thoughtful code, fast pages, and inclusive interaction patterns."],
  ["Local SEO foundations", "Set up crawlable architecture, metadata, structured data, and location context."],
  ["Analytics and conversion tracking", "Measure meaningful actions so future decisions have evidence behind them."],
  ["Contact, quote, or booking flows", "Make the next step clear and collect the information your team actually needs."],
  ["Launch and ongoing support", "Test the transition, monitor the site, and keep improving after it goes live."],
] as const;

const process = [
  ["Discover", "Understand the business, customers, current site, and the most important constraint."],
  ["Prioritize", "Agree on the site structure, content needs, functionality, and clearest conversion path."],
  ["Design", "Shape a custom visual and content system through focused review and refinement."],
  ["Develop", "Build, test, and prepare the site for search engines, analytics, and launch."],
  ["Launch and improve", "Deploy carefully, watch what happens, and support the site as needs change."],
] as const;

const faqs = [
  ["How much does a custom website cost?", "Scope depends on strategy, content, integrations, page count, and functionality. Every engagement starts with a conversation, followed by a clear proposal for the work your business actually needs."],
  ["How long does a website project take?", "Most business websites take roughly two to six weeks. Content readiness, feedback timing, and custom functionality can change the schedule, so the timeline is defined before work begins."],
  ["Do you redesign existing websites?", "Yes. We can improve an existing site when its foundation is sound or rebuild it when the current structure, technology, or content is holding the business back."],
  ["Can you help with website copy?", "Yes. Content structure and messaging are part of website strategy. We can help shape, edit, and organize copy, with the exact level of writing support defined in the proposal."],
  ["Will the website rank on Google?", "The site will be built with strong technical and local SEO foundations, but no responsible provider can guarantee rankings. Visibility also depends on competition, useful content, your Google Business Profile, reviews, links, and continued improvement."],
  ["Do you provide hosting and maintenance?", "Yes. Ongoing support can include hosting, monitoring, maintenance, content updates, performance work, analytics, and iterative improvements after launch."],
  ["Can you work with businesses outside Des Moines?", "Yes. Veriq is based in Des Moines and works with businesses across Central Iowa, but the process also works well with remote clients outside Iowa."],
  ["Who owns the website after launch?", "You own the custom website and business content produced for the project once the agreed invoices are paid. Any third-party services or licensed assets are documented clearly."],
] as const;

const structuredData = [
  {
    "@context": "https://schema.org", "@type": "Service", "@id": `${siteConfig.url}/web-design/#service`,
    name: "Des Moines Web Design and Development", serviceType: "Custom website design and development",
    description: "Website strategy, custom design, development, local SEO foundations, conversion tracking, launch, and ongoing support for growing businesses.",
    url: `${siteConfig.url}/web-design`, provider: { "@id": `${siteConfig.url}/#organization` },
    areaServed: { "@type": "City", name: "Des Moines", containedInPlace: { "@type": "State", name: "Iowa" } },
  },
  {
    "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      { "@type": "ListItem", position: 2, name: "Web Design", item: `${siteConfig.url}/web-design` },
    ],
  },
  {
    "@context": "https://schema.org", "@type": "FAQPage",
    mainEntity: faqs.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
  },
] as const;

export default function WebDesignPage() {
  return <main>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />

    <section className={styles.hero}><Container><div className={styles.heroGrid}>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>Web Design in Des Moines, Iowa</p>
        <h1>Des Moines web design built to earn attention, trust, and action.</h1>
        <p>Strategy, custom design and development, local SEO foundations, focused conversion paths, and support after launch—all shaped around what the business needs the website to do.</p>
        <div className={styles.heroActions}><Button href="/contact">Start a conversation</Button><Button href="/work" variant="secondary">See website examples</Button></div>
      </div>
      <div className={styles.heroVisual} aria-hidden="true"><span className={styles.browserFrame}><i /><i /><i /><strong>Clear message</strong><em>Useful next step</em></span><span className={styles.heroOrbit} /><span className={styles.heroNode} /></div>
    </div></Container></section>

    <section className="py-16 md:py-24"><Container><div className="grid items-center gap-12 md:grid-cols-[0.8fr_1.2fr]">
      <div><p className="text-sm font-bold uppercase tracking-[0.28em] text-(--primary)">What the site should accomplish</p><h2 className="mt-4 font-heading text-4xl font-black uppercase md:text-6xl">A website should help the business move forward.</h2></div>
      <div><p className="max-w-2xl text-lg leading-8 text-(--muted)">The structure, writing, performance, search setup, and inquiry flow need to work together. Every Veriq website begins with what customers need to understand and what the business needs them to do next.</p><ul className={styles.websiteChecklist}>{["Explain the business clearly", "Establish credibility", "Make the next step obvious", "Work well on every device", "Support local discovery", "Measure meaningful actions"].map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul></div>
    </div></Container></section>

    <section className="border-y border-black/10 py-20 dark:border-white/10 md:py-28"><Container>
      <p className="text-sm font-bold uppercase tracking-[0.28em] text-(--primary)">What is included</p><h2 className="mt-4 max-w-3xl font-heading text-4xl font-black uppercase md:text-6xl">From first decision to post-launch support.</h2>
      <div className={styles.includedGrid}>{included.map(([title, description]) => <article key={title}><h3>{title}</h3><p>{description}</p><span aria-hidden="true">↘</span></article>)}</div>
    </Container></section>

    <section className={styles.threeParts}><Container><div className={styles.partsHeader}><p>Three parts of a stronger website</p><h2>Clarity, experience, and visibility working together.</h2></div><div className={styles.partsGrid}>
      {[ ["01", "Clear Positioning", "Explain what the business does, who it helps, and why the offer is worth considering."], ["02", "Focused Experience", "Organize the content and interaction so visitors can find answers and take the next step without friction."], ["03", "Visibility and Conversion", "Support local discovery, measure meaningful actions, and give qualified visitors a clear route to contact, quote, or book."] ].map(([number, title, copy]) => <article key={number}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div></article>)}
    </div></Container></section>

    <section className="py-16 md:py-24"><Container><div className="grid gap-8 md:grid-cols-[0.45fr_1fr]"><div><p className="text-sm font-bold uppercase tracking-[0.28em] text-(--primary)">The process</p><h2 className="mt-4 font-heading text-4xl font-black uppercase md:text-5xl">Clear stages. Direct collaboration.</h2></div><ol className={styles.processList}>{process.map(([title, description], index) => <li key={title}><span>{String(index + 1).padStart(2, "0")}</span><div><h3>{title}</h3><p>{description}</p></div></li>)}</ol></div></Container></section>

    <Section><WorksSection /></Section>

    <section className="border-t border-black/10 py-20 dark:border-white/10 md:py-28"><Container><div className="grid gap-12 md:grid-cols-[0.7fr_1.3fr]"><div><p className="text-sm font-bold uppercase tracking-[0.28em] text-(--primary)">Frequently asked questions</p><h2 className="mt-4 font-heading text-4xl font-black uppercase md:text-6xl">The practical details.</h2></div><div className="divide-y divide-black/15 border-y border-black/15 dark:divide-white/15 dark:border-white/15">{faqs.map(([question, answer]) => <details className="group py-5" key={question}><summary className="cursor-pointer list-none pr-8 font-heading text-xl font-black uppercase marker:hidden">{question}<span className="float-right text-(--primary-hover) group-open:rotate-45">+</span></summary><p className="max-w-2xl pt-4 leading-7 text-(--muted)">{answer}</p></details>)}</div></div></Container></section>

    <section className="bg-(--primary) py-20 text-black md:py-28"><Container><div className="grid items-end gap-10 md:grid-cols-[1fr_auto]"><div><p className="text-sm font-bold uppercase tracking-[0.28em]">A stronger foundation</p><h2 className="mt-4 max-w-4xl font-heading text-4xl font-black uppercase md:text-6xl">Build a website your business can keep growing into.</h2><p className="mt-6 max-w-2xl leading-7">Tell us what the current site is preventing you from doing. We will help identify the clearest next step.</p></div><Link className="inline-flex rounded-md bg-black px-6 py-3 text-sm font-bold uppercase tracking-wide text-white" href="/contact">Discuss your website</Link></div><p className="mt-10 text-sm">Looking for custom software or broader support? <Link className="font-bold underline underline-offset-4" href="/services">Explore all services</Link>. Learn more about the <Link className="font-bold underline underline-offset-4" href="/about">founder-led studio</Link>.</p></Container></section>
  </main>;
}
