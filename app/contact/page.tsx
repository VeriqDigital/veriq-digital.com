import Container from "@/components/ui/Container";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

export const metadata = createPageMetadata({
  title: "Contact",
  description:
    "Contact Veriq about web design, custom software, or ongoing digital support in Des Moines or remotely.",
  path: "/contact",
});

export default function ContactPage() {
  const phoneHref = `tel:${siteConfig.contact.phoneE164}`;

  return (
    <main className={styles.page}>
      <Container>
        <div className={styles.layout}>
          <section className={styles.intro} aria-labelledby="contact-title">
            <p className={styles.eyebrow}>
              <span aria-hidden="true" />
              Contact us
            </p>
            <h1 id="contact-title">
              Let&apos;s make <span>something useful.</span>
            </h1>
            <p className={styles.introCopy}>
              Tell us what you are building, fixing, or trying to improve. A
              rough idea is enough to start the conversation.
            </p>

            <div className={styles.contactDetails}>
              <div>
                <span>Email</span>
                <a href={`mailto:${siteConfig.contact.email}`}>
                  {siteConfig.contact.email}
                </a>
              </div>
              <div>
                <span>Phone</span>
                <a href={phoneHref}>{siteConfig.contact.phone}</a>
              </div>
              <div>
                <span>Response time</span>
                <p>Usually within one business day.</p>
              </div>
              <div>
                <span>Based in</span>
                <p>Des Moines, Iowa &middot; Available remotely.</p>
              </div>
            </div>
          </section>

          <ContactForm />

          <div className={styles.backdrop} aria-hidden="true">
            <span className={styles.backdropOrbit} />
            <span className={styles.backdropCore} />
            <span className={styles.backdropNode} />
          </div>
        </div>
      </Container>
    </main>
  );
}
