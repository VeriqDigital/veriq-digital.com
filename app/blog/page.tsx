/*
THESIS: A durable knowledge hub organized by Veriq's expertise, not by a temporary SEO cluster or generic card wall.
OWN-WORLD: Veriq's light/dark surfaces, cyan linework, condensed headings, and crisp editorial rules.
STORY: Readers choose an expertise area, find a practical answer, and move naturally toward a service decision.
FIRST VIEWPORT: The established editorial masthead leads into a restrained topic index and subject-led article sections.
FORM: A scalable topic directory using Veriq's asymmetrical article rows, anchor navigation, and restrained service CTA.
*/
import Link from "next/link";
import Container from "@/components/ui/Container";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { resources, resourceTopics } from "@/data/resources";
import styles from "../resources/resources.module.css";

export const metadata = createPageMetadata({
  title: "Website, SEO & Digital Presence Blog",
  description:
    "Practical guidance from Veriq Digital for planning better websites, improving search visibility and user experience, and building a credible digital presence.",
  path: "/blog",
});

const publishedTopicSections = resourceTopics
  .map((topic) => ({
    ...topic,
    articles: resources.filter((resource) => resource.topic === topic.name),
  }))
  .filter((section) => section.articles.length > 0);

const indexedResources = publishedTopicSections.flatMap(
  (section) => section.articles,
);

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "CollectionPage",
      "@id": `${siteConfig.url}/blog#collection`,
      name: "Veriq Digital blog",
      description:
        "Practical guidance on website planning, search visibility, user experience, technical foundations, and digital presence from Veriq Digital.",
      url: `${siteConfig.url}/blog`,
      inLanguage: "en-US",
      isPartOf: { "@id": `${siteConfig.url}/#website` },
      mainEntity: {
        "@type": "ItemList",
        itemListElement: indexedResources.map((resource, index) => ({
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
              Clear thinking for planning better websites, improving search
              visibility and user experience, and making sound technical and
              digital-presence decisions.
            </p>
          </div>
        </Container>
      </header>

      {publishedTopicSections.length > 1 ? (
        <nav className={styles.topicNav} aria-label="Blog topics">
          <Container>
            <ul className={styles.topicNavList}>
              <li>
                <Link href="#all-articles">All articles</Link>
              </li>
              {publishedTopicSections.map((section) => (
                <li key={section.id}>
                  <Link href={`#${section.id}`}>{section.shortName}</Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      ) : null}

      <div id="all-articles" className={styles.categorySections}>
        {publishedTopicSections.map((section) => (
          <section
            id={section.id}
            key={section.id}
            className={styles.categorySection}
            aria-labelledby={`${section.id}-title`}
          >
            <Container>
              <div className={styles.categoryHeader}>
                <h2 id={`${section.id}-title`}>{section.name}</h2>
                <p>{section.description}</p>
              </div>

              <div className={styles.resourceList}>
                {section.articles.map((resource, index) => (
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
        ))}
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
