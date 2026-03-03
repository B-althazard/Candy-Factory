# Changelog

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