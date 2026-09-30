# URI Parser

A lexer and parser for URIs with support for various URL forms, built with compiler design principles.

By [Stan Chang](https://lxcid.com/) ([@lxcid](https://github.com/lxcid)).

[![npm](https://img.shields.io/npm/v/@taskade/uri-parser?style=flat-square&color=FF2D60)](https://www.npmjs.com/package/@taskade/uri-parser)
[![npm downloads](https://img.shields.io/npm/dm/@taskade/uri-parser?style=flat-square)](https://www.npmjs.com/package/@taskade/uri-parser)
[![CI](https://img.shields.io/github/actions/workflow/status/taskade/uri-parser/ci.yml?branch=main&style=flat-square)](https://github.com/taskade/uri-parser/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/github/license/taskade/uri-parser?style=flat-square)](./LICENSE.md)

Sibling: [`@taskade/temporal-parser`](https://github.com/taskade/temporal-parser) (same compiler approach for ISO 8601 / RFC 3339 / IXDTF).

## When to use this

Use the platform `URL` / WHATWG parser unless you need a lossless AST, host-path (no scheme), network-path (`//host/...`), or a custom grammar on the same token stream.

| Need | Use |
| --- | --- |
| Everyday resolve / normalize / `href` | [`URL`](https://developer.mozilla.org/en-US/docs/Web/API/URL) (WHATWG) |
| Lossless AST, host-path, no-scheme, exposed lexer | **this package** |
| Date/time strings | [`@taskade/temporal-parser`](https://github.com/taskade/temporal-parser) |

## Features

- **Flexible parsing**: Handles absolute URLs, network-path URLs, host-path URLs, and relative paths
- **Unicode support**: Full support for internationalized domain names (IDN) and Unicode characters in all URI components
- **Extensible architecture**: Exposed lexer allows custom parser implementations
- **Zero dependencies**: No external runtime dependencies
- **Type-safe**: Written in TypeScript with full type definitions
- **Small footprint**: Lightweight and performant
- **Dual module support**: ESM and CommonJS builds
- **Well tested**: Comprehensive test coverage

## Installation

```bash
npm install @taskade/uri-parser
```

## Quick Start

```typescript
import { parseUri, parseUrl } from '@taskade/uri-parser';

// Parse an absolute URL
const result = parseUri('http://example.com:3000/path?x=1#y');
console.log(result);
// { kind: 'uri', scheme: ..., authority: ..., path: ..., query: ..., fragment: ... }

// Parse a network-path URL
const schemeRelative = parseUri('//example.com:3000/path?x=1#y');
// { kind: 'uri', authority: ..., path: '/path', ... }

// Parse a host-path URL (no scheme)
const hostPath = parseUri('example.com/path');
// { kind: 'uri', authority: ..., path: '/path' }

// Parse an absolute path
const absolutePath = parseUri('/path/to/resource');
// { kind: 'uri', path: '/path/to/resource' }

// Parse a relative path
const relative = parseUri('path/to/resource');
// { kind: 'uri', path: 'path/to/resource' }

// Parse and normalize a URL (validates, lowercases host/scheme, strips default ports)
const normalized = parseUrl('HTTPS://Example.com:443/path');
// {
//   kind: 'absolute',
//   scheme: 'https',
//   authority: { host: 'example.com' },
//   path: '/path'
// }
```

## Supported Formats

### Absolute URLs
- With authority: `http://example.com/path`
- With port: `https://example.com:443/path`
- With userinfo: `ftp://user:pass@example.com`
- Without authority: `mailto:user@example.com`

### Network-Path URLs
- Basic: `//example.com`
- With port: `//example.com:3000`
- With path: `//example.com/path`
- With userinfo: `//user@example.com`

### Host-Path URLs
- Domain: `example.com`
- With port: `localhost:3000`
- IP address: `192.168.1.1`
- With path: `example.com/path`

**Heuristic note:** host-path detection is based on a heuristic (e.g. `localhost`, dotted names, IPv4, bracketed IPv6).
Inputs like `foo:bar` are treated as a scheme unless the part after `:` is numeric and the prefix looks like a host.

### Paths
- Absolute: `/path/to/resource`
- Relative: `path/to/resource`

### Additional Components
- Query strings: `?key=value&key2=value2`
- Fragments: `#section`
- IPv6 addresses: `[::1]`, `[2001:db8::1]`
- Percent-encoded characters: `path%20with%20spaces`
- Unicode characters: `https://münchen.de/文档?名前=値#секция`

## Philosophy

This parser follows the temporal-parser philosophy:

**explicit tokens → shallow grammar → AST → later normalization**

### Why This Approach?

1. **Lexer is explicit**: No regex soup, just clear token definitions
2. **Parser is shallow & forgiving**: Accepts various URL forms without imposing strict rules
3. **AST preserves intent**: The structure reflects what was parsed, not a normalized form
4. **Easy to extend**: Add normalization passes, WHATWG resolution layer, or linting as separate steps

### What This Is NOT

- This is NOT a WHATWG URL parser (though you could build one on top)
- This does NOT normalize or validate URLs
- This does NOT resolve relative URLs against base URLs
- This does NOT perform percent-encoding/decoding

### What This IS

- A tool to understand URI structure
- A foundation for building custom URL parsers
- A way to preserve lossless information about URIs
- A compiler-style approach to URI parsing

## Unicode Support

The parser fully supports Unicode characters in all URI components:

```typescript
import { parseUri } from '@taskade/uri-parser';

// Internationalized Domain Names (IDN)
parseUri('https://münchen.de/stadtplan');
// { kind: 'absolute', scheme: 'https', authority: { host: 'münchen.de' }, path: '/stadtplan' }

// Unicode in paths (Chinese)
parseUri('http://example.com/文档/资料');
// { kind: 'absolute', ..., path: '/文档/资料' }

// Unicode in query strings (Japanese)
parseUri('http://example.com?名前=田中');
// { kind: 'absolute', ..., query: '名前=田中' }

// Unicode in fragments (Russian)
parseUri('http://example.com#введение');
// { kind: 'absolute', ..., fragment: 'введение' }

// Emoji support
parseUri('http://example.com/🎉/celebration');
// { kind: 'absolute', ..., path: '/🎉/celebration' }

// Mixed Unicode and ASCII
parseUri('https://example.com/docs/文档?lang=中文#section-內容');
// All components support Unicode seamlessly
```

## Advanced Usage

### AST with Tokens

The parser returns a rich AST where each component includes both its value and the underlying tokens. This is useful for:
- **Source mapping**: Track back to original character positions
- **Syntax highlighting**: Highlight each component with precision
- **Error reporting**: Show errors at exact locations
- **Refactoring tools**: Modify specific URI parts
- **Linting**: Validate with full context

**Important:** Tokens are **optional** in the AST. The parser populates them automatically when parsing from strings, but you can create AST nodes without tokens for testing, code generation, or other use cases.

```typescript
import { authorityValue, nodeValue, parseUri, schemeValue } from '@taskade/uri-parser';

const uri = 'https://user@example.com:443/path?key=value#section';
const ast = parseUri(uri);

// Each component has value + tokens (populated by parser)
console.log(schemeValue(ast.scheme)); // "https"
console.log(ast.scheme?.tokens); // [{ type: 'IDENT', value: 'https', pos: 0 }, { type: 'Colon', value: ':', pos: 5 }]

console.log(authorityValue(ast.authority)); // { userinfo: "user", host: "example.com", port: "443", source: "slashes" }
console.log(ast.authority?.tokens); // Array of all tokens for authority

console.log(ast.path.text); // "/path"
console.log(ast.path.tokens); // Array of tokens for path

// Helper to extract just the value
console.log(nodeValue(ast.query)); // "key=value"
console.log(nodeValue(ast.fragment)); // "section"

// Access text fields directly if you don't need helper functions
console.log(ast.scheme?.name.text); // "https"
console.log(ast.path.text); // "/path"
```

### Handcrafting AST (without tokens)

You can easily create AST nodes by hand without providing tokens:

```typescript
import type { UriAst } from '@taskade/uri-parser';
import { stringifyUri } from '@taskade/uri-parser';

// Create a simple AST for http://example.com/path
const ast: UriAst = {
  kind: 'uri',
  scheme: {
    kind: 'scheme',
    name: {
      kind: 'text',
      text: 'http',
    },
  },
  authority: {
    kind: 'authority',
    source: 'slashes',
    host: {
      kind: 'text',
      text: 'example.com',
    },
  },
  path: {
    kind: 'text',
    text: '/path',
  },
};

console.log(stringifyUri(ast)); // "http://example.com/path"
```

### Using the Lexer

```typescript
import { lexUri } from '@taskade/uri-parser';

// Tokenize a URI string
const tokens = lexUri('http://example.com:3000/path');
console.log(tokens);
// [
//   { type: 'IDENT', value: 'http', pos: 0 },
//   { type: 'Colon', value: ':', pos: 4 },
//   { type: 'DoubleSlash', value: '//', pos: 5 },
//   { type: 'IDENT', value: 'example.com', pos: 7 },
//   { type: 'Colon', value: ':', pos: 18 },
//   { type: 'IDENT', value: '3000', pos: 19 },
//   { type: 'Slash', value: '/', pos: 23 },
//   { type: 'IDENT', value: 'path', pos: 24 },
//   { type: 'EOF', value: '', pos: 28 }
// ]

```

### Custom Parser

If the provided parser doesn't match your needs, write your own using the lexer:

```typescript
import { lexUri, TokType } from '@taskade/uri-parser';

const tokens = lexUri('http://example.com');
// Build your own parser logic here
```

## API Reference

### `parseUri(input: string): UriAst`

Main parser function that accepts a URI string and returns a full AST with tokens.

**Returns:** A `UriAst` with `kind: 'uri'` and optional components (`scheme`, `authority`, `query`, `fragment`).
Use `classifyUri(ast)` to derive the form (`absolute`, `network-path`, `host-path`, `absolute-path`, `relative`).

The AST uses `TextNode` for text values, where `TextNode` is `{ kind: 'text', text: string, tokens: Token[] }`.

**Throws:** `ParseError` if the input is invalid.

### `classifyUri(ast: UriAst): UriForm`

Classifies a parsed URI into one of: `absolute`, `network-path`, `host-path`, `absolute-path`, `relative`.

### `parseUrl(input: string): ParsedUrl`

Parses a URL (not just a URI), validates it, and normalizes key components.

**Normalization behavior:**
- Lowercases scheme and authority host
- Strips default ports for known schemes (http/https/ws/wss/ftp/ssh)
- Validates numeric port range (1–65535)

**Returns:** A simplified AST (values only) for URL kinds:
- `{ kind: 'absolute', scheme, authority, path, query?, fragment? }`
- `{ kind: 'network-path', authority, path, query?, fragment? }`
- `{ kind: 'host-path', authority, path, query?, fragment? }`

**Throws:** `UrlError` if the input is not a URL or fails validation.

### `nodeValue(node: TextNode | Query | Fragment | undefined): string | undefined`

Helper function to extract just the text value from a URI component.

**Returns:** The text value or `undefined` if the node doesn't exist.

### `lexUri(input: string): Token[]`

Tokenizes the input string into a stream of tokens.
Stops at the first whitespace character and ignores the rest of the input.
If you need to handle spaces, preprocess with `preprocessUri()` first.

**Returns:** Array of tokens with types:
- `IDENT`: Identifier (scheme, host, path segment, etc.)
- `Colon`: `:`
- `Slash`: `/`
- `DoubleSlash`: `//`
- `QuestionMark`: `?`
- `Hash`: `#`
- `At`: `@`
- `LBracket`: `[`
- `RBracket`: `]`
- `EOF`: End of input

## TypeScript Support

Full TypeScript definitions are included. All AST types are exported:

```typescript
import type {
  Authority,
  Fragment,
  ParsedUrl,
  Query,
  Scheme,
  TextNode,
  Token,
  TokType,
  UriAst,
} from '@taskade/uri-parser';

// Full AST with tokens
const fullAst: UriAst = parseUri('http://example.com');

// Normalized URL
const normalized: ParsedUrl = parseUrl('https://example.com:443/path');

// Working with Scheme
const schemeName = fullAst.scheme?.name.text;
```

## Motivation

URIs are fundamental to the web, yet parsing them correctly is surprisingly difficult. The WHATWG URL Standard provides one interpretation, but it's opinionated and doesn't fit all use cases.

This project treats URI parsing as a compiler problem, providing you with the tools to reason about URIs without imposing a single "correct" interpretation.

## Approach

Instead of relying on fragile regexes or opinionated parsers, we apply classic compiler techniques—lexing and parsing—to URI strings.

The lexer is:
- Generic and logic-light
- Focused on turning URI strings into meaningful token streams
- Designed to be used by custom parsers

The parser is:
- Built on top of the lexer
- Forgiving and permissive
- Produces a typed AST

If you need different semantics, you can:
- Write your own parser
- Extend or replace parts of the grammar
- Apply your own normalization rules

## Related

- [`@taskade/temporal-parser`](https://github.com/taskade/temporal-parser) — same compiler approach for ISO 8601, RFC 3339, and IXDTF

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for development setup and guidelines.

## License

MIT © [Taskade](https://taskade.com)
