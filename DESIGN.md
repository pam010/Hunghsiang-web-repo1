---
name: Hunghsiang Machinery
description: A dark, precise industrial interface that keeps real machinery and verified specifications at the center.
colors:
  industrial-navy: "#0f172a"
  industrial-slate: "#1e293b"
  structural-slate: "#334155"
  action-blue: "#0284c7"
  light-surface: "#f8fafc"
  white: "#ffffff"
typography:
  display:
    fontFamily: "Noto Sans TC, sans-serif"
    fontSize: "clamp(2.25rem, 6vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 1.15
  body:
    fontFamily: "Noto Sans TC, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.75
  technical-label:
    fontFamily: "Rajdhani, Noto Sans TC, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: 1.4
rounded:
  control: "4px"
  card: "8px"
  panel: "12px"
spacing:
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "48px"
  xl: "96px"
components:
  button-primary:
    backgroundColor: "{colors.action-blue}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "16px 32px"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.industrial-navy}"
    rounded: "{rounded.control}"
    padding: "16px 32px"
  input:
    backgroundColor: "{colors.light-surface}"
    textColor: "{colors.industrial-navy}"
    rounded: "{rounded.control}"
    padding: "12px 16px"
---

# Design System: Hunghsiang Machinery

## Overview

**Creative North Star: "The Reliable Machine Builder"**

The website uses a dark industrial foundation, cool blue action color, real equipment imagery, and direct technical language. The visual system should feel like an experienced automation supplier: confident, orderly, and specific without drifting into exaggerated futuristic styling.

The current homepage cover photography remains part of the established identity. Product sections use real machine images and verified specifications to build trust, while the light enquiry section creates a clear transition from evaluation to action.

**Key Characteristics:**

- Dark navy establishes an industrial, high-contrast frame.
- Real equipment photography carries product credibility.
- Blue consistently indicates links, focus, and primary actions.
- Traditional Chinese remains highly legible on desktop and mobile.
- Motion supports orientation and stops for reduced-motion users.

## Colors

The system is built from industrial navy and slate, with a single calibrated blue accent and a light neutral enquiry surface.

**The One Signal Rule.** Action blue is reserved for interactive controls, focus, and concise technical emphasis; it does not become a decorative glow.

## Typography

**Display Font:** Noto Sans TC (sans-serif fallback)
**Body Font:** Noto Sans TC (sans-serif fallback)
**Technical Label Font:** Rajdhani with Noto Sans TC fallback

Headlines use heavy weight and compact wording. Body copy uses generous line height and stays within a readable measure. Rajdhani is limited to model names, measurements, and supporting Latin labels.

**The Technical Type Rule.** A technical font is used for real technical content, never as a costume for ordinary paragraphs.

## Layout

Sections use centered containers with generous horizontal padding and clear vertical separation. The hero places the offer, explanation, actions, and capability summary in one readable column over the existing cover imagery. Product cards form a three-column desktop grid and collapse into a single mobile sequence.

Primary actions remain visible without relying on hover. Mobile controls use at least 44px touch targets, and text containers can expand without fixed-height clipping.

## Elevation & Depth

Depth comes from dark tonal layering, restrained shadows on conversion surfaces, and photographic imagery. Product cards may use a subtle translucent surface, but broad glow and decorative WebGL effects are excluded.

**The Evidence First Rule.** Effects may frame real machinery, but never compete with it.

## Shapes

Controls use compact functional corners. Cards and major panels use moderate rounding, while small labels may use tighter radii. Pills are reserved for compact status or taxonomy controls rather than general decoration.

## Components

### Buttons

- **Primary:** Action blue with white text and a compact rectangular radius.
- **Secondary:** White with dark navy text.
- **Focus:** Visible sky-blue outline with offset.
- **Disabled / Loading:** Reduced opacity and wait cursor while preserving the button label’s meaning.

### Cards / Containers

- **Corner Style:** Moderately rounded.
- **Background:** Dark translucent panels over industrial navy.
- **Border:** One restrained light border.
- **Internal Padding:** 24px on standard cards.

### Inputs / Fields

- **Style:** Light gray surface, persistent label, full-width flexible control.
- **Focus:** Blue border, ring, and browser-independent visible outline.
- **Content:** 16px input text on mobile to avoid browser zoom.

### Navigation

The navigation remains fixed over a dark navy surface. Desktop links are concise; mobile navigation exposes the same destinations and supports keyboard closing with Escape.

## Do's and Don'ts

### Do:

- **Do** preserve the existing homepage cover photographs unless a future brief explicitly replaces them.
- **Do** use verified machine specifications and clear qualification language.
- **Do** keep the spot welder and cell sorter equally discoverable.
- **Do** provide clear focus, reduced-motion, and mobile behavior.

### Don't:

- **Don't** use unsupported performance claims.
- **Don't** add neon halos, decorative WebGL particles, or excessive blur.
- **Don't** hide contact and privacy information behind placeholder links.
- **Don't** use headings for decorative labels or skip heading levels.
