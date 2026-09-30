// parser.ts
// A practical recursive-descent parser that works with the lexer we wrote.
// It builds a single-root AST (kind: 'uri') for all URIs with optional components:
// - scheme: http:
// - authority: //example.com or example.com (with heuristic detection)
// - path: /path or path
// - query: ?q=1
// - fragment: #frag
//
// This mirrors the temporal-parser philosophy:
// - Explicit tokens → shallow grammar → AST → later normalization
// - Parser is permissive and forgiving
// - AST preserves intent, not normalization

import { ParseError } from './errors.js';
import { lexUri } from './lexer.js';
import type { Token } from './lexer-types.js';
import { TokType } from './lexer-types.js';
import type {
  Authority,
  Fragment,
  Query,
  Scheme,
  TextNode,
  UriAst,
  UriForm,
} from './parser-types.js';

class Parser {
  private i = 0;
  private allTokens: Token[];

  constructor(tokens: Token[]) {
    this.allTokens = tokens;
  }

  // Helper to create a TextNode
  private makeTextNode(text: string, tokens: Token[]): TextNode {
    return { kind: 'text', text, tokens };
  }

  private peek(k = 0): Token {
    return this.allTokens[Math.min(this.i + k, this.allTokens.length - 1)]!;
  }

  private at(type: TokType): boolean {
    return this.peek().type === type;
  }

  private eat(type: TokType): Token {
    const t = this.peek();
    if (t.type !== type) {
      throw new ParseError(`Expected ${type} but got ${t.type}`, t.pos);
    }
    this.i++;
    return t;
  }

  private tryEat(type: TokType): Token | null {
    if (this.at(type)) {
      return this.eat(type);
    }
    return null;
  }

  private eof(): boolean {
    return this.at(TokType.EOF);
  }

  /**
   * Main parse entry point - returns single root UriAst
   */
  parse(): UriAst {
    const startPos = this.i;

    // Step A: Parse scheme (optional)
    const scheme = this.tryParseScheme();

    // Step B: Parse authority (optional, loose)
    const authority = this.tryParseAuthority(scheme !== undefined);

    // Step C: Parse path/query/fragment
    // Always allow @ and : in paths (they're valid path characters per RFC 3986)
    const path = this.parsePath(true);
    const queryFragment = this.parseQueryFragment();
    const query = queryFragment.query;
    const fragment = queryFragment.fragment;

    if (!this.eof()) {
      const t = this.peek();
      throw new ParseError(`Unexpected token ${t.type}`, t.pos);
    }

    // Collect all tokens from start to current position (excluding EOF)
    const tokens = this.allTokens.slice(startPos, this.i);

    return {
      kind: 'uri',
      scheme,
      authority,
      path,
      query,
      fragment,
      tokens,
    };
  }

  /**
   * Step A: Try to parse scheme
   * Detects <alpha>(<alnum|+|.|->)* ":" as scheme
   * Must disambiguate from host:port patterns
   *
   * Disambiguation logic:
   * - "localhost:3000" → host:port (looks like host AND numeric after colon)
   * - "example.com:80" → host:port (looks like host AND numeric after colon)
   * - "server:3000" → scheme:path (doesn't look like host, even with numeric port)
   * - "server:config" → scheme:path (non-numeric after colon)
   * - "http://server:config" → scheme + authority + path
   *
   * This means inputs like "server:3000" and "server:config" are treated as URIs
   * with scheme "server:" and path "3000" or "config", NOT as host:port.
   * If you want host:port, use "//server:3000" or ensure the identifier before
   * the colon matches the host heuristic (localhost, dotted name, IPv4, or IPv6).
   */
  private tryParseScheme(): Scheme | undefined {
    if (this.peek().type !== TokType.IDENT || this.peek(1).type !== TokType.Colon) {
      return undefined;
    }

    const afterColon = this.peek(2);

    // Disambiguate scheme: from host:port
    // Only treat as host:port if BOTH conditions are met:
    // 1. The identifier looks like a host (localhost, dotted name, IPv4, or IPv6)
    // 2. The part after colon is numeric
    // Examples: "localhost:3000" → host:port, "server:3000" → scheme:path
    const looksLikePort =
      this.looksLikeHost() && afterColon?.type === TokType.IDENT && /^\d+$/.test(afterColon.value);

    if (looksLikePort) {
      return undefined;
    }

    // Valid scheme detected
    const schemeToken = this.eat(TokType.IDENT);
    const colonToken = this.eat(TokType.Colon);

    return {
      kind: 'scheme',
      name: this.makeTextNode(schemeToken.value, [schemeToken]),
      colonToken: colonToken,
      tokens: [schemeToken, colonToken],
    };
  }

