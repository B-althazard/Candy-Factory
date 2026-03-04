# Development Master Spec (DMS) — Candy Factory v1

**Version:** 1.0
**Status:** Locked for execution (Operational Source of Truth)
**Applies to:** First production release (“v1 workstation core”)
**Source documents merged:** DBRD v1.1, DSSS v1.0, PRD v1.0, TIP v1.0

---

## 0) Document control

### 0.1 Owners

* **Product Owner:** accountable for scope boundary, acceptance criteria, release readiness.
* **Design System Owner:** accountable for tokens, components, accessibility, brand adherence.
* **Engineering Owner:** accountable for architecture, implementation plan, quality gates, deployment.

### 0.2 Change control

* Changes require:

  * updated DMS section(s),
  * entry in **Decision Log** (ADR-style),
  * impact assessment (scope, schedule, risk),
  * explicit approval by all three owners.

### 0.3 Precedence and conflict resolution

If conflicts occur, resolve by precedence:

1. **This DMS**
2. **TIP** (execution constraints and architecture) 
3. **PRD** (product scope and acceptance) 
4. **DSSS** (design system governance) 
5. **DBRD** (brand guardrails) 

---

## 1) Purpose, scope, and release boundary

### 1.1 Purpose

Create a single operational spec to eliminate ambiguity across Design, Product, and Engineering by defining:

* locked decisions,
* release scope and non-goals,
* system architecture and contracts,
* design system governance rules,
* execution plan, quality gates, and acceptance criteria.

### 1.2 Product definition (v1 framing)

Candy Factory v1 is a **local-first professional creative workstation** for structured character creation, prompt-oriented outputs, presets, multi-character workspace, layouts, themes, and project portability—without mandatory backend or external AI generation.

### 1.3 In-scope (must ship)

* Local-first **installable PWA**
* Schema-driven character editing + grouping/sections
* Validation + versioned migration on load
* Randomization + locks (deterministic, professional) 
* Global presets (save/load/delete; includes locks)
* Multi-character workspace
* Workspace layouts: save/load, named layouts
* Required runtime modes:

  * Desktop Workstation
  * Mobile Default (purpose-grouped tabs)
  * Mobile Workstation (FAB + floating panels)
* Themes: Light / Dark / Native with token mapping + persistence
* `.cfproject` import/export round-trip
* Static/manual preview: **structured summary card** only
* Local diagnostics: exportable error log / diagnostics pane

### 1.4 Explicit non-goals (out of scope for v1)

* Mandatory external AI/image/video generation (architectural compatibility only)
* Required cloud account, backend platform, or sync as a blocker
* Full automation runner / full batch system (only minimal testing utilities) 
* New framework migration (stay vanilla modular) 

---

## 2) Goals, success criteria, and trade-offs

### 2.1 Product goals (v1)

* **Speed:** produce usable structured character output quickly
* **Repeatability:** reuse via presets/projects/layouts
* **Data integrity:** validation + migrations keep work stable across schema changes

### 2.2 Success criteria (release)

Release qualifies only if:

* `.cfproject` round-trips without loss for required fields, layouts, settings
* persisted state migrates to latest schema on load deterministically
* desktop workstation supports multi-pane + multiple open characters, with named layout persistence
* mobile default tabs and mobile workstation floating panels function on the same shared state model
* Light/Dark/Native themes are token-mapped and persisted
* preview is a structured summary card (no generated media dependency)
* diagnostics are exportable locally 

### 2.3 Locked trade-offs

* Prefer **architectural correctness** for workspace/layout/state/migration over UI polish first. 
* Prefer **vanilla modular** with framework-agnostic contracts over early framework adoption. 
* Prefer **local-first** with export/import over early backend features.

---

## 3) System context and canonical domain model

### 3.1 Canonical product objects (authoritative)

* **Project:** container for characters, workspace layouts, settings
* **Character Document:** schema-shaped state + locks + metadata
* **Workspace Layout:** serialized pane geometry, visibility, bindings, mode
* **Workspace Session:** active document/layout/mode + mobile UI state 
* **Pane:** UI module instance bound to character or global context
* **Preset Library (global):** snapshots of character + locks + metadata

### 3.2 Canonical persistence domains (local-first)

Required local storage domains include presets, layout library, workspace restore, theme mode, UI state, and optional project index. 

---

## 4) Functional requirements (FR)

### FR-1 Schema-driven editing

* Render character editor from schema definitions; support grouping/sections; avoid hardcoded per-field logic.

### FR-2 Multi-character management

* Create, rename, switch, and maintain independent locks/state per character; multiple open characters supported in a workspace session.

### FR-3 Output generation (schema-driven)

* Provide at least:

  * preferred/human-readable output
  * prompt/AI-oriented output
    Outputs must remain schema-driven.

