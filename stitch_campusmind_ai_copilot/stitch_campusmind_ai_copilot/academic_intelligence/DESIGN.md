---
name: Academic Intelligence
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#464555'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#005338'
  on-tertiary: '#ffffff'
  tertiary-container: '#006e4b'
  on-tertiary-container: '#67f4b7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Outfit
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-xl:
    fontFamily: Outfit
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Outfit
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Outfit
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Outfit
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Outfit
    fontSize: 16px
    fontWeight: '500'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  label-md:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  code-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: -0.01em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes an ultra-clean, high-density academic operating environment that pairs the structured precision of modern developer tools with the quiet refinement of institutional hardware interfaces. Tailored for university students, faculty, and administrators navigating complex degree paths, schedules, and institutional knowledge, the UI instills clarity, cognitive calm, and deliberate focus.

The visual style blends precision minimalism with restrained glassmorphic accents:
- **Foundational Canvas:** Crisp `#F8FAFC` slate canvas overlaid with modular `#FFFFFF` cards, framed by surgical 1px borders.
- **AI Aura:** Synthetic intelligence states are rendered through directional indigo-to-violet linear gradients, micro-glows, and frosted glass backdrops rather than skeuomorphic voice bubbles.
- **Academic Authority:** Dense typographic hierarchies, structured metadata tables, and compact interactive triggers replace decorative consumer tropes, evoking a high-performance productivity cockpit.

## Colors

The palette balances clinical legibility with contextual status indicators. Tinted neutrals provide depth without adding visual weight.

### Palette Architecture
- **Primary Indigo (`#4F46E5`):** Drives primary actions, system-critical highlights, focused input rings, and active navigation nodes.
- **Secondary Violet (`#7C3AED`):** Dedicated to copilot synthesis, generative study paths, query suggestions, and AI-assisted automations. Frequently paired with Indigo in subtle 135-degree linear gradients (`linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`).
- **Tertiary Emerald (`#10B981`):** Quantifies verified attendance rates, safe thresholds, submitted coursework, and passing grades.
- **Warning Amber (`#F59E0B`):** Flags institutional circulars, registrar deadlines, pending evaluations, and unverified enrollments.
- **Destructive Rose (`#EF4444`):** Identifies academic holds, schedule conflicts, overdue tuition, and critical campus alerts.
- **Neutral Core:** High-contrast text anchors in Slate-900 (`#0F172A`), running secondary copy in Slate-600 (`#475569`), supporting metadata in Slate-500 (`#64748B`), and fine structural lines in Slate-200 at 80% opacity (`rgba(226, 232, 240, 0.8)`).

## Typography

Typographic scale is strictly split between geometric architectural titles (`Outfit`) and neutral, metric-optimized reading bodies (`Inter`).

- **Display & Headings:** Rendered in `Outfit` with tight tracking (`-0.025em` to `-0.01em`) to maintain sharp silhouette edges in dashboards, section banners, and modal headers.
- **Body & Data Grid:** Rendered in `Inter` for optimal tabular reading, high-density schedules, and continuous copilot responses. 
- **Tabular Numerics:** Enable `tnum` (tabular figures) across all grade tables, attendance counters, and calendar schedules to guarantee vertical column alignment.
- **Labels & Micro-Badges:** Small labels (`label-sm`) utilize an uppercase transform with expanded tracking (`0.04em`) to establish instant visual anchor points across dense administrative cards.

## Layout & Spacing

The structural layout uses a responsive 12-column fluid grid governed by rigid safe zones and modular side docks.

### Grid & Breakpoints
- **Mobile (0–767px):** 4-column layout, `margin: 1rem`, `gutter: 1rem`. Copilot collapses to a floating bottom action sheet; navigation migrates to a pinned bottom bar.
- **Tablet (768–1199px):** 8-column layout, `margin-md: 2rem`, `gutter-md: 1.5rem`. Global navigation docks into an icon-only persistent rail (64px wide).
- **Desktop (1200px+):** 12-column layout, `margin-lg: 3rem`, `gutter-lg: 2rem`. Features a dual-rail workspace: persistent left navigation (260px), central flexible canvas, and a context-aware copilot right panel (380px fixed width).

### Layout Rules
- **Split-Screen Authentication:** 50/50 vertical division on screens ≥ 1024px. The left viewport anchors ambient academic data graphics with frosted copilot previews; the right viewport houses a focused, single-column input cluster.
- **Alignment:** Visual baselines must align strictly to an 8px rhythm. Component internal padding relies exclusively on `space-xs` through `space-xl`.

## Elevation & Depth

Depth is defined by physical layering and atmospheric translucency rather than heavy dark shadows.