  /**
   * Step B: Try to parse authority (loose mode)
   * Two forms:
   * 1. Slashes form: //host[:port]
   * 2. Heuristic form: host[:port] (no //)
   */
  private tryParseAuthority(hasScheme: boolean): Authority | undefined {
    // Form 1: Slashes form (strict signal)
    const doubleSlash = this.tryEat(TokType.DoubleSlash);
    if (doubleSlash) {
      return this.parseAuthority('slashes', [doubleSlash]);
    }

    // Form 2: Heuristic form (no //)
    // Only attempt if:
    // - No scheme (e.g., example.com/path)
    // - OR scheme exists but no // follows (rare: http:example.com - decide behavior)
    if (!hasScheme && this.looksLikeHost()) {
      return this.parseAuthority('heuristic', undefined);
    }

    return undefined;
  }

  /**
   * Heuristic: looks like a host if:
   * - localhost
   * - contains a dot: example.com
   * - IPv4: 1.2.3.4
   * - bracketed IPv6: [::1]
   */
  private looksLikeHost(): boolean {
    const t = this.peek();

    // IPv6: [::1]
    if (t.type === TokType.LBracket) {
      return true;
    }

    if (t.type !== TokType.IDENT) {
      return false;
    }

    const v = t.value;

    // localhost
    if (v === 'localhost') {
      return true;
    }

    // Contains dot: example.com
    if (v.includes('.')) {
      return true;
    }

    // IPv4: 1.2.3.4 (simple check)
    if (/^\d+\.\d+\.\d+\.\d+$/.test(v)) {
      return true;
    }

    return false;
  }

