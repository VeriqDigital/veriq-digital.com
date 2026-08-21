"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type FocusEvent,
  type MouseEvent,
  type PointerEvent,
  useEffect,
  useRef,
} from "react";
import styles from "./HomeWorksRail.module.css";

export type HomeWorksRailProject = {
  slug: string;
  title: string;
  category: string;
  image: string;
  imageAlt: string;
};

type HomeWorksRailTrackProps = {
  projects: HomeWorksRailProject[];
};

type PauseState = {
  desktop: boolean;
  reducedMotion: boolean;
  inView: boolean;
  documentVisible: boolean;
  hovered: boolean;
  focused: boolean;
  dragging: boolean;
};

const CYCLE_DURATION_MS = 38_000;
const DRAG_THRESHOLD = 8;

const HomeWorksRailTrack = ({ projects }: HomeWorksRailTrackProps) => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const primaryGroupRef = useRef<HTMLUListElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const groupWidthRef = useRef(0);
  const offsetRef = useRef(0);
  const startAnimationRef = useRef<() => void>(() => undefined);
  const stopAnimationRef = useRef<() => void>(() => undefined);
  const suppressClickRef = useRef(false);
  const dragRef = useRef({
    pointerId: -1,
    startX: 0,
    startOffset: 0,
    moved: false,
  });
  const pauseStateRef = useRef<PauseState>({
    desktop: false,
    reducedMotion: false,
    inView: false,
    documentVisible: true,
    hovered: false,
    focused: false,
    dragging: false,
  });

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

    const canAnimate = () => {
      const state = pauseStateRef.current;

      return (
        state.desktop &&
        !state.reducedMotion &&
        state.inView &&
        state.documentVisible &&
        !state.hovered &&
        !state.focused &&
        !state.dragging &&
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

    startAnimationRef.current = startAnimation;
    stopAnimationRef.current = stopAnimation;

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

      if (pauseStateRef.current.desktop) {
        applyOffset();
      }

      startAnimation();
    };

    const syncMotionPreference = () => {
      const state = pauseStateRef.current;
      state.desktop = desktopQuery.matches;
      state.reducedMotion = reducedMotionQuery.matches;

      if (!state.desktop || state.reducedMotion) {
        stopAnimation();
        offsetRef.current = 0;
        track.style.transform = "";
      } else {
        measure();
        startAnimation();
      }
    };

    const handleVisibilityChange = () => {
      pauseStateRef.current.documentVisible =
        document.visibilityState === "visible";

      if (pauseStateRef.current.documentVisible) {
        startAnimation();
      } else {
        stopAnimation();
      }
    };

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        pauseStateRef.current.inView = entry.isIntersecting;

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
    desktopQuery.addEventListener("change", syncMotionPreference);
    reducedMotionQuery.addEventListener("change", syncMotionPreference);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    measure();
    syncMotionPreference();

    return () => {
      stopAnimation();
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      desktopQuery.removeEventListener("change", syncMotionPreference);
      reducedMotionQuery.removeEventListener("change", syncMotionPreference);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      startAnimationRef.current = () => undefined;
      stopAnimationRef.current = () => undefined;
    };
  }, []);

  const setPaused = (
    reason: "hovered" | "focused" | "dragging",
    paused: boolean,
  ) => {
    pauseStateRef.current[reason] = paused;

    if (paused) {
      stopAnimationRef.current();
    } else {
      startAnimationRef.current();
    }
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!pauseStateRef.current.desktop || event.button !== 0) {
      return;
    }

    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startOffset: offsetRef.current,
      moved: false,
    };
    event.currentTarget.dataset.dragging = "true";
    setPaused("dragging", true);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId || !pauseStateRef.current.dragging) {
      return;
    }

    const distance = drag.startX - event.clientX;

    if (Math.abs(distance) >= DRAG_THRESHOLD) {
      drag.moved = true;

      if (!event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.setPointerCapture(event.pointerId);
      }

      event.preventDefault();
    }

    const width = groupWidthRef.current;

    if (width > 0) {
      offsetRef.current =
        ((drag.startOffset + distance) % width + width) % width;

      if (trackRef.current) {
        trackRef.current.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`;
      }
    }
  };

  const finishDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;

    if (drag.pointerId !== event.pointerId) {
      return;
    }

    const width = groupWidthRef.current;
    const offsetDifference = Math.abs(offsetRef.current - drag.startOffset);
    const wrappedDistance =
      width > 0
        ? Math.min(offsetDifference, Math.max(0, width - offsetDifference))
        : offsetDifference;

    suppressClickRef.current =
      drag.moved && wrappedDistance >= DRAG_THRESHOLD;
    dragRef.current.pointerId = -1;
    event.currentTarget.dataset.dragging = "false";

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    setPaused("dragging", false);
  };

  const handleClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!suppressClickRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = false;
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setPaused("focused", false);
    }
  };

  return (
    <div
      ref={viewportRef}
      className={styles.viewport}
      data-home-work-rail
      role="region"
      aria-roledescription="carousel"
      aria-label="Selected work"
      onPointerEnter={() => setPaused("hovered", true)}
      onPointerLeave={() => setPaused("hovered", false)}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onClickCapture={handleClickCapture}
      onFocusCapture={() => setPaused("focused", true)}
      onBlurCapture={handleBlur}
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
            </div>
            <span aria-hidden="true">↗</span>
          </div>
        </Link>
      </li>
    ))}
  </ul>
);

export default HomeWorksRailTrack;
