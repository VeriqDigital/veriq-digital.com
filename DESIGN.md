---
name: "Veriq Digital"
description: "A technical editorial system for practical, founder-led digital work."
colors:
  cyan: "#4ef2f2"
  cyan-hover: "#40c5c5"
  cyan-readable-light: "#00777a"
  warm-white: "#f7f7f5"
  graphite: "#121212"
  dark-canvas: "#1a1c1e"
  dark-surface: "#24272a"
  ink: "#111111"
  light-muted: "#5f6368"
  dark-muted: "#aeb3b7"
typography:
  display:
    fontFamily: "Oswald, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 6vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "clamp(1rem, 1.25vw, 1.125rem)"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.7rem"
    fontWeight: 700
    lineHeight: 1.35
    letterSpacing: "0.12em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "18px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  section: "clamp(5rem, 9vw, 9rem)"
components:
  button-primary:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
  button-secondary-dark:
    backgroundColor: "{colors.graphite}"
    textColor: "{colors.warm-white}"
    rounded: "{rounded.sm}"
    padding: "12px 24px"
---

# Design System: Veriq Digital

## Overview

**Creative North Star: "The Working Specification"**

Veriq's visual world borrows the confidence of an industrial field manual and the pacing of an editorial feature. It is high-contrast, direct, and precise: oversized condensed statements carry the argument while quiet rules, numbering, and compact technical labels organize the supporting evidence.

The system should feel custom and composed, never ornamental for its own sake. Dark graphite fields and warm-white pages create section-to-section rhythm; cyan is a scarce signal for action, wayfinding, and meaningful emphasis.

**Key Characteristics:**

- Condensed uppercase display typography with clean, sharp rendering
- Asymmetrical editorial compositions and intentional negative space
- Fine rules, numbered sequences, and structured lists instead of generic icon cards
- Graphite, warm white, and cyan used in decisive blocks
- Practical body copy with comfortable measure and contrast

## Colors

The palette is restrained: neutral fields do most of the work and cyan appears as a functional signal.

### Primary

- **Signal Cyan** (`#4ef2f2`): primary actions, active details, and key wayfinding on dark surfaces.
- **Readable Cyan** (`#00777a`): cyan-equivalent text and focus treatment on light surfaces.

### Neutral

- **Warm White** (`#f7f7f5`): light canvas and inverse text.
- **Specification Graphite** (`#121212`): strong dark chapters, panels, and footer.
- **Dark Canvas** (`#1a1c1e`) and **Dark Surface** (`#24272a`): dark-theme background layers.
- **Ink** (`#111111`): primary text on light backgrounds.
- **Light Muted** (`#5f6368`) and **Dark Muted** (`#aeb3b7`): supporting copy with theme-appropriate contrast.

**The Signal Rule.** Cyan identifies action, navigation, or a meaningful point in the story. It is not ambient decoration.

## Typography

**Display Font:** Oswald (with Arial Narrow and sans-serif fallbacks)  
**Body Font:** Geist (with Arial and sans-serif fallbacks)  
**Label/Mono Font:** Geist Mono

**Character:** Oswald gives Veriq its industrial editorial voice. Geist keeps explanatory text open and contemporary; Geist Mono is reserved for indices, metadata, and compact technical labels.

### Hierarchy

- **Display** (800-900, responsive clamp, `0.9-1` line-height): hero and chapter theses; uppercase and tightly measured.
- **Headline** (800-900, `clamp(2.75rem, 5vw, 5rem)`, near-solid line-height): section arguments.
- **Title** (700-800, `1.25-2.35rem`, solid line-height): service paths, steps, and list titles.
- **Body** (400-500, `1-1.125rem`, `1.6-1.75` line-height): explanatory copy; usually limited to 42-65 characters per line.
- **Label** (650-700, `0.65-0.75rem`, `0.1-0.14em`, uppercase): numbering, section metadata, and technical descriptors.

**The Clean Edge Rule.** Readable text never uses RGB splits, duplicated pseudo-elements, text shadows, filters, skew, or transforms. Condensation and scale provide the character.

## Layout

Content sits in a centered 1280px container with 24px minimum side padding. Desktop compositions use asymmetrical two-column grids and full-width rule systems. Major sections use generous vertical spacing, alternating dense capability passages with quieter explanatory moments.

Responsive layouts recompose instead of merely stacking: headings scale down without clipping, capability structures become full-width, tap targets remain at least 44px tall, and desktop offsets or decorative transforms disappear below tablet widths. Anchor targets account for the fixed navigation.

## Elevation & Depth

The system is flat by default. Depth comes from tonal field changes, hard 1px rules, overlap, and scale. Soft shadows are reserved for floating global controls and modals; ordinary marketing content should not combine borders and broad shadows.

## Shapes

Most content is rectilinear and rule-bound. Buttons use modest 6-10px corners. Large panels may use a single distinctive clipped or extended corner, but text-bearing surfaces remain level. Pills are reserved for truly compact controls.

## Components

### Buttons

- **Shape:** compact rounded rectangle (6px) with a minimum 44px interactive height.
- **Primary:** signal cyan with ink text, bold uppercase label, and restrained lift on hover.
- **Secondary:** transparent or graphite field with a fine rule; never a low-contrast ghost.
- **Focus:** a clear 3px theme-readable outline with offset.

### Cards / Containers

- **Corner Style:** usually square or lightly rounded; large expressive corners are rare.
- **Background:** warm-white or graphite fields with theme-aware text.
- **Shadow Strategy:** flat by default.
- **Border:** one-pixel rules organize comparison and capability systems.
- **Internal Padding:** responsive 20-44px depending on density.

### Navigation

Navigation stays visually quiet beside the page thesis. Labels use the body face, active/hover states shift toward readable cyan, and mobile navigation preserves full-size targets and straightforward order.

### Numbered Index

Service pillars and sequential processes use two-digit indices in Geist Mono paired with large Oswald titles. Numbers must explain sequence or page wayfinding, not act as decoration.

## Do's and Don'ts

### Do:

- **Do** use one dominant typographic statement per section and give it room.
- **Do** vary composition and density while preserving a consistent rule and spacing grammar.
- **Do** keep supporting copy comfortably sized, high-contrast, and narrowly measured.
- **Do** make mobile layouts feel intentionally recomposed at approximately 390px.

### Don't:

- **Don't** use chromatic aberration, glow, blur, text-shadow, or transformed containers on readable text.
- **Don't** replace service clarity with generic SaaS icon grids, nested floating cards, fake metrics, or decorative dashboards.
- **Don't** introduce purple/blue AI gradients, glowing blobs, excessive pills, or stock agency motifs.
- **Don't** make cyan carry long passages of small text on light backgrounds.
