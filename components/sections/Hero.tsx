import type { ReactNode } from "react";
import HeroInquiryForm from "@/components/forms/HeroInquiryForm";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import styles from "./Hero.module.css";

type HeroProps = {
  campaign?: ReactNode;
};

const Hero = ({ campaign }: HeroProps) => {
  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              Get found. Earn trust.
              <span>Turn interest into action.</span>
            </h1>
            <p className={styles.description}>
              Veriq designs and builds custom and Squarespace websites with
              search foundations, clear conversion paths, and support after
              launch.
            </p>
            <div className={styles.actions}>
              <Button href="/contact">Start a project</Button>
              <Button href="/work" variant="secondary">
                View our work
              </Button>
            </div>
            <ul className={styles.context} aria-label="Veriq at a glance">
              <li>Based in Des Moines</li>
              <li>Custom or Squarespace</li>
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
