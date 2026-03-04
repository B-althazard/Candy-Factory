# Technical Implementation Plan ‒ Version: 1.0

## Candy Factory

**Version:** 1.0

**Status:** Locked for implementation planning

This plan turns the approved product scope into an executable technical path. It follows the confirmed direction to remain **vanilla modular**, introduce a **workspace/layout abstraction now**, keep the app **local-first**, support **Desktop Workstation / Mobile Default / Mobile Workstation**, and defer backend-dependent AI generation until after the workstation core is stable.

## 1. Implementation objective

Candy Factory v1 must ship as a **local-first installable PWA** that supports:

- schema-driven character editing
- validation and migration
- presets
- multi-character workspace
- named layouts
- Light / Dark / Native themes
- `.cfproject` import/export
- static/manual preview support
- no required backend
- no mandatory external AI generation

This matches the confirmed workstation architecture and the earlier recommendation to build layout, theme, and primitives before UI polish.

## 2. Locked technical decisions

The following are now fixed.

### 2.1 Architecture posture

- **Vanilla modular**
- **No framework migration now**
- **Framework-agnostic contracts** must be kept for state, pane registry, and formatters

This preserves the confirmed “stay vanilla, structure it like a framework” direction while reducing future migration cost.

### 2.2 Deployment

- **Static hosting**
- **Automated preview/staging environment**

This keeps deployment aligned with the current local-first PWA model while adding a safe verification layer for workspace, cache, and migration changes. The concept already assumes straightforward PWA deployment without immediate backend coupling.

### 2.3 Testing depth

- **Manual smoke tests**
- plus **targeted automated tests** for schema, state, project, and workspace flows

This is the right depth because the highest-risk areas are migration, persistence, pane/layout behavior, and project round-tripping.

### 2.4 Browser support baseline

First release must explicitly support:

- latest **Chrome, Edge, Safari, Firefox** on desktop
- latest **Safari and Chrome** on mobile

This fits the product requirement that Candy Factory be both a desktop workstation and a mobile-capable PWA.

### 2.5 Preview implementation

First-release preview is:

- **structured summary card only**

This satisfies the approved static/manual preview scope while avoiding undefined asset-slot or generated-media behavior. The concept already positions preview as a future pane and generated media as later scope.

### 2.6 Error reporting

First-release runtime diagnostics must use:

- browser console
- **local exportable error log / diagnostics pane**

This keeps the release backend-free while giving enough visibility to diagnose workspace, migration, and cache issues locally.

---

## 3. Technical architecture

Candy Factory should be implemented as six layers.

### 3.1 Schema layer

Responsible for:

- loading schema definitions
- field metadata
- options
- grouping
- schema versioning
- migrations

### 3.2 State layer

Responsible for:

- project state
- character document state
- lock state
- preset state
- workspace/session state
- theme/UI state

### 3.3 Interaction layer

Responsible for:

- form binding
- randomization
- validation
- formatting
- export logic
- preset logic

### 3.4 Workspace layer

Responsible for:

- pane registry
- layout state
- mode routing
- pane binding to documents
- desktop docking/splitting
- mobile floating panels

### 3.5 Presentation layer

Responsible for:

- tokenized styling
- components
- shell rendering
- tabs
- modals
- panes
- preview surface

### 3.6 PWA/platform layer

Responsible for:

- manifest
- service worker
- installability
- cache versioning
- offline shell behavior
- file import/export integration

This layering is directly aligned with the confirmed separation of **Schema Layer**, **Interaction Layer**, and **Workspace Layer**, extended into implementation-ready responsibilities.

---

## 4. Core modules

The implementation should standardize around this module structure.

### 4.1 Schema and state

- `js/schema/*`
- `js/state/*`
- `js/validate/*`
- `js/migrate/*`

### 4.2 Workspace

- `js/workspace/registry.js`
- `js/workspace/layoutStore.js`
- `js/workspace/workspaceState.js`
- `js/workspace/router.js`
- `js/workspace/panes/*`

### 4.3 Theme and components

