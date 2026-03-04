# Design System Scaling Specification ‒ Version: 1.0

## Candy Factory

**Version:** 1.0
**Status:** Locked at system level
**Scope:** Token architecture, theme mapping, responsive behavior, component model, state rules, accessibility, and governance for scalable UI implementation

This document converts the approved brand direction into a scalable design system. It is based on the confirmed product model: desktop as a multi-pane workstation, mobile with two modes, Light/Dark/Native themes, and a tokenized UI foundation already present in the current app direction.

## 1. Purpose

Candy Factory can no longer scale screen-by-screen. The design system must become the single source of truth for:

- visual tokens
- semantic UI meaning
- reusable components
- responsive mode behavior
- accessibility rules
- theme behavior

**Why:** the source direction already separates schema, interaction, and workspace layers, and explicitly calls for tabs, FAB + floating panels, pane containers, splitters, dock zones, theme abstraction, and layout persistence. Without a formal system, each new feature would reintroduce visual drift and implementation churn.

---

## 2. Locked system decisions

The following decisions are now fixed.

### 2.1 Spacing base

**Locked:** **4pt base**

**Why:** Candy Factory must support both compact desktop workstation density and mobile usability. A 4pt system provides finer control than an 8pt-only system while still remaining orderly and easy to govern.

### 2.2 Accent ramp depth

**Locked:** **5-step ramps** for each accent family

Structure:

- 100
- 300
- 500
- 700
- 900

**Why:** this is enough range for Light, Dark, and Native themes, plus selected states, subtle fills, borders, focus treatments, and darker accessible action states without overbuilding the first production system.

### 2.3 Accessible darker action steps

**Locked now:** yes

Initial locked darker action tokens:

- **brand-pink-700:** `#EE0027`
- **system-blue-700:** `#4665FF`

These values were previously established as the first accessible darker action steps because they allow white text to meet normal-text AA contrast:

- `#FFFFFF` on `#EE0027` → **4.50:1**
- `#FFFFFF` on `#4665FF` → **4.60:1**

**Why:** the base accent colors do not safely support white body-size text. Locking darker action steps now prevents the component system from remaining structurally incomplete.

### 2.4 Breakpoint model

**Locked:** **2-mode responsive model**

- mobile
- desktop

**Why:** Candy Factory’s product model is mode-driven, not marketing-site responsive. The confirmed app structure is explicit about mobile default, mobile workstation, and desktop workstation. A tablet-specific layer can be added later if actual product behavior requires it.

---

## 3. Foundation architecture

The design system is organized into five layers.

### 3.1 Primitive tokens

Raw values only:

- color primitives
- type primitives
- spacing primitives
- radius primitives
- elevation primitives
- motion primitives
- border/stroke primitives

### 3.2 Semantic alias tokens

Product meaning, not raw value:

- page background
- panel surface
- elevated surface
- text primary
- text secondary
- border subtle
- border strong
- action primary
- action secondary
- selection
- focus
- success
- warning
- danger
- info
- overlay
- disabled

### 3.3 Component tokens

Component-level mapping:

- button tokens
- input tokens
- tab tokens
- card tokens
- pane tokens
- floating panel tokens
- modal tokens
- FAB tokens
- badge/chip tokens

### 3.4 Pattern tokens

Layout and workspace patterns:

- shell spacing
- pane gap
- tab bar height
- header height
- footer/status height
- overlay insets
- dock gap
- floating panel edge offset

### 3.5 Mode/theme mapping

The same semantic system must map into:

- Light
- Dark
- Native
- Mobile Default
- Mobile Workstation
- Desktop Workstation

**Why:** the source direction explicitly requires token abstraction, CSS variable mapping, theme persistence, and workspace-mode separation.

---

## 4. Current baseline that must be preserved

The design system must preserve and extend the verified baseline already present in the concept and current app direction:

- **Typeface baseline:** Noto Sans
- **Neutral foundation:** `#282A29`, `#F6F6F6`, `#FFFFFF`
- **Soft radius language**
- **Soft elevation**
- **Tokenized CSS structure**
- **Reusable utility/layout classes**
- **Reusable card / button / input / badge primitives**

**Why:** replacing the baseline unnecessarily would create churn. The correct move is controlled expansion.

---

## 5. Color system specification

## 5.1 Locked neutral foundation

- **ink / base dark:** `#282A29`
- **base light surface:** `#F6F6F6`
- **white / high surface:** `#FFFFFF`

These remain the structural colors. They control background hierarchy, panel separation, and text contrast.

## 5.2 Locked accent hierarchy

- **Primary brand accent / 500:** `#FF5571`
- **Companion system accent / 500:** `#5773FF`

This is not an equal-weight dual-accent system.

