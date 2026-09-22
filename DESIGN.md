---
name: Tailspin Shelter
description: Slate-and-cobalt visual system for the Tailspin app and its live attendee workshop guide.
colors:
  deep-night: "#080d18"
  night-field: "#0f172a"
  raised-slate: "#151f34"
  instruction-plate: "#1e293b"
  structural-line: "#334155"
  muted-slate: "#64748b"
  body-slate: "#cbd5e1"
  quiet-bone: "#e2e8f0"
  bone: "#f8fafc"
  cobalt-deep: "#1d4ed8"
  cobalt-action: "#2563eb"
  route-blue: "#60a5fa"
  link-blue: "#93c5fd"
  demo-violet: "#a78bfa"
  success-green: "#4ade80"
  checkpoint-amber: "#fcd34d"
  danger-red: "#f87171"
typography:
  display:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(3rem, 7vw, 6rem)"
    fontWeight: 820
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  headline:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3.25rem)"
    fontWeight: 820
    lineHeight: 1.08
    letterSpacing: "-0.035em"
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
  lead:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "clamp(1.1rem, 2vw, 1.3rem)"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "0.06em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Consolas, Liberation Mono, monospace"
    fontSize: "0.9em"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  square: "0"
  control: "0.5rem"
  container: "0.75rem"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "3rem"
components:
  guide-button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.7rem 1.15rem"
  guide-button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.bone}"
    typography: "{typography.label}"
    rounded: "{rounded.square}"
    padding: "0.7rem 1.15rem"
  app-button-primary:
    backgroundColor: "{colors.cobalt-action}"
    textColor: "{colors.bone}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0.75rem 1.5rem"
  app-card:
    backgroundColor: "{colors.instruction-plate}"
    textColor: "{colors.body-slate}"
    rounded: "{rounded.container}"
    padding: "1.5rem"
  status-chip:
    backgroundColor: "rgba(74, 222, 128, 0.2)"
    textColor: "{colors.success-green}"
    rounded: "{rounded.pill}"
    padding: "0.25rem 0.75rem"
  module-plate:
    backgroundColor: "{colors.night-field}"
    textColor: "{colors.body-slate}"
    rounded: "{rounded.square}"
    padding: "clamp(4rem, 8vw, 7rem)"
---

# Design System: Tailspin Shelter

## Overview

**Creative North Star: "The Tailspin Flight Plan"**

Tailspin is a practical, technical world built from a deep slate field, decisive cobalt actions, bone-white headings, and thin structural lines. It should feel capable and instructional rather than corporate or decorative: information is arranged so a person can understand the current state, take the next action, and recover when something goes wrong.

The system has two related expressions. The [Tailspin Shelter application](app/client/src/) uses familiar app conventions: centered content, rounded containers, responsive card grids, semantic status chips, and modest hover lift. The [attendee workshop guide](docs/index.html) uses the same palette and type character in a stricter reading mode: a persistent route, flat full-width instruction plates, square actions, and visible outcome checkpoints. The guide's sticky timeline rail and module composition are surface-specific teaching tools, not a template for every Tailspin screen.

**Key Characteristics:**

- Slate fields establish one continuous dark environment.
- Cobalt identifies primary actions, active route state, and instructional emphasis.
- Bone headings and restrained body contrast keep dense technical content readable.
- Thin borders and route lines explain structure before shadows do.
- App screens may use rounded, lifted cards; workshop instruction plates stay flat and grounded.
- Surface composition follows the task while the palette, typography, contrast, and directness remain shared.

## Colors

The palette moves from near-black slate through cool structural neutrals, with cobalt as the single dominant action voice and semantic colors reserved for meaning.

### Primary

- **Cobalt Action** (`#2563eb`): Primary buttons, active navigation, and the clearest next action.
- **Cobalt Deep** (`#1d4ed8`): Hovered primary actions, the app header, and the workshop setup band.
- **Route Blue** (`#60a5fa`): Timeline lines, route nodes, module numbers, selected borders, and core-work emphasis.
- **Link Blue** (`#93c5fd`): Text links, outcomes, and lower-intensity instructional emphasis.

### Secondary

- **Demo Violet** (`#a78bfa`): Facilitator-led or prepared demonstration paths; never a competing general-purpose action color.
- **Success Green** (`#4ade80`): Available or successful states.
- **Checkpoint Amber** (`#fcd34d`): Recovery prompts, keyboard focus, and moments that require attendee attention.
- **Danger Red** (`#f87171`): Error and unavailable states in the application.

### Neutral

