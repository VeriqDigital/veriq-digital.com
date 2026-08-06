"use client";

import type { RefObject } from "react";
import { useLayoutEffect } from "react";

const DESKTOP_MODAL_QUERY = "(min-width: 641px)";

/**
 * Preserve a dialog's initial desktop position while its async content changes.
 * The first measurement happens before paint, so the modal still opens centered;
 * later success and error states grow or shrink downward instead of moving the
 * entire dialog through the viewport.
 */
const useStableModalPosition = (
  dialogRef: RefObject<HTMLElement | null>,
  isOpen: boolean,
) => {
  useLayoutEffect(() => {
    const dialog = dialogRef.current;

    if (!isOpen || !dialog) {
      return;
    }

    const previousStyles = {
      left: dialog.style.left,
      position: dialog.style.position,
      top: dialog.style.top,
      transform: dialog.style.transform,
    };

    const restoreStyles = () => {
      dialog.style.left = previousStyles.left;
      dialog.style.position = previousStyles.position;
      dialog.style.top = previousStyles.top;
      dialog.style.transform = previousStyles.transform;
    };

    const pinDialog = () => {
      restoreStyles();

      if (!window.matchMedia(DESKTOP_MODAL_QUERY).matches) {
        return;
      }

      const initialTop = Math.max(16, dialog.getBoundingClientRect().top);

      dialog.style.left = "50%";
      dialog.style.position = "absolute";
      dialog.style.top = `${initialTop}px`;
      dialog.style.transform = "translateX(-50%)";
    };

    pinDialog();

    let frameId: number | null = null;
    const handleResize = () => {
      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      frameId = window.requestAnimationFrame(() => {
        pinDialog();
        frameId = null;
      });
    };

    window.addEventListener("resize", handleResize, { passive: true });

    return () => {
      window.removeEventListener("resize", handleResize);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      restoreStyles();
    };
  }, [dialogRef, isOpen]);
};

export default useStableModalPosition;
