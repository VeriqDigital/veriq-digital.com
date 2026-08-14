import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { getWebsiteAuditRuntimeConfig } from "@/lib/website-audit/runtime-config";
import styles from "./privacy.module.css";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Veriq Digital collects, uses, shares, and retains information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const auditRetentionDays = getWebsiteAuditRuntimeConfig().retentionDays;

  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <header className={styles.header}>
          <p>Privacy at Veriq Digital</p>
          <h1>Privacy policy.</h1>
          <p>Effective August 13, 2026</p>
        </header>

        <div className={styles.content}>
          <section>
            <h2>Information we collect</h2>
            <p>
              We collect information you choose to submit through contact and
              inquiry forms, such as your name, contact details, business
              information, project needs, and message. Our hosting and analytics
              providers may also process limited technical information needed to
              operate, secure, and understand use of the site.
            </p>
          </section>

          <section>
            <h2>Website audits</h2>
            <p>
              When you request a website audit, we store the submitted public URL,
              audit state, and generated results so the shareable report link works.
              The audit fetches the submitted page before checking robots.txt;
              robots rules are used to decide whether optional same-origin pages
              and links may be crawled. Google PageSpeed Insights may receive the
              validated public URL to produce mobile Lighthouse measurements.
            </p>
            <p>
              If you ask us to email the report, your name and email address are
              held only long enough to send that message through Resend. We retain
              only a keyed recipient hash, delivery status, timestamp, audit ID,
              and provider message ID as a delivery receipt. Audit records and
              receipts expire after {auditRetentionDays} days.
            </p>
          </section>

          <section>
            <h2>How information is used</h2>
            <p>
              We use submitted information to respond to requests, deliver the
              services you ask for, protect the site from abuse, troubleshoot
              failures, and improve site performance. We do not add website-audit
              recipients to a mailing list or sell personal information.
            </p>
          </section>

          <section>
            <h2>Service providers and retention</h2>
            <p>
              We use service providers such as Vercel for hosting and private audit
              storage, Google for PageSpeed Insights, and Resend for transactional
              email. They process information on our behalf under their own terms.
              Contact and project correspondence may be retained as reasonably
              necessary for the relationship, legal obligations, and security.
            </p>
          </section>

          <section>
            <h2>Your choices</h2>
            <p>
              You may ask what personal information we hold about you or request a
              correction or deletion, subject to applicable legal obligations.
              Contact us at <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>.
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
