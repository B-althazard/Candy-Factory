# Candy Factory — v0.3.1

## Operational source of truth

The controlling specification for execution is:

- `docs/DMS.md`

Reference documents (traceability only; DMS overrides on conflict):

- `docs/source/DBRD_v1.1.md`
- `docs/source/DSSS_v1.0.md`
- `docs/source/PRD_v1.0.md`
- `docs/source/TIP_v1.0.md`

## Run

Serve the folder with any static server (PWA + service worker require HTTP(S)). Example:

- `python3 -m http.server 8080`

Then open:

- `http://localhost:8080/`

## Notes

- Local-first: data is stored in `localStorage`.
- Diagnostics can be exported from the **Diagnostics** pane.
- Project export/import uses `.cfproject.json` payloads.


## v0.3.2
This bundle contains the UI/UX optimization and bug-fix patch aligned to the v0.3.1 test report.
