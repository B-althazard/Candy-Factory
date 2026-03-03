# Changelog

## v0.2.0 (2026-03-03)
- Workstation foundation: desktop split panes, mobile tabs + mobile workstation mode.
- Theme selector: Light / Dark / Native (persisted).
- Multi-character: create/rename/switch.
- Layout save/load (stored locally).
- Project import/export (.cfproject.json) including characters, locks, layouts, settings.

## v0.1.5 (2026-03-03)
- Added Presets: save/load/delete named presets (state + locks) persisted in localStorage.
- Added multiselect fields where additive attributes are logical; supports validation, randomization, export, and output formatting.
- Added prompt-optimized output mode toggle (Preferred vs Prompt) for future AI conversion.
- Updated schema version + no-op migration 0.1.4 → 0.1.5; updated PWA cache version and schema fallback pointer.

## v0.1.4 (2026-03-03)
- Fixed broken deployment from v0.1.3 placeholder files by restoring full app logic.
- Added collapsible schema sections with persisted open/closed state.
- Added per-section Random button that randomizes only that section and locks those fields from global randomization.
- Added lock indicator styling; manual field edits unlock that field from randomization lock.
- Updated schema version + no-op migration 0.1.2 → 0.1.4; updated PWA cache version and schema fallback pointer.

## v0.1.2 (2026-03-03)
- Updated schema with Pose addons, Style addons, Waist Emphasis System addon methods, and Wardrobe (outfits) addons.
- Added no-op migration 0.1.1 → 0.1.2 to advance persisted schema_version.
- Updated schema fallback pointer and PWA cache version.

## v0.1.1 (2026-03-03)
- Introduced versioned schema migration system using a persisted meta record (schema_version) and declarative migrations in schema.json.
- Added migration runner that applies rename/setDefault/delete steps when schema_version changes.
- Updated schema fallback pointer and PWA cache version.

## v0.1.0 (2026-03-03)
- Added schema validation (required + option constraints) with inline invalid field styling and status summary.
- Added export: download Output as .txt and download character as flat key-value .json.
- Added Reset action (clears to defaults) while keeping Randomize.
- Updated PWA cache version and schema fallback pointer.

## v0.0.9 (2026-03-03)
- Fixed syntax error in app.js (unexpected '}').
- Rewrote Randomize handler deterministically.
- Added <meta name="mobile-web-app-capable" content="yes"> to address deprecation warning.

## v0.0.8 (2026-03-03)
- Replaced "Generate Output" with "Randomize" to generate random valid selections (including name).
- Output continues to refresh live on input changes.

## v0.0.7 (2026-03-03)
- Fixed output formatting: output now includes all filled schema fields (schema-driven) instead of a hardcoded subset.
- "Generate Output" now provides visible feedback and scrolls to Output.

## v0.0.6 (2026-03-03)
- Added Normal Mode schema-driven UI (select-based inputs) for Subject, Appearance, Body attributes.
- Implemented schema loader (`/data/schema.json`) with offline fallback and basic schema versioning.
- Updated output to human-readable flat key–value text (preferred format), generated from current selections.
- Introduced modular schema file structure to update allowed values without changing app code.
- Packaged as drop-in replacement zip: Candy_Factory_v0.0.6

## v0.0.5
- Baseline modular vanilla PWA with tokenized design system and service worker caching.