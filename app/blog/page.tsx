/*
THESIS: A practical field guide, not an SEO archive or generic card wall.
OWN-WORLD: Veriq's light/dark surfaces, cyan linework, condensed headings, and crisp editorial rules.
STORY: Readers choose a real business question, get a useful answer, and move naturally toward a service decision.
FIRST VIEWPORT: A compact editorial masthead leads directly into clearly labeled paths for planning and improving a website.
FORM: An established-world Read-mode extension using the site's asymmetrical article rows and restrained service CTA.
*/
import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { resources, type ResourceCategory } from "@/data/resources";
import styles from "../resources/resources.module.css";

export const metadata = createPageMetadata({
  title: "Website, SEO & Digital Presence Blog",
  description:
    "Practical guidance from Veriq Digital on websites, web design, SEO, local search, digital presence, and choosing the right approach for your business.",
  path: "/blog",
});

const blogSections: readonly {
  category: ResourceCategory;
  heading: string;
  description: string;
}[] = [
  {
    category: "Buying guide",
    heading: "Plan the project",
    description:
      "Cost, provider fit, and the decisions to make before signing a proposal.",
  },
  {
    category: "Website fundamentals",
    heading: "Build the foundation",
    description:
      "Useful explanations for the website and search questions local business owners actually face.",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/blog#collection`,
      name: "Veriq Digital blog",
      description:
        "Practical guidance on websites, web design, SEO, local search, and digital presence from Veriq Digital.",
      url: `${siteConfig.url}/blog`,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: resources.map((resource, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: resource.title,
          url: `${siteConfig.url}/resources/${resource.slug}`,
        })),
      },
    },
    {
      "@type": "BreadcrumbList",
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
          name: "Blog",
          item: `${siteConfig.url}/blog`,
        },
      ],
    },
  ],
} as const;

export default function BlogPage() {
  return (
    <main id="main-content" className={styles.page}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <header className={styles.indexHero}>
        <Container>
          <div className={styles.indexHeroInner}>
            <div>
              <p className={styles.kicker}>Veriq blog</p>
              <h1>Practical guidance for a stronger digital presence.</h1>
            </div>
            <p>
              Clear, useful guidance on website planning, web design, SEO,
              local search, and the digital decisions growing businesses face.
            </p>
          </div>
        </Container>
      </header>

      <div className={styles.categorySections}>
        {blogSections.map((section) => {
          const categoryResources = resources.filter(
            (resource) => resource.category === section.category,
          );

          return (
            <section key={section.category} className={styles.categorySection}>
              <Container>
                <div className={styles.categoryHeader}>
                  <h2>{section.heading}</h2>
                  <p>{section.description}</p>
                </div>

                <div className={styles.resourceList}>
                  {categoryResources.map((resource, index) => (
                    <Link
                      href={`/resources/${resource.slug}`}
                      key={resource.slug}
                      className={styles.resourceRow}
                    >
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <h3>{resource.title}</h3>
                        <p>{resource.description}</p>
                      </div>
                      <i aria-hidden="true">↗</i>
                    </Link>
                  ))}
                </div>
              </Container>
            </section>
          );
        })}
      </div>

      <section className={styles.indexCta}>
        <Container>
          <div>
            <p>Ready to turn the research into a stronger website?</p>
            <h2>See how Veriq approaches websites for Des Moines businesses.</h2>
            <Link href="/des-moines-web-design">
              Explore Des Moines web design <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