  /**
   * Parse authority: [userinfo@]host[:port]
   * @param source - how authority was recognized ('slashes' or 'heuristic')
   * @param slashes - the // tokens if source is 'slashes'
   */
  private parseAuthority(source: 'slashes' | 'heuristic', slashes: Token[] | undefined): Authority {
    const authorityTokens: Token[] = slashes ? [...slashes] : [];
    let userinfo: TextNode | undefined;
    let host: TextNode;
    let port: TextNode | undefined;

    // Look ahead for userinfo@ pattern
    let hasUserinfo = false;
    let scanPos = this.i;
    while (
      scanPos < this.allTokens.length &&
      this.allTokens[scanPos]!.type !== TokType.EOF &&
      this.allTokens[scanPos]!.type !== TokType.Slash &&
      this.allTokens[scanPos]!.type !== TokType.QuestionMark &&
      this.allTokens[scanPos]!.type !== TokType.Hash
    ) {
      if (this.allTokens[scanPos]!.type === TokType.At) {
        hasUserinfo = true;
        break;
      }
      scanPos++;
    }

    // Parse userinfo if present
    if (hasUserinfo) {
      const parts: string[] = [];
      const userinfoTokens: Token[] = [];
      const userinfoStart = this.i;
      const authorityTokensStart = authorityTokens.length;
      while (!this.at(TokType.At)) {
        if (
          this.at(TokType.Slash) ||
          this.at(TokType.QuestionMark) ||
          this.at(TokType.Hash) ||
          this.eof()
        ) {
          // Stop userinfo parsing at authority terminators
          // Backtrack: reset position and remove tokens added to authorityTokens
          this.i = userinfoStart;
          parts.length = 0;
          userinfoTokens.length = 0;
          authorityTokens.length = authorityTokensStart;
          break;
        }
        const t = this.peek();
        parts.push(t.value);
        userinfoTokens.push(t);
        authorityTokens.push(t);
        this.i++;
      }
      if (this.at(TokType.At)) {
        const atToken = this.eat(TokType.At);
        authorityTokens.push(atToken);
        userinfo = this.makeTextNode(parts.join(''), userinfoTokens);
      }
    }

    // Parse host
    // IPv6: [::1]
    const lbracket = this.tryEat(TokType.LBracket);
    if (lbracket) {
      authorityTokens.push(lbracket);
      const parts: string[] = ['['];
      const hostTokens: Token[] = [lbracket];
      const ipv6Parts: string[] = [];
      while (!this.at(TokType.RBracket)) {
        if (this.eof()) {
          const t = this.peek();
          throw new ParseError('Unterminated IPv6 address', t.pos);
        }
        const t = this.peek();
        parts.push(t.value);
        ipv6Parts.push(t.value);
        hostTokens.push(t);
        authorityTokens.push(t);
        this.i++;
      }
      const rbracket = this.eat(TokType.RBracket);
      hostTokens.push(rbracket);
      authorityTokens.push(rbracket);
      parts.push(']');
      host = this.makeTextNode(parts.join(''), hostTokens);
    } else if (this.at(TokType.IDENT)) {
      // Regular host
      const hostToken = this.eat(TokType.IDENT);
      authorityTokens.push(hostToken);
      host = this.makeTextNode(hostToken.value, [hostToken]);
    } else {
      // Empty host (e.g., file:///)
      // Note: The parser is permissive and allows empty hosts for all schemes.
      // The file:// scheme is known to allow empty hosts (file:///path means localhost).
      // For stricter validation, use parseUrl() which enforces host requirements per scheme.
      host = this.makeTextNode('', []);
    }

    // Parse port if present
    const colonToken = this.tryEat(TokType.Colon);
    if (colonToken) {
      authorityTokens.push(colonToken);
      if (this.at(TokType.IDENT)) {
        const portToken = this.eat(TokType.IDENT);
        authorityTokens.push(portToken);
        port = this.makeTextNode(portToken.value, [portToken]);
      } else {
        const t = this.peek();
        throw new ParseError('Expected port after ":" in authority', t.pos);
      }
    }

    return {
      kind: 'authority',
      source,
      slashes,
      userinfo,
      host,
      port,
      tokens: authorityTokens,
    };
  }

  /**
   * Parse path segments
   * @param allowSchemeChars - if true, allow @ and : characters in the path
   *
   * The allowSchemeChars parameter exists to handle different URI contexts:
   * - In regular paths after authority: @ and : are valid path characters (RFC 3986)
   * - In scheme-only URIs (mailto:, urn:): @ and : appear in the path component
   * - In query strings: @ and : are common (e.g., ?email=user@example.com)
   * - In fragments: @ and : may appear (e.g., #section:subsection)
   *
   * Currently, this is always set to true in practice, but the parameter is kept
   * for potential future use cases where stricter parsing might be needed.
   */
  private parsePath(allowSchemeChars = false): TextNode {
    const parts: string[] = [];
    const tokens: Token[] = [];

    while (
      this.peek().type === TokType.IDENT ||
      this.peek().type === TokType.Slash ||
      (allowSchemeChars && this.peek().type === TokType.At) ||
      (allowSchemeChars && this.peek().type === TokType.Colon)
    ) {
      const t = this.peek();
      parts.push(t.value);
      tokens.push(t);
      this.i++;
    }

    return this.makeTextNode(parts.join(''), tokens);
  }