Priority order:

1. neutrals define structure
2. pink defines brand emphasis
3. blue defines technical/system contrast

**Why:** this maps directly to the approved identity model: creative output plus technical engine/workstation.

## 5.3 Locked accessible action tokens

- **brand-pink-700:** `#EE0027`
- **system-blue-700:** `#4665FF`

These must be used where white text/icons are required on accent fills.

## 5.4 Accent role rules

### `#FF5571` / brand-pink

Use for:

- primary brand emphasis
- active brand-highlighted selection
- expressive/output-oriented emphasis
- hero CTA moments only where component rules support it
- chart emphasis where “creative/output” is the intended meaning

### `#5773FF` / system-blue

Use for:

- technical/system-oriented emphasis
- workspace/system affordances
- secondary analytical or informational emphasis
- support accents
- companion chart series

### Constraint

These two colors must **not** replace semantic state colors.

**Why:** the accents communicate identity and product duality, not full application state meaning.

## 5.5 Required 5-step ramp structure

For both accent families, the design system must contain:

- 100
- 300
- 500
- 700
- 900

### Locked now

- pink-500 = `#FF5571`
- pink-700 = `#EE0027`
- blue-500 = `#5773FF`
- blue-700 = `#4665FF`

### Not locked yet

- 100
- 300
- 900

These are required system slots, but their exact HEX values are not yet user-approved and therefore are not fixed in this document.

**Why:** the structure is finalized, while undefined values remain intentionally open rather than invented.

---

## 6. Typography system specification

### 6.1 Base typeface

**Locked:** Noto Sans remains the UI typeface baseline.

### 6.2 Type roles

The system must define named roles instead of screen-local font sizes:

- display
- page title
- pane title
- section title
- field label
- body
- body-strong
- meta/caption
- button label
- tab label
- monospace/system-output label if later required

### 6.3 Type behavior rules

- Typography must optimize for long-session readability.
- Desktop pane headers and controls must remain compact but legible.
- Labels must remain stable under dense workspace conditions.
- Type hierarchy must be consistent across Light, Dark, and Native.

**Why:** Candy Factory is a workstation. Hierarchy inconsistency becomes a usability problem faster in multi-pane products than in simple mobile flows.

---

## 7. Spatial system specification

## 7.1 Locked spacing model

The spatial scale is now governed by a **4pt base**.

Required core spacing set:

- 4
- 8
- 12
- 16
- 20
- 24
- 28
- 32
- 40
- 48
- 64

These are system slots, not arbitrary examples.

**Why:** this supports both small control density and larger workstation spacing without mixed ad hoc measurements.

## 7.2 Radius system

Radius must preserve the current soft-modern language and cover:

- small controls
- standard controls
- cards
- floating panels
- modal surfaces
- FAB surfaces

### Rule

Radius must increase with surface hierarchy, but remain within one visual family.

## 7.3 Elevation system

Minimum required elevation tiers:

- base / flat
- card
- floating control
- floating panel
- modal
- drag/dock emphasis

**Why:** the source direction explicitly calls for a polished, sleek interface with soft shadows and advanced workspace affordances rather than flat-basic styling.

---

## 8. Motion specification

### 8.1 Locked motion posture

**Locked:** minimal + precise micro-feedback

### 8.2 Motion must exist for

- hover
- press
- focus transitions
- tab changes
- panel reveal/hide
- modal entry/exit
- bottom-sheet entry/exit
- floating panel visibility changes
- drag/dock affordances

### 8.3 Motion rules

- no expressive motion layer
- no decorative long-duration transitions
- reduced motion must remove or shorten non-essential movement
- motion must improve orientation and state comprehension

**Why:** the product needs polish, but it is still a workstation and must meet the approved accessibility target.

---

## 9. Responsive and mode specification

## 9.1 Locked responsive model

**2-mode system**

- mobile
- desktop

## 9.2 Product modes inside that model

### Mobile

Two product behaviors are required:

- **Mobile Default**: purpose-grouped tabs
- **Mobile Workstation**: FAB-triggered floating panels with state persistence

### Desktop

- multi-pane workstation
- multiple editors and outputs
- layout persistence
- named layouts
- multiple open characters

These are confirmed product requirements.

## 9.3 Layout token responsibilities

The system must define tokens for:

- shell padding
- top bar spacing
- footer/status spacing
- tab bar spacing
- pane gap
- dock gap
- floating panel inset
- overlay safe margins
- content max-width where applicable

**Why:** responsive behavior in Candy Factory is primarily about workspace mode and region management, not only screen width.

---

## 10. Component system specification

The system must scale through reusable components, not page-specific styling.

## 10.1 Core components

Required baseline:

