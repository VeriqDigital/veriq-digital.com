import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ResourceAuthor from "@/components/resources/ResourceAuthor";
import Container from "@/components/ui/Container";
import articleStyles from "@/components/resources/resources.module.css";
import { createPageMetadata, serializeJsonLd } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { resourceAuthor } from "@/data/resource-author";
import {
  getRelatedResources,
  getResource,
  resources,
} from "@/data/resources";
import styles from "../resources.module.css";

type ResourcePageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export const generateStaticParams = () =>
  resources.map((resource) => ({ slug: resource.slug }));

export async function generateMetadata({
  params,
}: ResourcePageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = getResource(slug);

  if (!article) {
    return {};
  }

  return createPageMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `/resources/${article.slug}`,
    type: "article",
    publishedTime: article.publishedAt,
  });
}

export default async function ResourcePage({ params }: ResourcePageProps) {
  const { slug } = await params;
  const article = getResource(slug);

  if (!article) {
    notFound();
  }

  const relatedResources = getRelatedResources(article);
  const nextStepResource = article.nextStep.startsWith("/resources/")
    ? getResource(article.nextStep.replace("/resources/", ""))
    : undefined;
  const canonicalUrl = `${siteConfig.url}/resources/${article.slug}`;
  const ArticleContent = article.Content;
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${canonicalUrl}#article`,
        headline: article.title,
        description: article.description,
        datePublished: article.publishedAt,
        ...(article.dateModified
          ? { dateModified: article.dateModified }
          : {}),
        mainEntityOfPage: canonicalUrl,
        url: canonicalUrl,
        articleSection: article.category,
        inLanguage: "en-US",
        author: {
          "@type": "Person",
          "@id": resourceAuthor.id,
          name: resourceAuthor.name,
          url: resourceAuthor.url,
        },
        publisher: { "@id": `${siteConfig.url}/#organization` },
        image: `${siteConfig.url}/opengraph-image`,
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
            name: "Resources",
            item: `${siteConfig.url}/resources`,
          },
          {
            "@type": "ListItem",
            position: 3,
            name: article.title,
            item: canonicalUrl,
          },
        ],
      },
    ],
  } as const;

  return (
    <main id="main-content" className={styles.articlePage}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />

      <header className={styles.articleHero}>
        <Container>
          <nav aria-label="Breadcrumb" className={styles.breadcrumbs}>
            <ol>
              <li>
                <Link href="/">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/resources">Resources</Link>
              </li>
            </ol>
          </nav>

          <div className={styles.articleHeading}>
            <div>
              <p className={styles.articleCategory}>{article.category}</p>
              <h1>{article.title}</h1>
            </div>
            <div className={styles.articleSummary}>
              <p>{article.description}</p>
              <ResourceAuthor
                publishedAt={article.publishedAt}
                dateModified={article.dateModified}
              />
            </div>
          </div>
        </Container>
      </header>

      <section className={styles.articleLayout}>
        <Container>
          <div className={styles.articleGrid}>
            <aside className={styles.articleToc}>
              <p>In this guide</p>
              <ol>
                {article.tableOfContents.map((item) => (
                  <li key={item.id}>
                    <Link href={`#${item.id}`}>{item.label}</Link>
                  </li>
                ))}
              </ol>
            </aside>

            <article className={articleStyles.articleBody}>
              <ArticleContent />
            </article>
          </div>
        </Container>
      </section>

      <section className={styles.relatedSection} aria-labelledby="related-title">
        <Container>
          <div className={styles.sectionHeading}>
            <p>Keep reading</p>
            <h2 id="related-title">Related guides</h2>
          </div>
          <div className={styles.resourceGrid}>
            {relatedResources.map((resource) => (
              <Link
                key={resource.slug}
                href={`/resources/${resource.slug}`}
                className={styles.resourceCard}
              >
                <span>{resource.category}</span>
                <h3>{resource.shortTitle}</h3>
                <p>{resource.description}</p>
                <i aria-hidden="true">Read guide ↗</i>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      <section className={styles.articleCta}>
        <Container>
          <div className={styles.articleCtaInner}>
            <p>
              {article.nextStep === "/des-moines-web-design"
                ? "Planning a website project in Des Moines?"
                : "Continue with the next practical question"}
            </p>
            <h2>
              {article.nextStep === "/des-moines-web-design"
                ? "Turn the research into a clear, useful website."
                : nextStepResource?.title ?? "Keep building a clearer website plan."}
            </h2>
            <Link href={article.nextStep}>
              {article.nextStep === "/des-moines-web-design"
                ? "Explore Des Moines web design"
                : "Read the next guide"}{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
