---
"@taskade/uri-parser": minor
---

Relax `engines.node` from `>=22` to `>=20` (the lowest line the Vitest 4 suite can run). CI now tests 20, 22, and 24. Node 18 is EOL and is not claimed. Docs-only: badges and a “use WHATWG URL unless you need a lossless AST / host-path / no-scheme parse” table. Still 0.x — URI Template is not in this release. No parser or API changes.
