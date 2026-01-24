// parser-types.ts
// AST types for the parser

import type { Token } from './lexer-types.js';

export type TextNode = {
  kind: 'text';
  text: string;
  tokens?: Token[];
};

/**
 * Scheme component: "<scheme>:"
 */
export type Scheme = {
  kind: 'scheme';
  name: TextNode; // e.g., "http"
  colonToken?: Token; // ':' - optional for handcrafting
  tokens?: Token[]; // full span tokens
};

/**
 * Authority component (loose mode)
 * Can be recognized with or without leading "//"
 *
 * The `source` field indicates how the authority was detected:
 * - 'slashes': Authority was explicitly marked with "//" prefix (e.g., //example.com)
 * - 'heuristic': Authority was detected without "//" using heuristics (e.g., example.com, localhost:3000)
 *
 * The heuristic detection looks for patterns like:
 * - "localhost"
 * - Dotted names (example.com)
 * - IPv4 addresses (192.168.1.1)
 * - IPv6 addresses ([::1])
 * - Single-label hostnames matching /^\p{L}[\p{L}\p{N}-]*$/u
 */
export type Authority = {
  kind: 'authority';
  source: 'slashes' | 'heuristic'; // how authority was recognized
  slashes?: Token[]; // present iff input had leading "//"
  userinfo?: TextNode; // optional
  host: TextNode;
  port?: TextNode;
  tokens?: Token[]; // full span tokens
};

/**
 * Query component: "?<query>"
 */
export type Query = {
  kind: 'query';
  delimiterToken?: Token; // '?' - optional for handcrafting
  value: TextNode; // query string content (without '?')
  tokens?: Token[]; // full span tokens including delimiter
};

/**
 * Fragment component: "#<fragment>"
 */
export type Fragment = {
  kind: 'fragment';
  delimiterToken?: Token; // '#' - optional for handcrafting
  value: TextNode; // fragment content (without '#')
  tokens?: Token[]; // full span tokens including delimiter
};

/**
 * Single root node for all URI parses
 */
export type UriAst = {
  kind: 'uri';

  scheme?: Scheme; // "<scheme>:"
  authority?: Authority; // with or without leading "//" (loose mode)

  path: TextNode; // may be empty
  query?: Query; // "?<query>"
  fragment?: Fragment; // "#<fragment>"

  tokens?: Token[]; // full span tokens
};

/**
 * Derived classification for URIs (not part of AST structure)
 */
export type UriForm =
  | 'absolute' // has scheme
  | 'network-path' // //host/path (no scheme, has slashes)
  | 'absolute-path' // /path (starts with /)
  | 'relative' // path (no scheme, no slashes, no leading /)
  | 'host-path'; // example.com/path (heuristic authority)
