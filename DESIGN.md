---
name: Aeronautical Elite
colors:
  surface: '#101415'
  surface-dim: '#101415'
  surface-bright: '#363a3b'
  surface-container-lowest: '#0b0f10'
  surface-container-low: '#191c1e'
  surface-container: '#1d2022'
  surface-container-high: '#272a2c'
  surface-container-highest: '#323537'
  on-surface: '#e0e3e5'
  on-surface-variant: '#c6c6cd'
  inverse-surface: '#e0e3e5'
  inverse-on-surface: '#2d3133'
  outline: '#909097'
  outline-variant: '#45464c'
  surface-tint: '#c0c6db'
  primary: '#c0c6db'
  on-primary: '#293040'
  primary-container: '#111827'
  on-primary-container: '#7a8194'
  inverse-primary: '#575e70'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#b7c8e1'
  on-tertiary: '#213145'
  tertiary-container: '#07192c'
  on-tertiary-container: '#72829a'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#dce2f7'
  primary-fixed-dim: '#c0c6db'
  on-primary-fixed: '#141b2b'
  on-primary-fixed-variant: '#404758'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#d3e4fe'
  tertiary-fixed-dim: '#b7c8e1'
  on-tertiary-fixed: '#0b1c30'
  on-tertiary-fixed-variant: '#38485d'
  background: '#101415'
  on-background: '#e0e3e5'
  surface-variant: '#323537'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 60px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-xl-mobile:
    fontFamily: Playfair Display
    fontSize: 42px
    fontWeight: '700'
    lineHeight: '1.1'
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  gutter: 24px
  lg: 48px
  xl: 80px
  container-max: 1280px
  margin-mobile: 16px
---

## Brand & Style
The design system is engineered for an exclusive audience of business aviation leaders, high-net-worth individuals, and industry innovators. The brand personality is **authoritative, precise, and unapologetically premium**. It bridges the gap between the heritage of luxury travel and the cutting-edge technology of modern avionics.

The visual style employs a **Sophisticated Glassmorphism** approach nested within a **Corporate Modern** framework. This creates an environment that feels both grounded and ethereal—mimicking the sensation of looking through a cockpit window at dusk. The UI utilizes deep atmospheric depths, translucent layers, and high-precision typography to evoke an emotional response of trust, exclusivity, and forward-looking ambition.

## Colors
The palette is centered on a "Midnight Horizon" theme. **Deep Navy (#111827)** serves as the primary canvas, providing a stable, high-contrast background that reduces eye strain and emphasizes depth. **Emerald Green (#10B981)** is the signature accent, used sparingly for calls to action, success states, and data visualizations to represent growth and ecological innovation in aviation.

**Slate Grays** bridge the gap between the navy and the text, providing structural hierarchy. Interactive elements utilize a **High-Contrast White (#F8FAFC)** for maximum legibility. Subtle emerald glows are used as "environmental lighting" to guide the user’s eye toward primary conversion points without breaking the dark-mode immersion.

## Typography
The typography strategy pairings high-fashion editorial aesthetics with functional precision. **Playfair Display** is reserved for headlines and large-scale display text; its high-contrast strokes and elegant serifs communicate a sense of heritage and bespoke service.

**Manrope** is used for all functional UI elements, body copy, and data. Its geometric yet friendly construction ensures clarity across varying screen densities. Label styles use a generous letter-spacing and uppercase styling to mimic the technical markings found in aviation instrumentation. For mobile devices, headline sizes scale down aggressively to maintain a single-column focus without sacrificing the editorial impact.

## Layout & Spacing
This design system utilizes a **12-column fixed grid** for desktop, centered within a maximum container width of 1280px. This creates "breathing room" on the flanks, essential for the luxury aesthetic. The spacing rhythm is strictly based on an **8px linear scale**, ensuring mathematical harmony across all components.

Layouts should favor asymmetric balance, with generous vertical whitespace (`xl` spacing) between major sections to prevent information density from overwhelming the executive user. On mobile devices, the 12-column grid collapses to a single-column layout with 16px side margins, ensuring touch targets remain accessible while maintaining the premium feel through large typography.

## Elevation & Depth
Depth is the primary storyteller in this system. Rather than traditional drop shadows, we use **Glassmorphism and Tonal Layers**. 

1.  **Background Layer:** The Deep Navy base.
2.  **Surface Layer:** Semi-transparent Navy (80% opacity) with a `20px` backdrop blur and a `1px` stroke (White at 10% opacity) to define edges.
3.  **Floating Layer:** Used for modals and dropdowns, featuring a slightly more vibrant backdrop blur and a subtle **Emerald glow** (`box-shadow: 0 0 20px rgba(16, 185, 129, 0.15)`).

This hierarchy creates a "cockpit" feel where the most important information appears to be floating closer to the user, illuminated by internal instrumentation lights.

## Shapes
The shape language is **Technical and Soft**. We utilize "Soft" roundedness (Level 1) to strike a balance between the sharp, machined edges of aircraft engineering and the comfortable, organic curves of luxury interiors. 

Standard components (buttons, inputs) use a `4px` (0.25rem) radius. Larger containers and cards use `8px` or `12px` to feel more substantial and inviting. This subtle rounding prevents the interface from feeling "brutal" while maintaining a level of professional sharpness that signifies high-stakes business.

## Components

### Buttons
Primary buttons are solid Emerald Green with high-contrast navy text. They feature a subtle "inner glow" on hover. Secondary buttons utilize the "Ghost" style—a glassmorphic surface with a white border and emerald text. All buttons should have a minimum height of 48px to ensure executive-level ease of use.

### Cards
Cards are the primary container for content. They must use the **Glassmorphism** treatment: a dark translucent background, a light border on the top and left to simulate a light source, and a heavy backdrop blur. Hovering over a card should increase the opacity of the emerald glow shadow.

### Inputs & Forms
Input fields are dark with a 1px Slate border. Upon focus, the border transitions to Emerald Green with a soft outer glow. Labels are always positioned above the field in the `label-md` uppercase style.

### Navigation
The navigation bar is a fixed glassmorphic element at the top of the viewport. It uses a `backdrop-filter: blur(12px)` to ensure that content scrolling underneath remains legible but secondary to the navigation controls.

### Chips & Badges
Chips are used for session categories (e.g., "Sustainability," "Logistics"). They feature a low-opacity emerald fill with a solid emerald border, ensuring they stand out against the navy background without competing with primary buttons.
