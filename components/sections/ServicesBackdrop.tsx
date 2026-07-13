"use client";

import { useEffect, useRef } from "react";
import styles from "./ServicesSection.module.css";

const ServicesBackdrop = () => {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const backdrop = backdropRef.current;

    if (
      !backdrop ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frameId: number | null = null;

    const updateBackdrop = () => {
      const section = backdrop.parentElement;

      if (!section) {
        frameId = null;
        return;
      }

      const bounds = section.getBoundingClientRect();
      const totalTravel = window.innerHeight + bounds.height;
      const progress = Math.min(
        Math.max((window.innerHeight - bounds.top) / totalTravel, 0),
        1,
      );
      const tracerAngle = (-35 + progress * 285) * (Math.PI / 180);

      backdrop.style.setProperty(
        "--backdrop-y",
        `${-45 + progress * 115}px`,
      );
      backdrop.style.setProperty(
        "--backdrop-rotate",
        `${-16 + progress * 48}deg`,
      );
      backdrop.style.setProperty(
        "--tracer-left",
        `${50 + Math.cos(tracerAngle) * 43}%`,
      );
      backdrop.style.setProperty(
        "--tracer-top",
        `${50 + Math.sin(tracerAngle) * 27}%`,
      );
      frameId = null;
    };

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateBackdrop);
      }
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    updateBackdrop();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div ref={backdropRef} className={styles.backdrop} aria-hidden="true">
      <div className={styles.backdropGlow} />
      <div className={`${styles.wire} ${styles.wireOuter}`} />
      <div className={`${styles.wire} ${styles.wireInner}`} />
      <div className={styles.lens}>
        <span />
      </div>
      <div className={styles.tracer}>
        <span />
      </div>
    </div>
  );
};

export default ServicesBackdrop;