- Button
- Icon Button
- Utility Button
- Input
- Select
- Textarea
- Card
- Label
- Badge
- Inline meta/status text

## 10.2 Advanced field and state components

Required:

- Multi-select chips
- Segmented control
- Lock indicator
- Inline validation
- Toast / status feedback

## 10.3 Navigation and shell components

Required:

- Top bar
- Footer / status bar
- Character switcher
- Layout selector
- Theme selector
- Tabs
- FAB

## 10.4 Workspace components

Required:

- Pane container
- Pane header
- Floating panel
- Modal
- Bottom sheet
- Dockable pane
- Splitter
- Dock zones
- Preset manager modal

These components are explicitly identified in the product direction as required primitives for scaling.

## 10.5 Future-compatible workspace modules

The design system must remain ready for:

- preview pane
- batch runner
- validation inspector
- logs
- schema inspector
- AI pipeline pane

---

## 11. State matrix specification

Every reusable component must declare only relevant states, but the system-wide vocabulary is:

- default
- hover
- focus-visible
- active / pressed
- selected
- disabled
- invalid
- locked
- read-only
- loading
- open
- dragging / docking
- empty
- error

### Rules

- selected and active must not collapse into one visual treatment
- locked must not look identical to disabled
- invalid must be visible in all themes
- focus-visible is mandatory on desktop
- color cannot be the only state signal

**Why:** the product is both advanced and keyboard-capable, so state ambiguity will directly damage workflow speed and accessibility.

---

## 12. Theme system specification

## 12.1 Theme architecture

Themes must be token-mapped, not component-duplicated.

A component must inherit from semantic tokens such as:

- `surface-panel`
- `text-primary`
- `action-primary`
- `focus-ring`

not from theme-specific hard-coded colors.

## 12.2 Required themes

- Light
- Dark
- Native

These are confirmed product requirements, with token switching and persistence explicitly called for.

## 12.3 Theme consistency rule

All three themes must remain one identity family.

Recognition must come from:

- structure
- typography
- accent hierarchy
- component shape
- state behavior

not from separate aesthetic systems.

---

## 13. Accessibility specification

### 13.1 Locked baseline

- **WCAG 2.2 AA**
- **reduced motion**
- **keyboard-first desktop support**

### 13.2 System implications

- focus rings are mandatory
- text-on-accent rules must be explicit
- selected, invalid, locked, and disabled must remain distinguishable
- floating panels, modals, and bottom sheets must preserve accessible interaction behavior
- state meaning must not depend on color alone

### 13.3 Accent-specific accessibility rule

For normal-size white text/icons on accent-filled surfaces:

- use `#EE0027` instead of `#FF5571`
- use `#4665FF` instead of `#5773FF`

**Why:** the base accent values are suitable as brand anchors and emphasis colors, but not as universal white-text action fills.

---

## 14. Governance rules

These rules are mandatory.

1. No raw HEX values inside feature components
2. No raw spacing values in product screens unless tokenized
3. No new radii, shadows, or borders outside the token system
4. No screen-specific component variants unless promoted into the shared system
5. No theme-specific one-off styling without semantic token mapping
6. No new state styling outside the approved state matrix

**Why:** without governance, the design system becomes documentation only and the product will regress into local overrides.

---

## 15. Implementation order

This design system should be applied in this order:

### Phase A — workstation-critical

- Tabs
- FAB + FloatingPanel
- Modal
- Pane container
- Splitter + Dock zones

### Phase B — advanced ergonomics

- BottomSheet
- Preview surface / preview pane
- Toast + validation polish

This order matches the confirmed product direction and the already identified missing primitives.

---

## 16. Acceptance criteria

This document is satisfied only if all of the following remain true:

- one token architecture governs all product modes
- mobile and desktop use the same system family
- the spacing system is 4pt-based
- each accent family is structured as a 5-step ramp
- pink remains primary brand emphasis
- blue remains companion/system emphasis
- darker accessible accent steps exist for white-text action usage
- semantic states remain separate from brand accents
- Light, Dark, and Native are token-mapped, not independently styled
- workstation primitives are present or implemented in the approved order
- accessibility remains WCAG 2.2 AA compliant

---

## 17. Final assessment

This document is now structurally complete.

**Why this is sufficient to move forward:**

- the system architecture is fixed
- the responsive model is fixed
- the component taxonomy is fixed
- the accessibility model is fixed
- the color hierarchy is fixed
- the first action-safe accent steps are fixed

**What remains intentionally open:**

- full 100/300/900 accent HEX values
- exact type size ladder beyond the current verified baseline
- exact radius/elevation numeric ladder
- exact semantic state HEX palette

Those are implementation-detail tokens, not blockers for product planning.

## 18. Status

**Design System Scaling Specification:** complete at v1.0