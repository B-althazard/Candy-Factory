# Product Requirements Document ‒ Version: 1.0

## Candy Factory

**Version:** 1.0

**Status:** Locked for product planning

**Release framing:** First production release defined

This PRD converts the approved brand and design-system direction into a product definition. It is grounded in the confirmed concept: Candy Factory must serve four roles at once—prompt engineering tool, character dataset builder, visual character design tool, and schema-based AI pipeline interface—while adapting behavior by device context rather than splitting into separate products. Mobile is for shorter edits and tests; desktop is the full workstation.

## 1. Product definition

Candy Factory is a **local-first professional creative workstation** for structured character creation and output generation. Its current and planned value is not only schema entry, but repeatable creation, refinement, comparison, saving, reopening, and export of multiple character configurations across mobile and desktop modes. The concept explicitly rejects a beginner/playground framing and instead defines an advanced, professional workflow model.

## 2. Product vision

Candy Factory should become a workstation that combines:

- structured schema-driven authoring
- prompt-oriented output preparation
- visual/creative character configuration
- future compatibility with AI generation pipelines

For first production release, that future compatibility is architectural, not yet full external AI execution. The concept repeatedly treats AI integration, backend, and later media generation as future scope rather than immediate baseline scope.

## 3. Target users

### Primary first-release users

**Locked:** **solo professional creators and small creative-ops power users**

This user target matches the confirmed “advanced and professional” interaction philosophy, the multi-character/project/layout model, and the workstation-first desktop direction. It is broader than a single individual-only use case, but narrower than a consumer-creator audience.

### Explicitly not the first-release target

The first release is **not** aimed at a broad casual/consumer audience. The confirmed UX model is advanced, deterministic, and professional rather than simplified or playful.

## 4. First production release boundary

**Locked:** **Local-first workstation only**

The first production release includes:

- structured schema-driven editing
- output generation
- presets
- multi-character handling
- workspace layouts
- themes
- project files

It does **not** require built-in external AI/image/video generation as a release blocker. That boundary matches the roadmap statements that AI integration is still too early and that structural/workstation foundations should be built first.

## 5. Core product goals

Candy Factory must enable users to:

- create and edit structured character definitions from a schema-driven interface
- generate usable outputs in at least human-readable and prompt-oriented forms
- save and reuse work through presets, locks, and project portability
- manage multiple character documents in a single workspace
- switch between mobile and desktop working modes without losing continuity
- prepare data and workspace structure for later AI pipeline expansion without redesigning the product core

## 6. Core product objects

These product objects are already defined by the confirmed workspace direction and remain canonical:

- **Project** — container for open characters, workspace layouts, and project settings
- **Character Document** — one character state instance with its own locks
- **Pane** — a UI module instance bound to a character or global context
- **Workspace Layout** — serialized pane geometry, docking, visibility, and bindings
- **Preset Library** — global saved character snapshots plus locks and metadata

## 7. Product modes and platforms

### Platform baseline

Candy Factory remains a **PWA-based local-first app** with theme persistence, offline-capable shell behavior, and project export/import rather than a required cloud account model in first release. The architecture direction explicitly favors modular vanilla PWA structure with layout abstraction over immediate framework or backend expansion.

### Required runtime modes

Candy Factory must support:

- **Desktop Workstation**
- **Mobile Default**
- **Mobile Workstation**

Desktop is the primary power environment. Mobile Default uses purpose-grouped tabs. Mobile Workstation uses FAB-triggered floating panes when deeper work is needed away from desktop.

## 8. Persistence model

**Locked:** **Local-first**

First-release persistence is:

- local storage/session persistence
- project import/export now
- cloud sync later, if introduced

A cloud-required account model is out of scope for first release. This aligns with the confirmed `.cfproject` direction, storage-key strategy, and “backend too early” guidance.

## 9. Functional requirements

## 9.1 Schema-driven editing

The product must:

- render editable character data from schema definitions
- support grouped sections/categories
- support additive multiselect where logical
- preserve schema-driven output ordering/logic
- remain decoupled from one-off hardcoded field logic as the dataset expands

## 9.2 Character management

The product must allow users to:

- create multiple character documents
- rename characters
- switch active characters
- keep state and locks per character
- work with multiple characters in one workspace/session

## 9.3 Output generation

The product must support at least:

- **Preferred / human-readable output**
- **Prompt / AI-oriented output**

The output system must remain schema-driven, not limited to a narrow hardcoded subset. Prompt output already exists as a required direction for future AI conversion.

## 9.4 Validation and migration

The product must:

- validate required fields
- validate option constraints
- expose invalid states clearly
- preserve saved data across schema changes using versioned migration behavior

This is core product behavior, not optional engineering polish.

## 9.5 Randomization and locks

The product must support:

