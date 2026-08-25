import Container from "@/components/ui/Container";
import Link from "next/link";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import styles from "../privacy/privacy.module.css";

export const metadata = createPageMetadata({
  title: "Terms of Use",
  description:
    "Terms for using the Veriq website, resources, and automated website-audit tool.",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <main id="main-content" className={styles.page}>
      <Container>
        <header className={styles.header}>
          <p>Using the Veriq website</p>
          <h1>Terms of use.</h1>
          <p>Effective August 24, 2026</p>
        </header>

        <div className={styles.content}>
          <section>
            <h2>General information</h2>
            <p>
              The Veriq website, resources, articles, and automated tools provide
              general informational material. They are not legal, financial,
              security, accessibility-compliance, or other regulated professional
              advice. You should evaluate information in light of your own facts
              and consult an appropriate professional when needed.
            </p>
          </section>

          <section>
            <h2>Website audits</h2>
            <p>
              The Veriq website audit is an automated, point-in-time assessment of
              measurable technical and page signals available when a scan runs. It
              may contain errors, incomplete information, false positives, or
              false negatives. It does not inspect every page, state, device, user
              flow, accessibility condition, security issue, or search-ranking
              factor.
            </p>
            <p>
              An audit is not a certification, does not guarantee WCAG or ADA
              compliance or other legal compliance, and is not a security
              assessment or penetration test. It does not guarantee search
              rankings, traffic, leads, conversions, revenue, performance,
              availability, or any other business result. Recommendations should
              be evaluated in context before changes are made.
            </p>
          </section>

          <section>
            <h2>Authorized audit use</h2>
            <p>
              By submitting a URL, you represent that you are requesting analysis
              for a legitimate purpose and have the right or reasonable
              authorization to request analysis of that website. Do not use the
              audit service to intentionally disrupt systems, circumvent security
              controls, conduct unauthorized security testing, overload
              infrastructure, abuse rate limits, submit private, internal, or
              non-public systems, or use Veriq infrastructure for malicious or
              unlawful activity.
            </p>
          </section>

          <section>
            <h2>Audit report links</h2>
            <p>
              Audit reports use opaque, difficult-to-guess URLs, but they are not
              authenticated private documents. Anyone who has a report URL can
              view that report. Do not share a report URL with people you do not
              want viewing it. Reports expire according to Veriq&apos;s retention
              practices described in the <Link href="/privacy">Privacy Policy</Link>.
            </p>
          </section>

          <section>
            <h2>Third-party services</h2>
            <p>
              Parts of the website and its tools rely on third-party providers,
              platforms, data, and services. Their availability and behavior may
              change or be interrupted, and Veriq cannot guarantee that external
              systems will always be available or operate as expected.
            </p>
          </section>

          <section>
            <h2>Intellectual property</h2>
            <p>
              Veriq&apos;s website design, original written content, branding,
              software and tooling, graphics, and other original materials are
              owned by Veriq or used with permission and are protected by
              applicable intellectual-property laws. Third-party trademarks,
              content, services, and materials remain the property of their
              respective owners. These Terms do not claim ownership of client or
              third-party content.
            </p>
          </section>

          <section>
            <h2>No guarantees</h2>
            <p>
              Veriq does not guarantee SEO rankings, traffic, leads, conversions,
              revenue, uptime, accessibility compliance, legal compliance,
              security, or business outcomes through this website, its content,
              or its free tools.
            </p>
          </section>

          <section>
            <h2>Warranties and liability</h2>
            <p>
              The website, content, and free tools are provided on an
              &quot;as available&quot; basis. To the extent permitted by law, Veriq
              disclaims warranties concerning their accuracy, completeness,
              fitness for a particular purpose, availability, and uninterrupted
              operation. You are responsible for decisions made from information
              provided through the site.
            </p>
            <p>
              To the extent permitted by law, Veriq is not responsible for
              indirect, incidental, or consequential losses arising from use of,
              inability to use, or reliance on the website, free tools, or
              third-party services. Nothing in these Terms excludes liability that
              cannot lawfully be excluded.
            </p>
          </section>

          <section>
            <h2>Paid engagements</h2>
            <p>
              These website Terms do not replace a professionally drafted client
              agreement. Paid client projects are governed by the applicable
              proposal, project agreement, statement of work, or other written
              agreement where one exists.
            </p>
          </section>

          <section>
            <h2>Governing law</h2>
            <p>
              These website Terms are governed by the laws of the State of Iowa.
            </p>
          </section>

          <section>
            <h2>Changes and contact</h2>
            <p>
              Veriq may update these Terms as the website, services, or practices
              change. The effective date above will be revised when the Terms are
              updated. Questions may be sent to{" "}
              <a href={`mailto:${siteConfig.contact.email}`}>
                {siteConfig.contact.email}
              </a>
              .
            </p>
          </section>
        </div>
      </Container>
    </main>
  );
}
