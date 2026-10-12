# Migration evidence

Empty on purpose: no shadow-run, reconciliation or cutover output is committed to this repository yet.

Drop one or more `*.json` files here that match `EvidenceFile` in `../types.ts`. They are merged at build
time by `../evidence.ts`, and the Phase 2/3 panels switch from the planned-state view to the loaded results.
