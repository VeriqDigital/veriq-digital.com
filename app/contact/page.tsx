import Container from "@/components/ui/Container";
import BookingLink from "@/components/ui/BookingLink";
import SocialLinks from "@/components/ui/SocialLinks";
import { createPageMetadata } from "@/config/seo";
import { siteConfig } from "@/config/site";
import ContactForm from "./ContactForm";
import styles from "./contact.module.css";

export const metadata = createPageMetadata({
  title: "Contact Our Des Moines Digital Studio",
  description:
    "Contact Veriq Digital about web design, website redesigns, custom development, SEO, or ongoing growth support in Des Moines and Central Iowa.",
  path: "/contact",
});

export default function ContactPage() {
  const phoneHref = `tel:${siteConfig.contact.phoneE164}`;

  return (
    <main id="main-content" className={styles.page}>
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

            <aside
              className={styles.bookingOption}
              aria-labelledby="booking-option-title"
            >
              <div>
                <p>Prefer to talk?</p>
                <h2 id="booking-option-title">Book a 20-minute intro call.</h2>
              </div>
              <BookingLink placement="contact_page">
                Book a call <span aria-hidden="true">↗</span>
              </BookingLink>
            </aside>

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
              <div>
                <span>Follow</span>
                <SocialLinks />
              </div>
            </div>
          </section>

          <ContactForm />

        </div>
      </Container>
    </main>
  );
}
