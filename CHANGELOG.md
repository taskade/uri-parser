# Changelog

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