- `js/theme/theme.js`
- `js/components/*`
- `styles/tokens.css`
- `styles/components.css`
- `styles/utilities.css`

### 4.4 Project and output

- `js/project/cfproject.js`
- `js/output/*`
- `js/export/*`

### 4.5 Platform

- `index.html`
- `manifest.webmanifest`
- `sw.js`
- `icons/*`

The concept explicitly identifies the workspace, theme, and project modules that need to exist for scaling: pane registry, layout store, workspace state, router, theme switching, and `.cfproject` handling.

---

## 5. Canonical data model

### 5.1 Project

Contains:

- project metadata
- characters
- workspace layouts
- settings

### 5.2 Character Document

Contains:

- schema-shaped character state
- lock state
- document metadata

### 5.3 Workspace Layout

Contains:

- layout id and name
- device mode
- pane geometry
- visibility
- bindings

### 5.4 Workspace Session

Contains:

- active document
- active layout
- current mode
- mobile active tab
- floating panel visibility

### 5.5 Preset Library

Contains:

- global saved state snapshots
- locks
- preset metadata

This matches the confirmed product/workspace object model and the minimal `.cfproject` format already defined in the concept.

---

## 6. Storage model

Local persistence must remain split by concern.

### Required storage domains

- presets
- layout library
- workspace restore
- theme mode
- UI state
- project index, if used

### `.cfproject` format

Project export/import must include:

- `app_version`
- `schema_version`
- `project_id`
- `project_name`
- `created_at`
- `updated_at`
- `characters[]`
- `workspace_layouts[]`
- `settings`

The concept already defines both the storage keys and the minimal project file structure needed for the workstation model.

---

## 7. Schema and migration pipeline

The schema pipeline must support:

- packaged fallback schema
- structured schema loading
- schema version stamping
- declarative migrations
- migration-on-load for persisted data

### Load sequence

1. load persisted state and stored schema version
2. load latest schema
3. apply ordered migrations until current version is reached
4. persist upgraded state
5. render from migrated state

Migration support is already an explicit requirement from the earlier evolution path and must remain mandatory for schema changes.

---

## 8. Workspace engine

The workspace engine must route among three product modes.

### 8.1 Desktop Workstation

Must support:

- multiple characters open simultaneously
- parallel editor/output work
- named layouts
- pane-based modules
- future dock zones and split behavior

### 8.2 Mobile Default

Must support:

- purpose-grouped tabs
- task-oriented editing
- output as a first-class tab

### 8.3 Mobile Workstation

Must support:

- FAB activation
- floating panels
- persistent state
- efficient screen-space recovery

These mode behaviors are explicitly defined in the concept and are not just responsive CSS variants.

---

## 9. Pane system

The pane registry is the primary extension point.

### First-wave pane types

- editor
- output
- presets
- diagnostics
- preview summary card

### Reserved next-wave pane types

- validation/logs
- schema inspector
- batch runner
- AI pipeline
- media preview

Each pane module should expose:

- render
- bind
- subscribe/update hooks
- serializable configuration

The concept already frames pane registry and pane-based growth as foundational for workstation scaling.

---

## 10. Theme implementation

The theme system must use:

- token abstraction
- semantic CSS variables
- persistent user selection
- one coherent identity family across Light, Dark, and Native

Components must read semantic tokens only. Theme switching must change token maps, not component markup or logic. The concept explicitly requires Light, Dark, and Native plus token abstraction and persistence.

---

## 11. Preview implementation

The first-release preview must be implemented as a **structured summary card**.

### Requirements

- consume normalized document state
- render a stable, readable character summary
- not depend on generated images or video
- fit both desktop pane and mobile overlay contexts

This preserves compatibility with future preview/media expansion without introducing external generation dependencies now.

---

## 12. Error reporting and diagnostics

First release must provide a **local diagnostics path**.

### Required behavior

- log runtime errors to console
- capture recoverable app diagnostics locally
- expose an exportable diagnostics payload or diagnostics pane
- include enough context to inspect:
    - schema version
    - app version
    - active layout/mode
    - recent migration status
    - project import/export failures