- global randomization
- per-section randomization
- lock behavior to preserve selected values
- deterministic professional randomization behavior
- manual edits that unlock individual randomized fields where applicable

## 9.6 Presets

The product must support:

- save preset
- load preset
- delete preset
- persistence of state plus locks
- **global** preset scope rather than project-bound preset scope

## 9.7 Projects

The product must support project export/import using the defined project structure including:

- app version
- schema version
- project metadata
- characters
- workspace layouts
- settings

This is a first-release capability, not future-only scope.

## 9.8 Workspace and layouts

The product must support:

- desktop multi-pane layouts
- multiple editors and outputs
- layout save/load
- named layouts
- mobile workstation state persistence
- pane/layout abstraction instead of ad hoc screen logic

## 9.9 Themes

The product must support:

- Light
- Dark
- Native

Theme switching and persistence are first-release requirements, because they are already treated as foundational architecture rather than optional styling.

## 10. Information architecture requirements

Candy Factory must preserve three structural layers:

- **Schema Layer** — attribute definitions
- **Interaction Layer** — tabs, randomization, presets, locks
- **Workspace Layer** — panes, docking, floating windows, layout memory

This separation is product-critical because the app is scaling from a single-form tool into a workstation.

## 11. Desktop requirements

Desktop must function as the primary power environment and support:

- multi-pane layout
- parallel tasks
- multiple editors
- multiple live outputs
- future room for preview, validation, logs, batch, and AI pipeline panes

The desktop model is explicitly a workstation, not a larger mobile screen.

## 12. Mobile requirements

### Mobile Default

Mobile Default must:

- use purpose-grouped tabs
- reduce visible complexity
- optimize for quick edits, tests, and preset work
- keep task switching intentional rather than noisy

### Mobile Workstation

Mobile Workstation must:

- be activated via FAB
- expose floating modular panes
- preserve state
- regain screen space when hidden
- support deeper editing when desktop is unavailable

## 13. Preview scope

**Locked:** **Static/manual preview layer**

First release may include a non-generative preview card or pane, but not generated image/video output. This matches the concept’s “PreviewCard pane (future)” and keeps value high without introducing external model or media dependencies too early.

## 14. Automation and batch scope

**Locked:** **Minimal batch/testing utilities only**

First release may include small testing or batch-support utilities, but not a full automation runner. This matches the concept’s mention of future batch-related panes while keeping initial scope controlled.

## 15. Explicit first-release non-goals

The following are out of first-release scope:

- mandatory external AI generation
- required cloud/backend platform
- consumer-first simplification layer
- full automation runner
- full media-generation pipeline

These remain future-compatible directions, not first-release commitments.

## 16. Required UX primitives

Because the workstation model will not scale without them, the product requires these primitives:

- Tabs
- FAB
- FloatingPanel
- Modal
- BottomSheet
- DockablePane
- Preset Manager modal
- Multi-select chips
- Lock indicator
- Validation toast/inline system

## 17. Non-functional requirements

The product must be:

- modular and maintainable
- deterministic in schema/data behavior
- persistent across sessions locally
- accessible and keyboard-capable on desktop
- scalable across mobile and desktop without separate product logic
- stable under ongoing schema evolution through migrations

These requirements follow directly from the approved architecture and prior validation/migration decisions.

## 18. Release framing

### First production release statement

Candy Factory v1 should be framed as:

**A local-first professional character workstation with structured editing, prompt-oriented output, presets, multi-character workspace, layouts, themes, project portability, and a static/manual preview layer—without mandatory cloud/backend or built-in AI generation.**

This is the cleanest release boundary because it matches both the confirmed product intent and the structural roadmap.

## 19. Success criteria

**Locked:** **Balanced**

First-release product success must be evaluated across all three dimensions together:

- **speed** — time to produce a usable structured character output
- **repeatability** — presets, projects, and layouts make work reusable
- **data integrity** — outputs remain valid and migration-safe

No single KPI should dominate, because Candy Factory’s value is the combination of speed, reuse, and structured reliability. That is consistent with the confirmed product direction.

## 20. Risks

Primary product risks are:

- scope drift into AI/media before workstation core stabilizes
- ad hoc pane/component growth without workspace abstraction
- confusing brand accents with semantic product states
- over-expanding desktop power at the expense of mobile clarity
- under-defining preview/batch and accidentally turning them into release blockers

These risks follow directly from the sequencing guidance in the concept.

## 21. Acceptance criteria

This PRD is satisfied only if first-release planning preserves all of the following:

- local-first workstation boundary
- professional/power-user target audience
- project export/import
- global presets
- multi-character workspace
- desktop workstation mode
- mobile default + mobile workstation modes
- static/manual preview only
- minimal batch/testing utilities only
- no required cloud/backend or external AI generation
- balanced success criteria across speed, repeatability, and integrity

## 22. Status

**Product Requirements Document:** complete at v1.0.