- **Deep Night** (`#080d18`): Sticky chrome, finishing surfaces, and the deepest page layer.
- **Night Field** (`#0f172a`): Default page background and primary dark canvas.
- **Raised Slate** (`#151f34`): Alternating workshop bands and subtly raised regions.
- **Instruction Plate** (`#1e293b`): App containers, code fragments, jobs, notes, and recovery blocks.
- **Structural Line** (`#334155`): Borders and dividers that organize without becoming decoration.
- **Muted Slate** (`#64748b`): Secondary borders and disabled information.
- **Body Slate** (`#cbd5e1`): Default body copy.
- **Quiet Bone** (`#e2e8f0`): Higher-emphasis supporting text.
- **Bone** (`#f8fafc`): Headlines, active labels, and text on cobalt.

### Named Rules

**The One Cobalt Voice Rule.** Use cobalt for action and orientation; violet, green, amber, and red communicate specific meaning and must not become alternate brand accents.

**The Slate Continuity Rule.** Major surfaces remain in the slate family. A new hue must carry semantic information, not merely separate one section from another.

## Typography

**Display Font:** System UI sans-serif with platform-native fallbacks

**Body Font:** System UI sans-serif with platform-native fallbacks

**Label/Mono Font:** UI monospace for code, file paths, and keyboard-relevant technical values

**Character:** The system uses one familiar, highly legible sans-serif family and creates personality through scale, density, and strong weight rather than a decorative font pairing. Technical content should look immediate and trustworthy on every attendee device without a font download.

### Hierarchy

- **Display** (820, `clamp(3rem, 7vw, 6rem)`, 0.98): Workshop promise and rare high-impact statements; keep the measure near 12–13 characters.
- **Headline** (820, `clamp(2rem, 4vw, 3.25rem)`, 1.08): Module and major section headings.
- **Title** (700, `1.25rem`, 1.3): App card titles and compact content group headings.
- **Lead** (400, `clamp(1.1rem, 2vw, 1.3rem)`, 1.55): Hero introductions and page-level supporting promises.
- **Body** (400, `1rem`, 1.65): Explanations and instructions; instructional columns top out near 65–72 characters.
- **Label** (800, `0.8rem`, 0.06em): Timing, format, route stage, and compact metadata; uppercase only when the label acts as a category.
- **Mono** (400, `0.9em`, 1.5): Commands, workflow names, file paths, versions, and keyboard values.

### Named Rules

**The Native Clarity Rule.** Do not add a display face for personality alone. Tailspin earns character through confident hierarchy and exact instructional language.

**The Short Promise Rule.** Large display text carries one outcome, not a paragraph; supporting detail belongs in the lead or body tier.

## Layout

The shared content frame is centered and broad, reaching roughly `78rem` or Tailwind's `max-w-7xl`, with responsive edge padding. App pages use conventional document flow and responsive one-, two-, and three-column grids where the data model benefits from scanning. Their content can sit in bounded cards because each dog or detail record is an independent object.

The workshop guide is a route rather than an index. Its first viewport pairs the workshop promise with a vertical two-hour route, then transitions into full-width module plates. Above `56rem`, each module reserves a `12rem` metadata rail whose timing, module number, and format remain sticky while the instruction body moves. At and below `56rem`, the rail returns to normal flow and the hero becomes one column; below `40rem`, comparisons and job diagrams collapse to a single vertical path. The sticky header keeps the current module visible and horizontally scrolls its route controls on narrow screens.

Spacing favors a small internal rhythm (`0.25rem` through `1.5rem`) inside components and generous section separation (`2rem` through `7rem`) between outcomes. Dense technical passages stay bounded near `72ch`; broad decorative whitespace never separates an instruction from the action it explains.

### Named Rules

**The Composition Belongs to the Task Rule.** Reuse Tailspin's visual language across surfaces, but do not copy the workshop's sticky rail and full-width module plates into ordinary application screens.

**The Route Must Survive Mobile Rule.** Preserve order, current position, and next action when columns collapse; responsive behavior may simplify geometry but never the learning sequence.

## Elevation & Depth

Tailspin is tonal and border-led by default. The workshop guide stays deliberately flat: alternating slate fields, one-pixel dividers, inset colored rails, and line diagrams communicate hierarchy. Shadows are reserved for sticky chrome and the primary setup action. The application can use soft card shadows, translucent slate fills, and a small hover lift because its repeated records need object separation and affordance.

### Shadow Vocabulary

- **Sticky Chrome** (`0 0.75rem 2rem rgba(0, 0, 0, 0.2)`): Separates the persistent workshop header from scrolling instructions.
- **Cobalt Action Glow** (`0 0.6rem 1.5rem rgba(37, 99, 235, 0.25)`): Supports the workshop's primary action only.
- **App Card Rest** (`shadow-lg`): Gives repeated dog and content cards modest separation from the page field.
- **App Card Hover** (`shadow-xl` with a low-opacity cobalt tint): Pairs with a small upward translation to show clickability.
- **Instruction Rail** (`inset 0.35rem 0` in route blue or demo violet): Marks core and demonstration modules without floating the plate.

