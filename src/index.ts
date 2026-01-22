// index.ts
// Main entry point for the URI parser library

// Export lexer functionality
export { lexUri } from './lexer.js';

// Export lexer types
export type { Token } from './lexer-types.js';
export { TokType } from './lexer-types.js';

// Export parser functionality
export { type ParsedUrl, parseUrl } from './parse-url.js';
export { classifyUri, parseUri, parseUriWithTokens, validateUriAst } from './parser.js';

// Export parser types (with tokens)
export type {
  Authority,
  Fragment,
  Query,
  Scheme,
  TextNode,
  UriAst,
  UriForm,
} from './parser-types.js';

// Export utilities
export { authorityValue, nodeValue, preprocessUri, schemeValue, stringifyUri } from './utils.js';

// Export errors
export { LexError, ParseError, UrlError } from './errors.js';
