"use client";

import Image from "next/image";
import LeadModal from "@/components/layout/LeadModal";
import useLeadModal from "@/components/layout/useLeadModal";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { primaryCta, siteConfig } from "@/config/site";

const Hero = () => {
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
    <section className="relative min-h-svh overflow-hidden">
      <Container>
        <div className="relative z-10 flex min-h-svh translate-y-[-4vh] flex-col items-center justify-center pb-16 pt-28 text-center md:translate-y-[-6vh]">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.45em] text-(--primary)">
            {siteConfig.name}
          </p>
          <h1 className="max-w-5xl font-heading text-5xl font-black uppercase tracking-tight md:text-7xl lg:text-8xl">
            A Strong Starter For Local Business Sites
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-(--muted) md:text-xl">
            Swap the config, copy, services, and images to launch polished sites
            for trades, repair shops, studios, clinics, and other service
            businesses.
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <Button onClick={() => openModal(primaryCta.modal)}>
              {primaryCta.label}
            </Button>
            <Button href="/#services" variant="secondary">
              View services
            </Button>
          </div>
        </div>
      </Container>
      {/* <Image
        src="/starter-hero.svg"
        alt="Abstract storefront background"
        fill
        priority
        sizes="100vw"
        className="-z-10 object-cover"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute bottom-0 left-0 h-64 w-full bg-linear-to-b from-transparent to-(--background)" /> */}
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
