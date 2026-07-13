"use client";

import { useEffect, useRef } from "react";
import LeadModal from "@/components/layout/LeadModal";
import useLeadModal from "@/components/layout/useLeadModal";
import Button from "@/components/ui/Button";
import Container from "@/components/ui/Container";
import { primaryCta } from "@/config/site";
import styles from "./Hero.module.css";

const Hero = () => {
  const heroRef = useRef<HTMLElement>(null);
  const {
    activeModal,
    closeModal,
    handleFormSubmit,
    hasSubmitted,
    isSubmitting,
    openModal,
    submitError,
  } = useLeadModal();

  useEffect(() => {
    const hero = heroRef.current;

    if (
      !hero ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frameId: number | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const updateScene = () => {
      const scrollProgress = Math.min(window.scrollY / hero.offsetHeight, 1);
      const cyanAngle = (-55 + scrollProgress * 250) * (Math.PI / 180);
      const darkAngle = (145 + scrollProgress * 215) * (Math.PI / 180);

      hero.style.setProperty("--pointer-x", `${pointerX}px`);
      hero.style.setProperty("--pointer-y", `${pointerY}px`);
      hero.style.setProperty("--ambient-x", `${pointerX * -0.35}px`);
      hero.style.setProperty(
        "--ambient-y",
        `${pointerY * -0.35 + scrollProgress * 70}px`,
      );
      hero.style.setProperty("--grid-scroll", `${scrollProgress * 38}px`);
      hero.style.setProperty("--scene-scroll-x", `${scrollProgress * -34}px`);
      hero.style.setProperty("--scene-scroll-y", `${scrollProgress * 130}px`);
      hero.style.setProperty(
        "--scene-rotate",
        `${-8 + scrollProgress * 12}deg`,
      );
      hero.style.setProperty(
        "--node-cyan-left",
        `${50 + Math.cos(cyanAngle) * 44}%`,
      );
      hero.style.setProperty(
        "--node-cyan-top",
        `${50 + Math.sin(cyanAngle) * 27}%`,
      );
      hero.style.setProperty(
        "--node-dark-left",
        `${50 + Math.cos(darkAngle) * 42}%`,
      );
      hero.style.setProperty(
        "--node-dark-top",
        `${50 + Math.sin(darkAngle) * 31}%`,
      );
      frameId = null;
    };

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateScene);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 24;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 18;
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    updateScene();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("pointermove", handlePointerMove);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <section ref={heroRef} className={styles.hero}>
      <div className={styles.ambient} aria-hidden="true" />
      <div className={styles.grid} aria-hidden="true" />
      <div className={styles.scene} aria-hidden="true">
        <div className={styles.halo} />
        <div className={styles.orbitOuter} />
        <div className={styles.orbitInner} />
        <div className={styles.core}>
          <div className={styles.coreGlow} />
        </div>
        <div className={styles.nodeCyan}>
          <span />
        </div>
        <div className={styles.nodeDark}>
          <span />
        </div>
      </div>

      <Container>
        <div className={styles.content}>
          <p className={styles.eyebrow}>
            <span aria-hidden="true" />
            Independent digital studio
          </p>
          <h1 className={styles.title}>
            Web design &amp; development
            <span>built for what&apos;s next.</span>
          </h1>
          <p className={styles.description}>
            We design websites, software, and digital experiences that help
            businesses earn trust, attract customers, and grow faster.
          </p>
          <div className={styles.actions}>
            <Button onClick={() => openModal(primaryCta.modal)}>
              Start a project
            </Button>
            <Button href="/#services" variant="secondary">
              View our Work
            </Button>
          </div>
        </div>
      </Container>
      <div className={styles.scrollCue} aria-hidden="true">
        <span>Scroll to explore</span>
        <i />
      </div>
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