### Named Rules

**The Flat Instruction Rule.** Workshop content is grounded at rest. Do not turn modules, steps, or comparisons into a decorative grid of floating cards.

**The App Object Rule.** Elevation is acceptable when it distinguishes an interactive application object; it is not a generic way to make every section feel important.

## Shapes

Shape communicates surface mode. The application uses gently rounded controls (`0.5rem`), containers (`0.75rem`), and fully rounded semantic chips. The workshop guide uses square buttons, square instruction plates, square code fragments, and straight borders so the page reads as a route and field manual. Circles are reserved for timeline nodes; the keyboard key treatment may use a shallow physical edge.

### Named Rules

**The Scoped Corners Rule.** Rounded app cards are not evidence that workshop modules should be rounded, and square workshop plates are not a mandate to flatten familiar application controls.

**The Circle Means Position Rule.** In the guide, circles belong to route nodes. Do not scatter circular decoration through unrelated content.

## Components

### Buttons

Actions are confident, compact, and text-led.

- **Guide Primary:** Square cobalt fill with bone text, a one-pixel cobalt border, and compact `0.7rem 1.15rem` padding.
- **Guide Secondary:** Square transparent surface with a muted slate border; the border shifts to route blue on hover.
- **App Primary:** Cobalt fill with bone text, gently rounded corners (`0.5rem`), and `0.75rem 1.5rem` padding.
- **Hover / Focus:** Primary cobalt deepens on hover. Keyboard focus uses a visible `3px` checkpoint-amber outline with a `4px` offset; never rely on color shift alone.

### Chips

- **App Status:** Fully rounded, compact, and semantically tinted. Available uses green, pending uses amber, and adopted uses red on a low-opacity matching background.
- **Guide Format Label:** Square, transparent, one-pixel current-color border, uppercase label typography, and semantic text color for hands-on, follow-along, or demonstration.
- **State:** Chips report status or participation mode; they are not decorative filters.

### Cards / Containers

- **App Card:** Rounded container (`0.75rem`) on a translucent instruction-plate surface, with a subtle structural border, `1.5rem` internal padding, and restrained hover lift when clickable.
- **App Detail / About Container:** Rounded, softly elevated, and bounded within the centered content frame.
- **Workshop Module Plate:** Full-width, square, border-separated, and arranged as a metadata rail plus a reading column. Alternate night-field and raised-slate only to maintain route rhythm.
- **Workshop Comparison:** Square cells separated by one-pixel structural lines; use this for direct conceptual comparison, not as a generic card grid.

### Navigation

The app header is a solid cobalt-deep bar with a simple title and two text links; hover underlines are enough. The workshop header is deep-night sticky chrome with a brand anchor, compact module controls, and a source link. Workshop controls use bone for the active step, body slate at rest, route-blue borders on hover, and a cobalt fill for `aria-current="step"`. On narrow screens, the route row scrolls horizontally instead of wrapping into an ambiguous grid.

### Workshop Route Rail

The route rail is the guide's signature component. A thin route-blue line connects small nodes beside paired stage verbs and outcomes. The first and last nodes are filled; intermediate nodes remain hollow. The rail appears in the first viewport as a promise and continues functionally through sticky module navigation and module metadata.

### Recovery and Notes

Recovery blocks use an instruction-plate background, structural border, and checkpoint-amber lead label. Notes use the same grounded plate without the amber escalation. In the cobalt setup band, the recovery surface becomes translucent deep night with a restrained bone border so it remains part of the setup context.

### Code and Keyboard Values

Inline code uses the mono tier, an instruction-plate fill, a structural border, and link-blue text. Keyboard values invert to bone with deep-night text and a short bottom edge to suggest a keycap. These treatments distinguish things to type from prose without introducing another component family.

## Do's and Don'ts

### Do:

- **Do** keep slate, cobalt, bone, and thin structural lines consistent across the app and guide.
- **Do** choose the composition that matches the task: scan-friendly cards for application records, continuous plates and a persistent route for live instruction.
- **Do** make the current state, next action, and recovery path visually explicit.
- **Do** preserve visible focus, semantic color meaning, readable line length, reduced-motion behavior, and mobile route order.
- **Do** reserve violet for facilitator demonstrations and amber for focus or recovery attention.

### Don't:

- **Don't** force the attendee guide's sticky rail or full-width module composition onto every Tailspin application screen.
- **Don't** turn workshop modules into a decorative grid of rounded cards, gradients, and hover effects.
- **Don't** flatten app records into anonymous full-width bands when independent objects need scanning and selection.
- **Don't** introduce competing accent colors or use semantic colors as general decoration.
- **Don't** hide essential instruction behind animation, hover-only behavior, or low-contrast glass effects.
