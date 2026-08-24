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
              Get found. Earn trust.
              <span>Turn leads into customers.</span>
            </h1>
            <p className={styles.description}>
              Veriq designs and develops custom websites that help businesses
              get found, earn trust, and turn visitors into customers. We also
              stick around after launch for SEO, improvements, and support.
            </p>
            <div className={styles.actions}>
              <Button href="/contact">Start a project</Button>
              {auditEnabled ? (
                <WebsiteAuditLink
                  placement="homepage_hero"
                  className={getButtonClassName("secondary")}
                >
                  Audit your website
                </WebsiteAuditLink>
              ) : (
                <Button href="/work" variant="secondary">
                  View our work
                </Button>
              )}
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
