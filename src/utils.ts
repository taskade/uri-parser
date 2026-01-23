// utils.ts
// Utility functions for working with the AST

import type { Authority, Fragment, Query, Scheme, TextNode, UriAst } from './parser-types.js';

// Extract just the text from a TextNode, Query, or Fragment
export function nodeValue(node: TextNode | Query | Fragment | undefined): string | undefined {
  if (!node) {
    return undefined;
  }
  // Check if it's a Query or Fragment (has 'kind' field)
  if ('kind' in node && (node.kind === 'query' || node.kind === 'fragment')) {
    return node.value.text;
  }
  // Otherwise it's a TextNode
  return (node as TextNode).text;
}

// Extract plain authority values from Authority
export function authorityValue(
  authority: Authority | undefined,
): { userinfo?: string; host: string; port?: string; source: 'slashes' | 'heuristic' } | undefined {
  if (!authority) {
    return undefined;
  }
  return {
    source: authority.source,
    userinfo: authority.userinfo?.text,
    host: authority.host.text,
    port: authority.port?.text,
  };
}

// Extract scheme name from Scheme
export function schemeValue(scheme: Scheme | undefined): string | undefined {
  return scheme?.name.text;
}

/**
 * Stringify URI AST back to string
 * @param ast - The URI AST to stringify
 * @param mode - 'preserve' keeps original structure, 'normalize' rewrites heuristic authority with //
 *
 * Note: This function reconstructs the URI from the AST structure, not from the original tokens.
 * For lossless reconstruction, iterate through the tokens array directly.
 */
export function stringifyUri(ast: UriAst, mode: 'preserve' | 'normalize' = 'preserve'): string {
  let result = '';

  // Scheme
  if (ast.scheme) {
    result += ast.scheme.name.text + ':';
  }

  // Authority
  if (ast.authority) {
    const { source, userinfo, host, port } = ast.authority;

    // Add slashes
    if (source === 'slashes' || mode === 'normalize') {
      result += '//';
    }

    // Userinfo
    if (userinfo) {
      result += userinfo.text + '@';
    }

    // Host
    result += host.text;

    // Port
    if (port) {
      result += ':' + port.text;
    }
  }

  // Path
  result += ast.path.text;

  // Query
  if (ast.query) {
    result += '?' + ast.query.value.text;
  }

  // Fragment
  if (ast.fragment) {
    result += '#' + ast.fragment.value.text;
  }

  return result;
}

/**
 * Preprocess a URI string for parsing by stripping surrounding whitespace
 * and encoding internal spaces.
 *
 * This is a convenience function for handling user input that may contain spaces.
 *
 * @param uri - The URI string to preprocess
 * @returns The preprocessed URI string ready for parsing
 *
 * @example
 * ```typescript
 * import { preprocessUri, parseUri } from '@taskade/uri-parser';
 *
 * const input = '  http://example.com/path with spaces  ';
 * const cleaned = preprocessUri(input);
 * const ast = parseUri(cleaned);
 * // Result: Successfully parsed with path '/path%20with%20spaces'
 * ```
 */
export function preprocessUri(uri: string): string {
  return uri.trim().replace(/ /g, '%20');
}