### FR-4 Validation and migration

* Validate required fields and option constraints.
* Expose invalid state clearly.
* Migrate persisted data across schema versions via ordered migrations on load.

### FR-5 Randomization and locks

* Global + per-section randomization.
* Locks prevent overwrite.
* Deterministic professional behavior; manual edits adjust locks where applicable.

### FR-6 Presets (global)

* Save/load/delete presets; persist state + locks; presets are global (not project-bound).

### FR-7 Projects (`.cfproject`)

* Export/import must include app version, schema version, project metadata, characters, workspace layouts, settings.

### FR-8 Workspace and layouts

* Desktop: multi-pane workstation; named layouts; multiple editors/outputs.
* Mobile Default: purpose-grouped tabs.
* Mobile Workstation: FAB-triggered floating modular panes with persistence.

### FR-9 Themes

* Light/Dark/Native; token-mapped; persistent selection.

### FR-10 Preview (v1)

* Structured summary card only; consumes normalized document state; works in desktop pane and mobile overlay contexts.

### FR-11 Diagnostics (v1)

* Capture runtime diagnostics locally; expose diagnostics pane; allow exporting diagnostics payload.

---

## 5) Non-functional requirements (NFR)

### 5.1 Architecture posture

* **Vanilla modular**, no framework migration in v1.
* Preserve framework-agnostic contracts for state, pane registry, formatters, serialization. 

### 5.2 Accessibility

* WCAG 2.2 AA baseline, reduced motion support, keyboard-first desktop support.

### 5.3 Platform and support baseline

* Desktop: latest Chrome, Edge, Safari, Firefox.
* Mobile: latest Safari and Chrome. 

### 5.4 Reliability (local-first)

* Offline-capable shell behavior.
* Versioned caching with safe invalidation.
* Migration-on-load to prevent schema drift corruption.

---

## 6) Design + branding system (governed implementation)

### 6.1 Brand constraints (must hold)

Candy Factory must read as a **professional creative workstation** balancing **technical control** and **creative output**.

### 6.2 Color system (locked)

* Neutrals: `#282A29`, `#F6F6F6`, `#FFFFFF`
* Accents:

  * brand-pink-500 `#FF5571` (primary)
  * system-blue-500 `#5773FF` (companion/system)
* Accessible white-text action fills (locked):

  * brand-pink-700 `#EE0027`
  * system-blue-700 `#4665FF`
* 5-step ramps per accent family: 100/300/500/700/900 (structure locked; non-locked hex values remain open for 100/300/900).

### 6.3 Token architecture (mandatory)

Implement tokens in layers:

* primitive → semantic alias → component → pattern → mode/theme mapping.

### 6.4 Spacing, motion, breakpoints (locked)

* 4pt base spacing system and defined core scale slots. 
* Motion posture: minimal + precise micro-feedback; reduced motion supported.
* Responsive model: 2-mode (mobile, desktop) with product modes layered inside (mobile default/workstation, desktop workstation).

### 6.5 Component requirements (must exist as primitives)

Required primitives include Tabs, FAB, FloatingPanel, Modal, BottomSheet, DockablePane, Splitter + Dock zones, Preset Manager modal, multi-select chips, lock indicator, validation feedback system.

### 6.6 Governance rules (hard rules)

* No raw HEX in feature components.
* No non-token spacing/radius/shadow additions.
* No theme-specific one-off styling without semantic mapping.
* No screen-specific component variants unless promoted into shared system.
* State styling must follow the state matrix and remain distinguishable (selected vs active; locked vs disabled; invalid visible in all themes; focus-visible mandatory on desktop; color not the only signal).

---

## 7) Technical architecture (authoritative)

### 7.1 Layered architecture (six layers)

1. Schema layer
2. State layer
3. Interaction layer
4. Workspace layer
5. Presentation layer
6. PWA/platform layer 

### 7.2 Module structure (canonical)

* `js/schema/*`, `js/state/*`, `js/validate/*`, `js/migrate/*`
* `js/workspace/registry.js`, `layoutStore.js`, `workspaceState.js`, `router.js`, `panes/*`
* `js/theme/theme.js`, `js/components/*`, `styles/tokens.css`, `styles/components.css`, `styles/utilities.css`
* `js/project/cfproject.js`, `js/output/*`, `js/export/*`
* `index.html`, `manifest.webmanifest`, `sw.js`, `icons/*` 

### 7.3 Deployment model (v1)

* Static hosting for production.
* Automated preview/staging environment for verification. 

---

## 8) Core contracts (interfaces and data)

### 8.1 `.cfproject` format (minimum required fields)

Must include:

