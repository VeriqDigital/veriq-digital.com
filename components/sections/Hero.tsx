import type { ReactNode } from "react";
import HeroInquiryForm from "@/components/forms/HeroInquiryForm";
import Button, { getButtonClassName } from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import WebsiteAuditLink from "@/components/ui/WebsiteAuditLink";
import styles from "./Hero.module.css";

type HeroProps = {
  auditEnabled: boolean;
  campaign?: ReactNode;
};

const Hero = ({ auditEnabled, campaign }: HeroProps) => {
  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              Custom websites.
              <span>That turn leads into customers.</span>
            </h1>
            <p className={styles.description}>
              Built around your business, your customers, and the actions you
              want them to take. Veriq combines strategy, design, development,
              and SEO to create a site that works as hard as your business does.
            </p>
            <div className={styles.actions}>
              <Button href="/contact">Book a call</Button>
              <Button href="/contact" variant="secondary">
                Start a project
              </Button>
            </div>
            <ul className={styles.context} aria-label="Veriq at a glance">
              <li>Based in Des Moines</li>
              <li>Custom design &amp; development</li>
              <li>Local and remote projects</li>
            </ul>
            {campaign}
          </div>
          <HeroInquiryForm />
        </div>
      </Container>
    </section>
  );
};

export default Hero;
