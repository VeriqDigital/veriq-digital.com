"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import ProjectTypeLabel from "@/components/work/ProjectTypeLabel";
import type { ProjectType } from "@/data/projects";
import styles from "./HomeWorksRail.module.css";

export type HomeWorksRailProject = {
  slug: string;
  title: string;
  category: string;
  image: string;
  imageAlt: string;
  projectType: ProjectType;
};

type HomeWorksRailTrackProps = {
  projects: HomeWorksRailProject[];
};

type PlaybackState = {
  inView: boolean;
  documentVisible: boolean;
  hovered: boolean;
  focused: boolean;
};

const CYCLE_DURATION_MS = 38_000;

const HomeWorksRailTrack = ({ projects }: HomeWorksRailTrackProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const primaryGroupRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const groupWidthRef = useRef(0);
  const offsetRef = useRef(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    const primaryGroup = primaryGroupRef.current;

    if (!viewport || !track || !primaryGroup) {
      return;
    }

    const desktopQuery = window.matchMedia(
      "(min-width: 901px) and (hover: hover) and (pointer: fine)",
    );
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const playback: PlaybackState = {
      inView: false,
      documentVisible: document.visibilityState === "visible",
      hovered: false,
      focused: false,
    };

    const canAnimate = () => {
      return (
        desktopQuery.matches &&
        !reducedMotionQuery.matches &&
        playback.inView &&
        playback.documentVisible &&
        !playback.hovered &&
        !playback.focused &&
        groupWidthRef.current > 0
      );
    };

    const applyOffset = () => {
      track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
    };

    const wrapOffset = (offset: number) => {
      const width = groupWidthRef.current;

      if (width === 0) {
        return 0;
      }

      return ((offset % width) + width) % width;
    };

    const stopAnimation = () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      previousTimeRef.current = null;
    };

    const tick = (time: number) => {
      if (!canAnimate()) {
        stopAnimation();
        return;
      }

      if (previousTimeRef.current !== null) {
        const elapsed = Math.min(time - previousTimeRef.current, 64);
        offsetRef.current = wrapOffset(
          offsetRef.current +
            (elapsed * groupWidthRef.current) / CYCLE_DURATION_MS,
        );
        applyOffset();
      }

      previousTimeRef.current = time;
      frameRef.current = window.requestAnimationFrame(tick);
    };

    const startAnimation = () => {
      if (frameRef.current === null && canAnimate()) {
        previousTimeRef.current = null;
        frameRef.current = window.requestAnimationFrame(tick);
      }
    };

    const measure = () => {
      const previousWidth = groupWidthRef.current;
      const nextWidth = primaryGroup.getBoundingClientRect().width;

      if (nextWidth <= 0) {
        return;
      }

      if (previousWidth > 0) {
        offsetRef.current = (offsetRef.current / previousWidth) * nextWidth;
      }

      groupWidthRef.current = nextWidth;
      offsetRef.current = wrapOffset(offsetRef.current);

      if (desktopQuery.matches && !reducedMotionQuery.matches) {
        applyOffset();
      }

      startAnimation();
    };

    const syncMotionPreference = () => {
      if (!desktopQuery.matches || reducedMotionQuery.matches) {
        stopAnimation();
        offsetRef.current = 0;
        track.style.transform = "";
      } else {
        measure();
      }
    };

    const setInteractionPause = (
      reason: "hovered" | "focused",
      paused: boolean,
    ) => {
      playback[reason] = paused;

      if (paused) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    const handleVisibilityChange = () => {
      playback.documentVisible = document.visibilityState === "visible";

      if (playback.documentVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const handlePointerEnter = () => setInteractionPause("hovered", true);
    const handlePointerLeave = () => setInteractionPause("hovered", false);
    const handleFocusIn = () => setInteractionPause("focused", true);
    const handleFocusOut = (event: globalThis.FocusEvent) => {
      const nextTarget = event.relatedTarget;

      if (!(nextTarget instanceof Node) || !viewport.contains(nextTarget)) {
        setInteractionPause("focused", false);
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        playback.inView = entry.isIntersecting;

        if (entry.isIntersecting) {
          startAnimation();
        } else {
          stopAnimation();
        }
      },
      { threshold: 0.08 },
    );
    const resizeObserver = new ResizeObserver(measure);

    intersectionObserver.observe(viewport);
    resizeObserver.observe(primaryGroup);
    viewport.addEventListener("pointerenter", handlePointerEnter);
    viewport.addEventListener("pointerleave", handlePointerLeave);
    viewport.addEventListener("focusin", handleFocusIn);
    viewport.addEventListener("focusout", handleFocusOut);
    desktopQuery.addEventListener("change", syncMotionPreference);
    reducedMotionQuery.addEventListener("change", syncMotionPreference);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    syncMotionPreference();

    return () => {
      stopAnimation();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      viewport.removeEventListener("pointerenter", handlePointerEnter);
      viewport.removeEventListener("pointerleave", handlePointerLeave);
      viewport.removeEventListener("focusin", handleFocusIn);
      viewport.removeEventListener("focusout", handleFocusOut);
      desktopQuery.removeEventListener("change", syncMotionPreference);
      reducedMotionQuery.removeEventListener("change", syncMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-home-work-rail
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected work"
    >
      <div ref={trackRef} className={styles.track} data-home-work-track>
        <ProjectSequence
          ref={primaryGroupRef}
          projects={projects}
          duplicate={false}
        />
        <ProjectSequence projects={projects} duplicate />
      </div>
    </div>
  );
};

type ProjectSequenceProps = {
  projects: HomeWorksRailProject[];
  duplicate: boolean;
  ref?: React.Ref<HTMLUListElement>;
};

const ProjectSequence = ({
  projects,
  duplicate,
  ref,
}: ProjectSequenceProps) => (
  <ul
    ref={ref}
    className={`${styles.group} ${duplicate ? styles.duplicateGroup : ""}`}
    data-home-work-group={duplicate ? "duplicate" : "primary"}
    aria-label={duplicate ? undefined : "Featured projects"}
    aria-hidden={duplicate || undefined}
  >
    {projects.map((project) => (
      <li className={styles.card} key={project.slug}>
        <Link
          href={`/work/${project.slug}`}
          className={styles.cardLink}
          tabIndex={duplicate ? -1 : undefined}
          draggable={false}
        >
          <div className={styles.imageWrap}>
            <Image
              src={project.image}
              alt={duplicate ? "" : project.imageAlt}
              fill
              sizes="(max-width: 900px) 78vw, (max-width: 1280px) 44vw, 52rem"
              className={styles.image}
              draggable={false}
            />
          </div>
          <div className={styles.projectMeta}>
            <div>
              <h3>{project.title}</h3>
              <p>{project.category}</p>
              <ProjectTypeLabel
                className={styles.projectType}
                projectType={project.projectType}
              />
            </div>
            <span aria-hidden="true">↗</span>
          </div>
        </Link>
      </li>
    ))}
  </ul>
);

export default HomeWorksRailTrack;