### Surface Tiers
- **Base Canvas (Level 0):** Pure Slate-50 (`#F8FAFC`). Flat background across all viewports.
- **Stacked Cards (Level 1):** Solid white (`#FFFFFF`) with a 1px border of `rgba(226, 232, 240, 0.8)`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.03), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`.
- **Floating Controls & Hover States (Level 2):** Solid white cards elevated with `0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.04)`.
- **Modals, Drawers & Flyouts (Level 3):** Frosted glass surfaces (`rgba(255, 255, 255, 0.92)` with `backdrop-filter: blur(12px)`) encircled by fine structural borders (`rgba(226, 232, 240, 0.9)`). Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.

### Copilot Translucency
Copilot search triggers and interactive agent prompts employ a signature AI surface treatment: `rgba(255, 255, 255, 0.75)` backdrop fill, `16px` blur radius, and a dual-border effect composed of a 1px solid stroke (`rgba(124, 58, 237, 0.15)`) complemented by a top inner highlight (`inset 0 1px 0 0 rgba(255, 255, 255, 0.9)`).

## Shapes

The interface employs a balanced curvature system (`roundedness: 2`) that balances institutional precision with approachable modern software aesthetics.

- **Base Radius (`0.5rem` / `8px`):** Standard for form inputs, dropdown menus, button components, and sub-cards inside data grids.
- **Large Radius (`rounded-lg: 1rem` / `16px`):** Standard for primary dashboard panels, calendar views, contextual AI insight modules, and multi-step dialogs.
- **Pill Geometry (`rounded-full` / `9999px`):** Exclusively reserved for status badges, attendance chips, filter toggles, copilot text-prompt bars, and academic tagging indicators.
- **Dividers:** Horizontal and vertical separator strokes are strictly 1px wide, rendered in `rgba(226, 232, 240, 0.8)`.

## Components

### Buttons
- **Primary Action:** Solid Indigo (`#4F46E5`) with pure white text, 8px radius, `h-10` or `h-9` height, `px-4` padding. Subtle micro-shadow (`0 1px 2px rgba(79, 70, 229, 0.2)`). Hover: `#4338CA`. Active: `#3730A3`.
- **Copilot Action:** Linear gradient (`135deg, #4F46E5 0%, #7C3AED 100%`) with white text and a glowing 1px border (`rgba(255, 255, 255, 0.3)`). Hover: brightness filter 1.05.
- **Secondary / Ghost:** White background, 1px border in `rgba(226, 232, 240, 0.8)`, text in Slate-900. Hover: background Slate-50 (`#F8FAFC`), border Slate-300.
- **Destructive:** Subtle Rose tint surface (`#FEF2F2`), Rose text (`#EF4444`), 1px border (`#FECACA`). Hover: solid `#EF4444` with white text.

### Chips & Badges
- **Pill Structure:** Height `24px`, padding `0 10px`, radius `9999px`, font `label-sm`.
- **Attendance / Success Chip:** Background `#ECFDF5`, text `#065F46`, left-aligned 6px dot indicator `#10B981`.
- **Circulars / Warning Chip:** Background `#FFFBEB`, text `#92400E`, left-aligned 6px dot indicator `#F59E0B`.
- **Critical / Danger Chip:** Background `#FEF2F2`, text `#991B1B`, left-aligned 6px dot indicator `#EF4444`.
- **AI Suggested Filter Chip:** Frosted glass surface (`rgba(255, 255, 255, 0.8)`), border in `rgba(124, 58, 237, 0.25)`, text `#6D28D9`, subtle shimmer on hover.

### Form Inputs
- **Base Input:** Height `40px`, padding `0 12px`, background `#FFFFFF`, border `1px solid rgba(226, 232, 240, 0.8)`, radius `8px`, typography `body-md`, placeholder in Slate-400 (`#94A3B8`).
- **Focus Ring:** 0 0 0 3px `rgba(79, 70, 229, 0.12)`, border-color `#4F46E5`, outline none.
- **Copilot Prompt Bar:** Height `52px`, rounded pill (`9999px`), frosted glass backdrop, left icon slot for Copilot Sparkle, right slot for multi-modal attachment and dynamic submit arrow.

### Checkboxes & Radio Controls
- **Checkboxes:** 16px × 16px square, radius `4px`, border `1.5px solid #CBD5E1`. Checked state: background `#4F46E5`, border `#4F46E5`, crisp white check icon. Focus: ring 2px `rgba(79, 70, 229, 0.2)`.
- **Radio Buttons:** 16px × 16px circle, border `1.5px solid #CBD5E1`. Selected state: border `#4F46E5`, containing a centered 6px solid `#4F46E5` disc.

### Cards & Panels
- **Standard Card:** Background `#FFFFFF`, border `1px solid rgba(226, 232, 240, 0.8)`, radius `16px`, padding `1.5rem`. Header zones separate via internal 1px horizontal rules.
- **Copilot Intelligence Card:** Background `linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.95) 100%)`, border `1px solid rgba(124, 58, 237, 0.2)`, accent gradient tab on the top-left boundary, frosted backdrop blur.

### Modals & Dialogs
- **Backdrop:** Tinted veil in `rgba(15, 23, 42, 0.4)` with 4px backdrop blur.
- **Dialog Surface:** Centered presentation, radius `16px`, max-width options `480px` (confirmation) or `720px` (deep course audit/circular viewer), padding `1.5rem` to `2rem`. Frosted white layer with persistent, high-contrast action bars locked to the bottom margin.