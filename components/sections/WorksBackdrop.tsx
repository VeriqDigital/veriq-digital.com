"use client";

import { useEffect, useRef } from "react";
import styles from "./WorksSection.module.css";

const WorksBackdrop = () => {
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
    let pointerX = 0;
    let pointerY = 0;

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
      const tracerAngle = (-70 + progress * 310) * (Math.PI / 180);

      backdrop.style.setProperty(
        "--works-scroll-x",
        `${35 - progress * 95}px`,
      );
      backdrop.style.setProperty(
        "--works-scroll-y",
        `${-55 + progress * 150}px`,
      );
      backdrop.style.setProperty(
        "--works-rotate",
        `${-22 + progress * 68}deg`,
      );
      backdrop.style.setProperty("--works-pointer-x", `${pointerX}px`);
      backdrop.style.setProperty("--works-pointer-y", `${pointerY}px`);
      backdrop.style.setProperty(
        "--works-tracer-left",
        `${50 + Math.cos(tracerAngle) * 44}%`,
      );
      backdrop.style.setProperty(
        "--works-tracer-top",
        `${50 + Math.sin(tracerAngle) * 29}%`,
      );
      frameId = null;
    };

    const requestUpdate = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateBackdrop);
      }
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = (event.clientX / window.innerWidth - 0.5) * 14;
      pointerY = (event.clientY / window.innerHeight - 0.5) * 10;
      requestUpdate();
    };

    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, {
      passive: true,
    });
    updateBackdrop();

    return () => {
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      window.removeEventListener("pointermove", handlePointerMove);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div ref={backdropRef} className={styles.wireBackdrop} aria-hidden="true">
      <svg
        className={styles.wireMesh}
        viewBox="0 0 520 520"
        focusable="false"
      >
        <path
          className={styles.meshOuter}
          d="M261 47C351 38 445 102 474 194C507 299 458 409 365 463C278 513 163 480 88 404C15 330 24 209 86 127C128 72 191 50 261 47Z"
        />
        <path
          className={styles.meshInner}
          d="M262 111C329 102 398 145 419 212C444 289 410 370 343 407C278 444 197 424 144 367C92 310 98 225 143 165C173 126 216 114 262 111Z"
        />
        <path
          className={styles.meshContour}
          d="M264 169C311 162 359 193 374 240C391 295 367 351 320 377C274 403 218 389 181 350C145 310 149 251 180 210C201 182 232 171 264 169Z"
        />
        <path
          className={styles.meshLatitude}
          d="M55 219C151 180 367 176 465 224"
        />
        <path
          className={styles.meshLatitude}
          d="M49 308C161 350 370 351 470 299"
        />
        <path
          className={styles.meshLongitude}
          d="M196 62C154 165 154 359 221 470"
        />
        <path
          className={styles.meshLongitude}
          d="M322 57C376 157 376 359 310 474"
        />
      </svg>
      <div className={styles.wireTracer}>
        <span />
      </div>
    </div>
  );
};

export default WorksBackdrop;
