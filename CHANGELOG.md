# Changelog

## v0.0.6 (2026-03-03)
- Added Normal Mode schema-driven UI (select-based inputs) for Subject, Appearance, Body attributes.
- Implemented schema loader (`/data/schema.json`) with offline fallback and basic schema versioning.
- Updated output to human-readable flat key–value text (preferred format), generated from current selections.
- Introduced modular schema file structure to update allowed values without changing app code.
- Packaged as drop-in replacement zip: Candy_Factory_v0.0.6

## v0.0.5
- Baseline modular vanilla PWA with tokenized design system and service worker caching.
