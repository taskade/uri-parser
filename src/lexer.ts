// lexer.ts
// URI lexer with support for various URL forms
//
// Supports:
// - Schemes: http:, https:, ftp:, etc.
// - Network-path URLs: //example.com
// - Host-path URLs: example.com, localhost:3000
// - Absolute paths: /path/to/resource
// - Relative paths: path/to/resource
// - IPv6 addresses: [::1], [2001:db8::1]
// - Userinfo: user@host, user:pass@host
// - Query strings: ?key=value&key2=value2
// - Fragments: #section
//
// Whitespace handling:
// - The lexer stops at the first whitespace character (space, tab, newline, etc.)
// - Any content after whitespace is silently dropped and not included in tokens
// - This is intentional: URIs cannot contain unencoded whitespace per RFC 3986
// - If you need to preserve content after whitespace, preprocess the input first
// - Use preprocessUri() utility to encode spaces as %20 before parsing
//
// Examples:
// - "http://example.com path" → lexes only "http://example.com"
// - "http://example.com\npath" → lexes only "http://example.com"
// - "http://example.com?q=hello world" → lexes only "http://example.com?q=hello"
//
// The lexer is permissive; the parser validates semantics.

import { LexError } from './errors.js';
import type { Token } from './lexer-types.js';
import { TokType } from './lexer-types.js';

export function lexUri(src: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const emit = (type: TokType, pos: number, value: string) => {
    tokens.push({ type, value, pos });
  };

  const peek = () => src[i];
  const next = () => src[i++];

  // Check if character is allowed in URI identifiers
  // Includes: ASCII, Unicode, and all non-delimiter, non-whitespace characters
  const isIdentChar = (ch: string | undefined): boolean => {
    if (ch === undefined) {
      return false;
    }
    // Structural characters that delimit URI components
    if (
      ch === '/' ||
      ch === ':' ||
      ch === '?' ||
      ch === '#' ||
      ch === '@' ||
      ch === '[' ||
      ch === ']'
    ) {
      return false;
    }
    // Whitespace stops parsing
    if (/\s/.test(ch)) {
      return false;
    }
    // Allow everything else, including Unicode characters
    return true;
  };

  while (i < src.length) {
    const ch = peek();

    // Whitespace stops parsing (URIs don't contain whitespace)
    if (ch !== undefined && /\s/.test(ch)) {
      break;
    }

    // Double slash (scheme-relative indicator)
    if (ch === '/' && src[i + 1] === '/') {
      emit(TokType.DoubleSlash, i, '//');
      i += 2;
      continue;
    }

    // Single-character tokens
    if (ch === ':') {
      emit(TokType.Colon, i, ':');
      i++;
      continue;
    }
    if (ch === '/') {
      emit(TokType.Slash, i, '/');
      i++;
      continue;
    }
    if (ch === '?') {
      emit(TokType.QuestionMark, i, '?');
      i++;
      continue;
    }
    if (ch === '#') {
      emit(TokType.Hash, i, '#');
      i++;
      continue;
    }
    if (ch === '@') {
      emit(TokType.At, i, '@');
      i++;
      continue;
    }
    if (ch === '[') {
      emit(TokType.LBracket, i, '[');
      i++;
      continue;
    }
    if (ch === ']') {
      emit(TokType.RBracket, i, ']');
      i++;
      continue;
    }

    // IDENT (host labels, scheme, path segments, query, fragment)
    if (isIdentChar(ch)) {
      const start = i;
      while (isIdentChar(peek())) {
        next();
      }
      emit(TokType.IDENT, start, src.slice(start, i));
      continue;
    }

    // Unknown character - stop lexing
    throw new LexError(`Unexpected character ${JSON.stringify(ch)}`, i);
  }

  emit(TokType.EOF, i, '');
  return tokens;
}
