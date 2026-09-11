# Changelog

## 0.2.0

### Minor Changes

- 6c850fd: Relax `engines.node` from `>=22` to `>=20` (the lowest line the Vitest 4 suite can run). CI now tests 20, 22, and 24. Node 18 is EOL and is not claimed. Docs-only: badges and a “use WHATWG URL unless you need a lossless AST / host-path / no-scheme parse” table. Still 0.x — URI Template is not in this release. No parser or API changes.

## 0.1.1

### Patch Changes

- 00549af: build(deps): Download @taskade/eslint-plugin from npm

## 0.1.0 - 2026-01-22

### Added

- Initial implementation
- Lexer with explicit token types
- Parser with support for:
  - Optional schemes
  - Scheme-relative URLs (//example.com)
  - Host-ish URLs (example.com, localhost:3000)
  - Absolute paths (/path)
  - Relative paths
  - Query strings and fragments
  - IPv6 addresses
  - Userinfo
- Typed AST for URI components
- Lossless parsing (raw values preserved)
