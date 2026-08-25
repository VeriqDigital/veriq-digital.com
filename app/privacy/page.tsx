import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import { getWebsiteAuditRuntimeConfig } from "@/lib/website-audit/runtime-config";
import styles from "./privacy.module.css";

export const metadata = createPageMetadata({
  title: "Privacy Policy",
  description:
    "How Veriq collects, uses, shares, and retains information submitted through this website.",
  path: "/privacy",
});

export default function PrivacyPage() {
  const auditRetentionDays = getWebsiteAuditRuntimeConfig().retentionDays;

  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <header className={styles.header}>
          <p>Privacy at Veriq</p>
          <h1>Privacy policy.</h1>
          <p>Effective August 24, 2026</p>
        </header>

        <div className={styles.content}>
          <section>
            <h2>Information we collect</h2>
            <p>
              We collect information you choose to submit through contact and
              inquiry forms, such as your name, email, phone number when provided,
              business or company information, website, project information or
              message, campaign or source information, and other information you
              intentionally provide. Our hosting and analytics providers may also
              process limited technical information needed to operate, secure,
              and understand use of the site.
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
            <h2>Analytics and advertising measurement</h2>
            <p>
              We use analytics and performance services to understand website
              activity and may use Meta Pixel to measure advertising
              effectiveness. Depending on the service and interaction, these
              providers may receive technical usage information such as browser
              or device details, pages viewed, interactions or events, and
              referring information where available.
            </p>
            <p>
              Individual website-audit report URLs and opaque report IDs are
              intentionally excluded from Meta Pixel. Other analytics and
              performance measurements replace individual report paths with a
              generic report route and remove query strings and fragments before
              an event is sent.
            </p>
          </section>

          <section>
            <h2>Inquiry and lead management</h2>
            <p>
              Contact submissions start a conversation with Veriq. We use Resend
              for transactional email and, when configured, may also use a private
              lead or customer relationship management system to store and manage
              inquiries. The information processed may include the form details
              described above, including campaign or source information when it
              accompanies a submission.
            </p>
            <p>
              Contact-form submitters are not added to a marketing list solely
              because they sent an inquiry, and website-audit report recipients
              are not added to a mailing list.
            </p>
          </section>

          <section>
            <h2>How information is used</h2>
            <p>
              We use submitted information to respond to requests, deliver the
              services you ask for, protect the site from abuse, troubleshoot
              failures, and improve site performance. We do not sell personal
              information.
            </p>
          </section>

          <section>
            <h2>Service providers and retention</h2>
            <p>
              We use service providers such as Vercel for hosting and private audit
              storage, Google for PageSpeed Insights, and Resend for transactional
              email. Analytics, advertising measurement, and optional private lead
              management providers may also process information for the purposes
              described above. These providers process information under their own
              terms. Contact and project correspondence may be retained as
              reasonably necessary for the relationship, legal obligations, and
              security.
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
