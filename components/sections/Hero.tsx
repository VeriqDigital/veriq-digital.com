"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import HeroInquiryForm from "@/components/forms/HeroInquiryForm";
import useLeadModal from "@/components/layout/useLeadModal";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { primaryCta } from "@/config/site";
import styles from "./Hero.module.css";

const LeadModal = dynamic(() => import("@/components/layout/LeadModal"));

type HeroProps = {
  campaign?: ReactNode;
};

const Hero = ({ campaign }: HeroProps) => {
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    isSubmitting,
    openModal,
    submitError,
  } = useLeadModal();

  return (
    <section className={styles.hero}>
      <div className={styles.grid} aria-hidden="true" />
      <Container>
        <div className={styles.layout}>
          <div className={styles.content}>
            <h1 className={styles.title}>
              A digital presence
              <span>Unlike any other.</span>
            </h1>
            <p className={styles.description}>
              We design and build business websites that will help your business
              grow.
            </p>
            <div className={styles.actions}>
              <Button onClick={() => openModal(primaryCta.modal)}>
                Start a project
              </Button>
              <Button href="/work" variant="secondary">
                View our work
              </Button>
            </div>
            {campaign}
          </div>
          <HeroInquiryForm />
        </div>
      </Container>
      {activeModal && (
        <LeadModal
          activeModal={activeModal}
          hasSubmitted={hasSubmitted}
          isSubmitting={isSubmitting}
          onClose={closeModal}
          onSubmit={handleFormSubmit}
          submitError={submitError}
        />
      )}
    </section>
  );
};

export default Hero;
