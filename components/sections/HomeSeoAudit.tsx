import Link from "next/link";
import Container from "@/components/ui/Container";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import { auditCategoryRegistry } from "@/lib/website-audit/categories";
import styles from "./HomepageSections.module.css";

const seoSignals = [
  "Site structure",
  "Performance",
  "Metadata",
  "Local search",
  "Google Business Profile",
  "Internal linking",
  "Indexability",
  "Search intent",
] as const;

export default function HomeSeoAudit({
  auditEnabled,
}: {
  auditEnabled: boolean;
}) {
  return (
    <>
      <section className={styles.seo} aria-labelledby="seo-title">
        <Container>
          <div className={styles.seoLayout}>
            <div>
              <h2 id="seo-title">SEO is the name of the game.</h2>
              <p className={styles.seoCopy}>
                Search visibility is shaped by how the site is planned, written,
                built, and maintained. Veriq considers the foundations early so
                SEO is not reduced to a plugin or a last-minute checklist. For
                local businesses, that can include Google Business Profile
                assistance so the website, business details, and profile support
                the same search strategy.
              </p>
              <div className={styles.inlineLinks}>
                <Link href="/blog#seo-digital-marketing">
                  Explore SEO resources <span aria-hidden="true">↗</span>
                </Link>
                {auditEnabled ? (
                  <WebsiteAuditLink placement="homepage_seo">
                    Audit your search foundations{" "}
                    <span aria-hidden="true">↗</span>
                  </WebsiteAuditLink>
                ) : null}
              </div>
            </div>

            <ul
              className={styles.seoSignals}
              aria-label="SEO foundations Veriq considers"
            >
              {seoSignals.map((signal) => (
                <li key={signal}>{signal}</li>
              ))}
            </ul>
          </div>

          <div
            className={styles.resourceRail}
            aria-label="Related website resources"
          >
            <Link href="/resources/why-isnt-my-business-website-showing-up-on-google">
              Why your website may not show up on Google{" "}
              <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/resources/why-is-my-website-slow">
              What makes a website slow <span aria-hidden="true">↗</span>
            </Link>
            <Link href="/resources/website-looks-bad-on-mobile">
              Why a website breaks down on mobile{" "}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </Container>
      </section>

      {auditEnabled ? (
        <section
          className={styles.audit}
          aria-labelledby="homepage-audit-title"
        >
          <Container>
            <div className={styles.auditPanel}>
              <div className={styles.auditCopy}>
                <p className={styles.kicker}>Free website audit</p>
                <h2 id="homepage-audit-title">
                  See what your website gets right and what may be holding it
                  back.
                </h2>
                <p>
                  Get a technical and strategic starting point across measurable
                  search, performance, mobile, accessibility, conversion, and
                  technical-health signals. The value is the action order, not a
                  magic score.
                </p>
                <WebsiteAuditLink
                  placement="homepage_audit"
                  className={styles.auditCta}
                >
                  Audit your website <span aria-hidden="true">↗</span>
                </WebsiteAuditLink>
              </div>

              <div className={styles.auditCategories}>
                <p>What the audit reviews</p>
                <ol>
                  {auditCategoryRegistry.map((category, index) => (
                    <li key={category.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{category.pageLabel}</strong>
                        <p>{category.description}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </>
  );
}
