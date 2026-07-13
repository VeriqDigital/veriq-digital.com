"use client";

import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (!glow || !hasFinePointer || prefersReducedMotion) {
      return;
    }

    let frameId: number | null = null;
    let pointerX = -400;
    let pointerY = -400;

    const updateGlow = () => {
      glow.style.transform = `translate3d(${pointerX}px, ${pointerY}px, 0) translate(-50%, -50%)`;
      glow.dataset.visible = "true";
      frameId = null;
    };

    const handlePointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateGlow);
      }
    };

    const hideGlow = () => {
      glow.dataset.visible = "false";
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("blur", hideGlow);
    document.documentElement.addEventListener("mouseleave", hideGlow);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("blur", hideGlow);
      document.documentElement.removeEventListener("mouseleave", hideGlow);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return <div ref={glowRef} className="cursor-glow" aria-hidden="true" />;
};

export default CursorGlow;