This is necessary because the release is local-first and backend-free, but the riskiest failures will be workspace, persistence, and migration related.

---

## 13. Accessibility implementation requirements

The implementation must enforce:

- keyboard-first desktop behavior
- reduced motion behavior
- visible focus states
- non-color-only state signaling
- accessible accent usage on action surfaces
- validation visibility in all themes

This follows directly from the already locked design-system and product requirements.

---

## 14. Deployment model

### 14.1 Production

- static hosting

### 14.2 Pre-release

- automated preview/staging environment for branch or release-candidate validation

### 14.3 Deployment validation

Each release candidate must verify:

- service worker registration
- cache invalidation/versioning
- offline shell recovery
- project import/export
- migration execution
- workspace/layout restore

The existing PWA direction and versioned-cache behavior make this a necessary release gate.

---

## 15. Testing strategy

### 15.1 Manual smoke tests

Required for:

- installability
- offline shell
- primary editing flows
- mobile tab switching
- desktop pane flows

### 15.2 Targeted automated tests

Required for:

- schema loading and fallback
- migration sequencing
- validation behavior
- preset save/load/delete
- project import/export round-trip
- layout save/load
- workspace session restore
- theme persistence
- preview summary rendering
- diagnostics export

This is the right minimum because those are the highest-risk logic paths in the confirmed architecture.

---

## 16. Browser support and QA matrix

First-release QA must explicitly cover:

### Desktop

- latest Chrome
- latest Edge
- latest Safari
- latest Firefox

### Mobile

- latest Safari
- latest Chrome

### Test focus

- install prompt behavior
- standalone mode
- local storage persistence
- service worker caching
- pointer + keyboard navigation
- mobile overlay behavior
- file import/export support

---

## 17. Framework migration posture

Candy Factory must remain vanilla now, but its internal contracts must stay portable.

### Preserve framework-agnostic boundaries for

- state store APIs
- pane registry API
- formatter/output adapters
- project serialization
- validation pipeline
- theme token mapping

This directly follows the earlier recommendation to separate state mutation, rendering, and formatting so a later React/Vite migration remains feasible without forcing it now.

---

## 18. Milestones

### Milestone 1 — foundation stabilization

- finalize workspace state model
- finalize pane registry contract
- finalize layout serialization
- finalize theme token wiring
- finalize `.cfproject` schema
- add diagnostics capture/export

### Milestone 2 — first-release primitives

- Tabs
- FAB + FloatingPanel
- Modal
- Pane container
- Splitter + Dock zones
- Preset manager flow
- diagnostics pane

### Milestone 3 — product-complete v1 scope

- static preview summary card
- project round-trip hardening
- export/output hardening
- accessibility pass
- browser matrix pass
- offline/PWA hardening

### Milestone 4 — release readiness

- staging validation
- migration fixture verification
- cache/version rollback checks
- regression pass
- production deployment

This sequence remains aligned with the earlier recommendation to implement structure first, then primitives, then polish.

---

## 19. Primary risks and mitigations

### Risk 1 — workspace complexity grows faster than abstractions

**Mitigation:** make pane registry, layout store, and mode router mandatory before adding more panes.

### Risk 2 — schema changes break persisted data

**Mitigation:** migrations remain required for any schema version change.

### Risk 3 — mobile and desktop diverge into separate implementations

**Mitigation:** keep one state model, one pane system, and mode-specific routing only.

### Risk 4 — AI/backend scope enters too early

**Mitigation:** keep preview static, diagnostics local, deployment static, and AI integrations out of first-release critical path.

---

## 20. Acceptance criteria

This implementation plan is satisfied only if:

- the app remains vanilla modular
- framework-agnostic contracts are preserved for future migration
- deployment uses static hosting plus automated staging/previews
- targeted automated tests cover schema/state/project/workspace flows
- desktop and mobile run from one shared core architecture
- `.cfproject` files round-trip correctly
- schema migrations safely upgrade persisted state
- first-release preview is a structured summary card only
- runtime diagnostics can be exported locally
- first release does not require backend or external AI generation

## 21. Status

**Technical Implementation Plan:** complete at v1.0.