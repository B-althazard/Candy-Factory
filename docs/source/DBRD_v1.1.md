# Design & Branding Requirements Document v1.1

## Locked specification

## 1. Brand core

Candy Factory is a **professional creative workstation** for structured character creation, prompt engineering, and future AI-driven output workflows. The brand must communicate two things at the same time:

- **technical control**
- **creative output**

**Why:** the source direction is explicit that the app must function as a professional prompt tool, character dataset builder, visual design tool, and future AI pipeline surface, with mobile used for fast work and desktop used as a full workstation.

## 2. Identity system

Candy Factory requires a full identity system:

- **primary wordmark**
- **icon / monogram**
- **app icon variant**

The wordmark direction is now locked as:

- **customized geometric sans**
- **one distinctive character treatment**
- readable before decorative

The icon direction is now locked as:

- **abstract engine/core**
- combined with **creative output**
- not a human silhouette
- not a literal candy motif

**Why:** this preserves workstation credibility while giving the product its own recognizable mark language. A literal or character-centric icon would narrow the brand too early. A purely neutral technical mark would understate the product’s creative role.

## 3. Color system

### 3.1 Neutral foundation

The neutral base remains:

- `#282A29`
- `#F6F6F6`
- `#FFFFFF`

These continue to carry structure, spacing, surface hierarchy, and overall UI calm.

### 3.2 Locked accent model

The accent strategy is now:

- **Primary brand accent:** `#FF5571`
- **Companion/system accent:** `#5773FF`

### 3.3 Role assignment

`#FF5571` is the **primary brand accent** and should represent:

- brand signature
- major emphasis
- active highlights
- expressive/output-oriented cues
- selective hero moments

`#5773FF` is the **companion/system accent** and should represent:

- technical/system-oriented cues
- workspace/engine emphasis
- secondary analytical or informational highlights
- focus-adjacent and support accents

### 3.4 Constraint

This is **not** an equal-weight dual-accent system.

The hierarchy is:

1. neutrals define structure
2. `#FF5571` defines brand emphasis
3. `#5773FF` supports technical/system contrast

**Why:** this gives the product a more ownable signature while preserving workstation discipline. Pink alone risked becoming too expressive; blue alone risked becoming generic. Together, they map cleanly to the product’s creative + technical duality.

## 4. Accent usage policy

The accent usage policy is now locked as:

- **dark text/icons may be used on both base accents**
- **darker accent steps must exist for white-text components**
- both rules apply simultaneously

This means:

- white normal-size text should **not** be the default on `#FF5571` or `#5773FF`
- the design system must define darker accessible variants for buttons, badges, selected states, and any other white-text surfaces
- base accent values are brand anchors, not universal fill colors

**Why:** this preserves the chosen palette without weakening WCAG 2.2 AA compliance.

## 5. Visual direction

The visual direction remains locked as:

- hyper-modern
- sleek
- design-oriented
- high-clarity
- workstation-first
- premium but restrained
- subtle polish, not ornament

It must avoid:

- playful candy literalism
- generic enterprise admin-panel styling
- flat-basic UI
- skeuomorphic styling

The current product direction already requires a custom identity system, advanced-professional interaction, and a scalable workstation model across mobile and desktop.

## 6. Imagery direction

Imagery is locked as a hybrid model:

- **abstract brand/system visuals** for shell, install, and marketing contexts
- **controlled character showcases** for product-value demonstration

**Why:** this avoids two failure modes:

- becoming too abstract and cold
- becoming too character-franchise-specific

## 7. Voice and copy

The copy direction remains locked as:

- **professional core**
- **selective creative emphasis**

UI copy should be:

- direct
- operationally clear
- deterministic
- concise

Brand copy may carry slightly more character, but core workflow language must remain explicit and stable.

**Why:** the product is advanced and design-oriented, but still a workstation. Purely technical copy would feel dry; purely expressive copy would reduce clarity.

## 8. Motion posture

Motion is now locked as:

- **minimal**
- **precise micro-feedback**
- no expressive motion system as a core identity layer

This applies to:

- hover/press feedback
- active-state transitions
- panel open/close
- tab changes
- floating panel behavior
- workspace mode transitions

**Why:** the product needs polish, but motion must not compete with long-session editing or accessibility requirements.

## 9. Accessibility requirements

Accessibility remains locked as:

- **WCAG 2.2 AA**
- **reduced motion support**
- **keyboard-first desktop support**

Color, focus, motion, and interaction states must be designed into the brand system from the start. This is especially important because the product is moving toward multi-pane desktop operation and mobile floating-panel behavior.

## 10. Theme requirements

Theme support remains mandatory in:

- **Light**
- **Dark**
- **Native**

These must behave as one identity family. The current concept explicitly requires Light, Dark, and Native modes, with tokenized switching and persistence.

The new color system must therefore include:

- accessible tonal ramps for both accents
- theme-safe surface/application rules
- consistent brand recognition across all three modes

## 11. Implications for the design system

This branding decision directly implies the next document must define:

- accent ramps for `#FF5571`
- accent ramps for `#5773FF`
- semantic state colors separate from brand accents
- text-on-accent rules
- focus ring rules
- selected/active/hover token rules
- theme mapping rules for Light/Dark/Native
- chart/data-vis usage rules for pink vs blue
- motion durations and easing for micro-feedback only

**Why:** the palette is now strategically correct, but implementation will fail if token governance is loose.

## 12. Acceptance criteria for Document 1

Document 1 is complete only if future design work preserves all of the following:

- Candy Factory reads as a **professional creative workstation**
- the identity system includes **wordmark + icon/monogram + app icon**
- the icon expresses **engine/core + creative output**
- the palette uses **`#FF5571` primary** and **`#5773FF` companion/system**
- the accents are **hierarchical**, not equal-weight
- dark text on accent and darker white-text variants are both supported
- Light/Dark/Native remain one coherent identity family
- motion stays minimal and precise
- accessibility remains WCAG 2.2 AA compliant

## 13. Final assessment

This is a good direction.

**Why it works:**

- the neutrals preserve control and longevity
- `#FF5571` gives the brand distinctiveness and creative energy
- `#5773FF` restores technical balance
- the pair matches the actual product promise better than a single cool accent
- the remaining risk is not branding risk; it is **token-discipline risk**, which belongs in the next document

## 14. Status

**Design & Branding Requirements Document:** complete at strategic level.