  /**
   * Parse query and fragment
   *
   * Query string parsing behavior:
   * - The parser treats the entire query string as a single value
   * - Characters like &, =, +, % are lexed as part of IDENT tokens
   * - No parsing of key-value pairs is performed (this is intentional)
   * - The query value preserves the original string exactly as written
   *
   * This design allows:
   * - Different query string formats (URL-encoded, JSON, custom)
   * - Preservation of original encoding
   * - Flexibility for application-specific query parsing
   *
   * If you need parsed key-value pairs, process the query.value.value string
   * with a dedicated query string parser (e.g., URLSearchParams, qs, query-string).
   *
   * Examples:
   * - "?key=value&foo=bar" → query.value.value = "key=value&foo=bar"
   * - "?json={\"a\":1}" → query.value.value = "json={\"a\":1}"
   * - "?search=hello+world" → query.value.value = "search=hello+world"
   */
  private parseQueryFragment(): {
    query?: Query;
    fragment?: Fragment;
  } {
    let query: Query | undefined;
    let fragment: Fragment | undefined;

    const questionMark = this.tryEat(TokType.QuestionMark);
    if (questionMark) {
      const queryPath = this.parsePath(true); // Allow @ and : in query strings
      query = {
        kind: 'query',
        delimiterToken: questionMark,
        value: queryPath,
        tokens: [questionMark, ...(queryPath.tokens ?? [])],
      };
    }

    const hashToken = this.tryEat(TokType.Hash);
    if (hashToken) {
      const fragmentPath = this.parsePath(true); // Allow @ and : in fragments
      fragment = {
        kind: 'fragment',
        delimiterToken: hashToken,
        value: fragmentPath,
        tokens: [hashToken, ...(fragmentPath.tokens ?? [])],
      };
    }

    return { query, fragment };
  }
}

// ---------- Public API ----------

/**
 * Parse URI and return full AST with tokens
 *
 * Note: This function is identical to parseUri(). Both names are provided for clarity:
 * - parseUri: Standard name, recommended for general use
 * - parseUriWithTokens: Explicit name emphasizing that tokens are included
 *
 * The AST always includes tokens for source mapping, syntax highlighting, and lossless
 * reconstruction. There is no "without tokens" variant because tokens are fundamental
 * to the parser's design.
 *
 * @param src - The URI string to parse
 */
export function parseUriWithTokens(src: string): UriAst {
  const tokens = lexUri(src);
  const parser = new Parser(tokens);
  return parser.parse();
}

/**
 * Parse URI and return AST (with tokens) - main export
 *
 * This is the primary parsing function. It returns a rich AST where each component
 * includes both its semantic value and the underlying tokens from the lexer.
 *
 * The AST structure preserves:
 * - Token positions for error reporting
 * - Original source text for lossless reconstruction
 * - Component boundaries for syntax highlighting
 *
 * For a simpler, normalized output without tokens, use parseUrl() instead.
 *
 * @param src - The URI string to parse
 *
 * @example
 * ```typescript
 * const ast = parseUri('http://[::1]/path');
 * ```
 */
export function parseUri(src: string): UriAst {
  return parseUriWithTokens(src);
}

/**
 * Classify a URI into its form (derived helper, not part of AST)
 */
export function classifyUri(u: UriAst): UriForm {
  if (u.scheme) {
    return 'absolute';
  }
  if (u.authority?.source === 'slashes') {
    return 'network-path';
  }
  if (u.authority?.source === 'heuristic') {
    return 'host-path';
  }
  if (u.path.text.startsWith('/')) {
    return 'absolute-path';
  }
  return 'relative';
}

/**
 * Validate URI AST invariants (for testing)
 */
export function validateUriAst(ast: UriAst): void {
  // Invariant: authority.source and slashes must be consistent
  if (ast.authority) {
    const { source, slashes } = ast.authority;
    if (source === 'slashes' && !slashes) {
      throw new Error(
        'Invariant violation: authority.source is "slashes" but slashes is undefined',
      );
    }
    if (source === 'heuristic' && slashes) {
      throw new Error(
        'Invariant violation: authority.source is "heuristic" but slashes is defined',
      );
    }
  }

  // Invariant: path always exists
  if (ast.path == null) {
    throw new Error('Invariant violation: path must always exist');
  }

  // Invariant: scheme structure
  if (ast.scheme) {
    if (ast.scheme.kind !== 'scheme') {
      throw new Error('Invariant violation: scheme.kind must be "scheme"');
    }
    // colon is optional when handcrafting AST
  }
}