* `app_version`, `schema_version`
* `project_id`, `project_name`, `created_at`, `updated_at`
* `characters[]`
* `workspace_layouts[]`
* `settings`

**Compatibility rule:** import must validate version fields and run migrations before rendering.

### 8.2 Schema & migration pipeline (load sequence)

1. Load persisted state + stored schema version
2. Load latest schema (packaged fallback available)
3. Apply ordered migrations until current version
4. Persist upgraded state
5. Render from migrated state

### 8.3 Pane registry contract (extension point)

Each pane module exposes:

* render
* bind
* subscribe/update hooks
* serializable configuration 

**First-wave pane types (v1):**

* editor, output, presets, diagnostics, preview summary card 

### 8.4 Workspace engine contract (mode routing)

Must route between:

* Desktop Workstation (multi-pane, named layouts, multi-character)
* Mobile Default (purpose-grouped tabs)
* Mobile Workstation (FAB + floating panes with persistence)

---

## 9) Execution plan (phases, milestones, deliverables)

### 9.1 Milestones (authoritative sequencing)

**M1 — Foundation stabilization**

* workspace state model
* pane registry contract
* layout serialization
* theme token wiring + persistence
* `.cfproject` schema
* diagnostics capture/export 

**M2 — Workstation primitives**

* Tabs
* FAB + FloatingPanel
* Modal
* Pane container
* Splitter + Dock zones
* Preset manager flow
* Diagnostics pane

**M3 — Product-complete v1 scope**

* preview summary card
* project round-trip hardening
* export/output hardening
* accessibility pass
* browser matrix pass
* offline/PWA hardening

**M4 — Release readiness**

* staging validation
* migration fixture verification
* cache/version rollback checks
* regression pass
* production deployment 

### 9.2 Deliverables per milestone (minimum)

* M1: core stores + contracts documented in-repo; sample `.cfproject`; diagnostics export format
* M2: tokenized primitives + reusable components; pane composition works in all modes
* M3: acceptance criteria coverage; accessibility evidence; QA matrix results
* M4: release checklist signed; staging verification logs

---

## 10) Testing, QA, and release gates

### 10.1 Testing depth (locked)

* Manual smoke tests + targeted automated tests focused on schema/state/project/workspace flows. 

### 10.2 Targeted automated test coverage (minimum)

* schema load + fallback
* migration sequencing
* validation behavior
* preset save/load/delete
* project import/export round-trip
* layout save/load
* workspace session restore
* theme persistence
* preview summary rendering
* diagnostics export 

### 10.3 Release candidate validation (must pass)

* service worker registration
* cache invalidation/versioning
* offline shell recovery
* project import/export
* migration execution
* workspace/layout restore 

---

## 11) Risks and mitigations (execution register)

### R1 Workspace complexity outpaces abstractions

* **Mitigation:** pane registry + layout store + mode router must exist before adding panes/features.

### R2 Schema changes break persisted data

* **Mitigation:** migrations mandatory for any schema version change; migration-on-load is non-optional.

### R3 Mobile and desktop diverge into separate implementations

* **Mitigation:** single state model; mode-specific routing only; shared pane system.

### R4 Scope drift into backend/AI/media too early

* **Mitigation:** preview stays static; backend-free deployment; AI panes reserved for later.

### R5 Token-discipline breakdown causes UI drift

* **Mitigation:** enforce DSSS governance rules; block PRs that introduce raw values or non-token styling.

---

## 12) Open items (explicitly not locked)

These items are structurally required but values are not yet user-approved:

* Accent ramp hex values for 100/300/900 for both accents
* Exact type size ladder beyond baseline roles 
* Exact radius/elevation numeric ladder and semantic state palette hex values 

**Rule:** engineering may implement placeholder tokens only if:

* they occupy the correct token slots,
* they remain editable centrally,
* they do not leak raw values into components.

---

## 13) Acceptance criteria (authoritative checklist)

This DMS is satisfied only if all are true:

* Vanilla modular architecture; framework-agnostic contracts preserved 
* Local-first PWA ships with offline shell + static hosting + staging previews
* Desktop workstation + Mobile Default + Mobile Workstation all function on shared core
* `.cfproject` import/export round-trips; includes required fields
* Schema validation + migration-on-load enforced
* Global presets work (state + locks)
* Light/Dark/Native themes are token-mapped and persisted
* Preview is structured summary card only (no external generation dependency)
* Diagnostics pane exists with exportable diagnostics payload 
* WCAG 2.2 AA + reduced motion + keyboard-first desktop supported

---

## Appendix A — Locked “first principles” (summary)

* Product is a professional creative workstation, not a consumer playground.
* Desktop is the primary power environment; mobile supports shorter work + workstation overlay mode.
* Build structure first: workspace/layout/theme/primitives before UI polish and before backend/AI.