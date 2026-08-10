/*
THESIS: A working field guide, not an SEO archive or generic card wall.
OWN-WORLD: Veriq's light/dark surfaces, cyan linework, condensed headings, and crisp editorial rules.
STORY: Readers choose a real business question, get a useful answer, and move naturally toward a buying decision.
FIRST VIEWPORT: A compact editorial masthead leads directly into two clearly labeled paths: buying guidance and website fundamentals.
FORM: An established-world Read-mode extension with asymmetrical article rows and no separate visual identity.
*/
import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { resources, type ResourceCategory } from "@/data/resources";
import styles from "./resources.module.css";

export const metadata = createPageMetadata({
  title: "Website Guides for Local Businesses",
  description:
    "Practical guides on website planning, pricing, provider selection, local search, usability, and conversion for Des Moines and Central Iowa businesses.",
  path: "/resources",
});

const categories: readonly ResourceCategory[] = [
  "Buying guide",
  "Website fundamentals",
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/resources#collection`,
      name: "Website guides for local businesses",
      description:
        "Practical website planning, buying, usability, and search guidance from Veriq Digital.",
      url: `${siteConfig.url}/resources`,
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
          name: "Resources",
          item: `${siteConfig.url}/resources`,
        },
      ],
    },
  ],
} as const;

export default function ResourcesPage() {
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
              <p className={styles.kicker}>Veriq field notes</p>
              <h1>Clear answers for better website decisions.</h1>
            </div>
            <p>
              Practical guidance for local businesses planning, evaluating, or
              improving a website. No invented benchmarks, ranking promises, or
              filler.
            </p>
          </div>
        </Container>
      </header>

      <div className={styles.categorySections}>
        {categories.map((category) => {
          const categoryResources = resources.filter(
            (resource) => resource.category === category,
          );

          return (
            <section key={category} className={styles.categorySection}>
              <Container>
                <div className={styles.categoryHeader}>
                  <h2>{category === "Buying guide" ? "Plan the project" : "Build the foundation"}</h2>
                  <p>
                    {category === "Buying guide"
                      ? "Cost, provider fit, and the decisions to make before signing a proposal."
                      : "Useful explanations for the website questions local business owners actually face."}
                  </p>
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
            <p>Looking for the service, not another guide?</p>
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
