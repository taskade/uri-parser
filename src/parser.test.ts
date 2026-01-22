// parser.test.ts
import { describe, expect, it } from 'vitest';

import { ParseError } from './errors.js';
import { TokType } from './lexer-types.js';
import { classifyUri, parseUri, validateUriAst } from './parser.js';

describe('parseUri', () => {
  describe('scheme-relative URLs (network-path)', () => {
    it('should parse //example.com', () => {
      const ast = parseUri('//example.com');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 0 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 2 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 0 },
            { type: TokType.IDENT, value: 'example.com', pos: 2 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.DoubleSlash, value: '//', pos: 0 },
          { type: TokType.IDENT, value: 'example.com', pos: 2 },
        ],
      });
      expect(ast.authority?.slashes).toHaveLength(1);
      expect(ast.authority?.slashes?.[0]?.type).toBe(TokType.DoubleSlash);
      validateUriAst(ast);
    });

    it('should parse //example.com:3000', () => {
      const ast = parseUri('//example.com:3000');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 0 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 2 }],
          },
          port: {
            kind: 'text',
            text: '3000',
            tokens: [{ type: TokType.IDENT, value: '3000', pos: 14 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 0 },
            { type: TokType.IDENT, value: 'example.com', pos: 2 },
            { type: TokType.Colon, value: ':', pos: 13 },
            { type: TokType.IDENT, value: '3000', pos: 14 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.DoubleSlash, value: '//', pos: 0 },
          { type: TokType.IDENT, value: 'example.com', pos: 2 },
          { type: TokType.Colon, value: ':', pos: 13 },
          { type: TokType.IDENT, value: '3000', pos: 14 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse //example.com/path', () => {
      const ast = parseUri('//example.com/path');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 0 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 2 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 0 },
            { type: TokType.IDENT, value: 'example.com', pos: 2 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 13 },
            { type: TokType.IDENT, value: 'path', pos: 14 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.DoubleSlash, value: '//', pos: 0 },
          { type: TokType.IDENT, value: 'example.com', pos: 2 },
          { type: TokType.Slash, value: '/', pos: 13 },
          { type: TokType.IDENT, value: 'path', pos: 14 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse //user@example.com', () => {
      const ast = parseUri('//user@example.com');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 0 }],
          userinfo: {
            kind: 'text',
            text: 'user',
            tokens: [{ type: TokType.IDENT, value: 'user', pos: 2 }],
          },
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 0 },
            { type: TokType.IDENT, value: 'user', pos: 2 },
            { type: TokType.At, value: '@', pos: 6 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.DoubleSlash, value: '//', pos: 0 },
          { type: TokType.IDENT, value: 'user', pos: 2 },
          { type: TokType.At, value: '@', pos: 6 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
        ],
      });
      validateUriAst(ast);
    });

    it('should not treat @ after path as userinfo', () => {
      const ast = parseUri('//user/path@host');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 0 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'user',
            tokens: [{ type: TokType.IDENT, value: 'user', pos: 2 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 0 },
            { type: TokType.IDENT, value: 'user', pos: 2 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path@host',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 6 },
            { type: TokType.IDENT, value: 'path', pos: 7 },
            { type: TokType.At, value: '@', pos: 11 },
            { type: TokType.IDENT, value: 'host', pos: 12 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.DoubleSlash, value: '//', pos: 0 },
          { type: TokType.IDENT, value: 'user', pos: 2 },
          { type: TokType.Slash, value: '/', pos: 6 },
          { type: TokType.IDENT, value: 'path', pos: 7 },
          { type: TokType.At, value: '@', pos: 11 },
          { type: TokType.IDENT, value: 'host', pos: 12 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('absolute URLs with scheme', () => {
    it('should parse http://example.com', () => {
      const ast = parseUri('http://example.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
        ],
      });
      expect(ast.scheme?.colon.type).toBe(TokType.Colon);
      validateUriAst(ast);
    });

    it('should parse https://example.com:443', () => {
      const ast = parseUri('https://example.com:443');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'https',
            tokens: [{ type: TokType.IDENT, value: 'https', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 5 },
          tokens: [
            { type: TokType.IDENT, value: 'https', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 5 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 6 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 8 }],
          },
          port: {
            kind: 'text',
            text: '443',
            tokens: [{ type: TokType.IDENT, value: '443', pos: 20 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 6 },
            { type: TokType.IDENT, value: 'example.com', pos: 8 },
            { type: TokType.Colon, value: ':', pos: 19 },
            { type: TokType.IDENT, value: '443', pos: 20 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'https', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 5 },
          { type: TokType.DoubleSlash, value: '//', pos: 6 },
          { type: TokType.IDENT, value: 'example.com', pos: 8 },
          { type: TokType.Colon, value: ':', pos: 19 },
          { type: TokType.IDENT, value: '443', pos: 20 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse http://example.com/path?query=1#fragment', () => {
      const ast = parseUri('http://example.com/path?query=1#fragment');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: 'path', pos: 19 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 23 },
          value: {
            kind: 'text',
            text: 'query=1',
            tokens: [{ type: TokType.IDENT, value: 'query=1', pos: 24 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 23 },
            { type: TokType.IDENT, value: 'query=1', pos: 24 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 31 },
          value: {
            kind: 'text',
            text: 'fragment',
            tokens: [{ type: TokType.IDENT, value: 'fragment', pos: 32 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 31 },
            { type: TokType.IDENT, value: 'fragment', pos: 32 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: 'path', pos: 19 },
          { type: TokType.QuestionMark, value: '?', pos: 23 },
          { type: TokType.IDENT, value: 'query=1', pos: 24 },
          { type: TokType.Hash, value: '#', pos: 31 },
          { type: TokType.IDENT, value: 'fragment', pos: 32 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse ftp://user:pass@example.com', () => {
      const ast = parseUri('ftp://user:pass@example.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ftp',
            tokens: [{ type: TokType.IDENT, value: 'ftp', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'ftp', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          userinfo: {
            kind: 'text',
            text: 'user:pass',
            tokens: [
              { type: TokType.IDENT, value: 'user', pos: 6 },
              { type: TokType.Colon, value: ':', pos: 10 },
              { type: TokType.IDENT, value: 'pass', pos: 11 },
            ],
          },
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 16 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'user', pos: 6 },
            { type: TokType.Colon, value: ':', pos: 10 },
            { type: TokType.IDENT, value: 'pass', pos: 11 },
            { type: TokType.At, value: '@', pos: 15 },
            { type: TokType.IDENT, value: 'example.com', pos: 16 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ftp', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'user', pos: 6 },
          { type: TokType.Colon, value: ':', pos: 10 },
          { type: TokType.IDENT, value: 'pass', pos: 11 },
          { type: TokType.At, value: '@', pos: 15 },
          { type: TokType.IDENT, value: 'example.com', pos: 16 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse mailto:user@example.com (no authority)', () => {
      const ast = parseUri('mailto:user@example.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'mailto',
            tokens: [{ type: TokType.IDENT, value: 'mailto', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 6 },
          tokens: [
            { type: TokType.IDENT, value: 'mailto', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 6 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: 'user@example.com',
          tokens: [
            { type: TokType.IDENT, value: 'user', pos: 7 },
            { type: TokType.At, value: '@', pos: 11 },
            { type: TokType.IDENT, value: 'example.com', pos: 12 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'mailto', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.IDENT, value: 'user', pos: 7 },
          { type: TokType.At, value: '@', pos: 11 },
          { type: TokType.IDENT, value: 'example.com', pos: 12 },
        ],
      });
      validateUriAst(ast);
    });

    it('should allow @ and : in path, query, and fragment', () => {
      const ast = parseUri('http://example.com/path@seg:1?query@part:2#frag@part:3');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path@seg:1',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: 'path', pos: 19 },
            { type: TokType.At, value: '@', pos: 23 },
            { type: TokType.IDENT, value: 'seg', pos: 24 },
            { type: TokType.Colon, value: ':', pos: 27 },
            { type: TokType.IDENT, value: '1', pos: 28 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 29 },
          value: {
            kind: 'text',
            text: 'query@part:2',
            tokens: [
              { type: TokType.IDENT, value: 'query', pos: 30 },
              { type: TokType.At, value: '@', pos: 35 },
              { type: TokType.IDENT, value: 'part', pos: 36 },
              { type: TokType.Colon, value: ':', pos: 40 },
              { type: TokType.IDENT, value: '2', pos: 41 },
            ],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 29 },
            { type: TokType.IDENT, value: 'query', pos: 30 },
            { type: TokType.At, value: '@', pos: 35 },
            { type: TokType.IDENT, value: 'part', pos: 36 },
            { type: TokType.Colon, value: ':', pos: 40 },
            { type: TokType.IDENT, value: '2', pos: 41 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 42 },
          value: {
            kind: 'text',
            text: 'frag@part:3',
            tokens: [
              { type: TokType.IDENT, value: 'frag', pos: 43 },
              { type: TokType.At, value: '@', pos: 47 },
              { type: TokType.IDENT, value: 'part', pos: 48 },
              { type: TokType.Colon, value: ':', pos: 52 },
              { type: TokType.IDENT, value: '3', pos: 53 },
            ],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 42 },
            { type: TokType.IDENT, value: 'frag', pos: 43 },
            { type: TokType.At, value: '@', pos: 47 },
            { type: TokType.IDENT, value: 'part', pos: 48 },
            { type: TokType.Colon, value: ':', pos: 52 },
            { type: TokType.IDENT, value: '3', pos: 53 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: 'path', pos: 19 },
          { type: TokType.At, value: '@', pos: 23 },
          { type: TokType.IDENT, value: 'seg', pos: 24 },
          { type: TokType.Colon, value: ':', pos: 27 },
          { type: TokType.IDENT, value: '1', pos: 28 },
          { type: TokType.QuestionMark, value: '?', pos: 29 },
          { type: TokType.IDENT, value: 'query', pos: 30 },
          { type: TokType.At, value: '@', pos: 35 },
          { type: TokType.IDENT, value: 'part', pos: 36 },
          { type: TokType.Colon, value: ':', pos: 40 },
          { type: TokType.IDENT, value: '2', pos: 41 },
          { type: TokType.Hash, value: '#', pos: 42 },
          { type: TokType.IDENT, value: 'frag', pos: 43 },
          { type: TokType.At, value: '@', pos: 47 },
          { type: TokType.IDENT, value: 'part', pos: 48 },
          { type: TokType.Colon, value: ':', pos: 52 },
          { type: TokType.IDENT, value: '3', pos: 53 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('host-path URLs (heuristic authority)', () => {
    it('should parse example.com', () => {
      const ast = parseUri('example.com');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 0 }],
          },
          port: undefined,
          tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 0 }],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 0 }],
      });
      validateUriAst(ast);
    });

    it('should parse single-label hostnames', () => {
      const ast = parseUri('intranet');
      expect(classifyUri(ast)).toBe('relative');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: 'intranet',
          tokens: [{ type: TokType.IDENT, value: 'intranet', pos: 0 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [{ type: TokType.IDENT, value: 'intranet', pos: 0 }],
      });
      validateUriAst(ast);
    });

    it('should parse single-label hostnames with ports', () => {
      const ast = parseUri('devbox:8080');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'devbox',
            tokens: [{ type: TokType.IDENT, value: 'devbox', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 6 },
          tokens: [
            { type: TokType.IDENT, value: 'devbox', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 6 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '8080',
          tokens: [{ type: TokType.IDENT, value: '8080', pos: 7 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'devbox', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.IDENT, value: '8080', pos: 7 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse localhost:3000', () => {
      const ast = parseUri('localhost:3000');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'localhost',
            tokens: [{ type: TokType.IDENT, value: 'localhost', pos: 0 }],
          },
          port: {
            kind: 'text',
            text: '3000',
            tokens: [{ type: TokType.IDENT, value: '3000', pos: 10 }],
          },
          tokens: [
            { type: TokType.IDENT, value: 'localhost', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 9 },
            { type: TokType.IDENT, value: '3000', pos: 10 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'localhost', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 9 },
          { type: TokType.IDENT, value: '3000', pos: 10 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse 192.168.1.1', () => {
      const ast = parseUri('192.168.1.1');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: '192.168.1.1',
            tokens: [{ type: TokType.IDENT, value: '192.168.1.1', pos: 0 }],
          },
          port: undefined,
          tokens: [{ type: TokType.IDENT, value: '192.168.1.1', pos: 0 }],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [{ type: TokType.IDENT, value: '192.168.1.1', pos: 0 }],
      });
      validateUriAst(ast);
    });

    it('should parse example.com/path?query#fragment', () => {
      const ast = parseUri('example.com/path?query#fragment');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 0 }],
          },
          port: undefined,
          tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 0 }],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 11 },
            { type: TokType.IDENT, value: 'path', pos: 12 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 16 },
          value: {
            kind: 'text',
            text: 'query',
            tokens: [{ type: TokType.IDENT, value: 'query', pos: 17 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 16 },
            { type: TokType.IDENT, value: 'query', pos: 17 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 22 },
          value: {
            kind: 'text',
            text: 'fragment',
            tokens: [{ type: TokType.IDENT, value: 'fragment', pos: 23 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 22 },
            { type: TokType.IDENT, value: 'fragment', pos: 23 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'example.com', pos: 0 },
          { type: TokType.Slash, value: '/', pos: 11 },
          { type: TokType.IDENT, value: 'path', pos: 12 },
          { type: TokType.QuestionMark, value: '?', pos: 16 },
          { type: TokType.IDENT, value: 'query', pos: 17 },
          { type: TokType.Hash, value: '#', pos: 22 },
          { type: TokType.IDENT, value: 'fragment', pos: 23 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse IPv6 host-path URLs', () => {
      const ast = parseUri('[::1]:8080/path');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: '[::1]',
            tokens: [
              { type: TokType.LBracket, value: '[', pos: 0 },
              { type: TokType.Colon, value: ':', pos: 1 },
              { type: TokType.Colon, value: ':', pos: 2 },
              { type: TokType.IDENT, value: '1', pos: 3 },
              { type: TokType.RBracket, value: ']', pos: 4 },
            ],
          },
          port: {
            kind: 'text',
            text: '8080',
            tokens: [{ type: TokType.IDENT, value: '8080', pos: 6 }],
          },
          tokens: [
            { type: TokType.LBracket, value: '[', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 1 },
            { type: TokType.Colon, value: ':', pos: 2 },
            { type: TokType.IDENT, value: '1', pos: 3 },
            { type: TokType.RBracket, value: ']', pos: 4 },
            { type: TokType.Colon, value: ':', pos: 5 },
            { type: TokType.IDENT, value: '8080', pos: 6 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 10 },
            { type: TokType.IDENT, value: 'path', pos: 11 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.LBracket, value: '[', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 1 },
          { type: TokType.Colon, value: ':', pos: 2 },
          { type: TokType.IDENT, value: '1', pos: 3 },
          { type: TokType.RBracket, value: ']', pos: 4 },
          { type: TokType.Colon, value: ':', pos: 5 },
          { type: TokType.IDENT, value: '8080', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 10 },
          { type: TokType.IDENT, value: 'path', pos: 11 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('authority validation', () => {
    it('should reject empty port declarations', () => {
      expect(() => parseUri('http://example.com:/path')).toThrow(ParseError);
    });
  });

  describe('absolute paths', () => {
    it('should parse /path', () => {
      const ast = parseUri('/path');
      expect(classifyUri(ast)).toBe('absolute-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 0 },
            { type: TokType.IDENT, value: 'path', pos: 1 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.Slash, value: '/', pos: 0 },
          { type: TokType.IDENT, value: 'path', pos: 1 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse /path/to/resource', () => {
      const ast = parseUri('/path/to/resource');
      expect(classifyUri(ast)).toBe('absolute-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: '/path/to/resource',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 0 },
            { type: TokType.IDENT, value: 'path', pos: 1 },
            { type: TokType.Slash, value: '/', pos: 5 },
            { type: TokType.IDENT, value: 'to', pos: 6 },
            { type: TokType.Slash, value: '/', pos: 8 },
            { type: TokType.IDENT, value: 'resource', pos: 9 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.Slash, value: '/', pos: 0 },
          { type: TokType.IDENT, value: 'path', pos: 1 },
          { type: TokType.Slash, value: '/', pos: 5 },
          { type: TokType.IDENT, value: 'to', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 8 },
          { type: TokType.IDENT, value: 'resource', pos: 9 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse /path?query=1#fragment', () => {
      const ast = parseUri('/path?query=1#fragment');
      expect(classifyUri(ast)).toBe('absolute-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 0 },
            { type: TokType.IDENT, value: 'path', pos: 1 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 5 },
          value: {
            kind: 'text',
            text: 'query=1',
            tokens: [{ type: TokType.IDENT, value: 'query=1', pos: 6 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 5 },
            { type: TokType.IDENT, value: 'query=1', pos: 6 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 13 },
          value: {
            kind: 'text',
            text: 'fragment',
            tokens: [{ type: TokType.IDENT, value: 'fragment', pos: 14 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 13 },
            { type: TokType.IDENT, value: 'fragment', pos: 14 },
          ],
        },
        tokens: [
          { type: TokType.Slash, value: '/', pos: 0 },
          { type: TokType.IDENT, value: 'path', pos: 1 },
          { type: TokType.QuestionMark, value: '?', pos: 5 },
          { type: TokType.IDENT, value: 'query=1', pos: 6 },
          { type: TokType.Hash, value: '#', pos: 13 },
          { type: TokType.IDENT, value: 'fragment', pos: 14 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('relative paths', () => {
    it('should parse path', () => {
      const ast = parseUri('path');
      expect(classifyUri(ast)).toBe('relative');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: 'path',
          tokens: [{ type: TokType.IDENT, value: 'path', pos: 0 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [{ type: TokType.IDENT, value: 'path', pos: 0 }],
      });
      validateUriAst(ast);
    });

    it('should parse path/to/resource', () => {
      const ast = parseUri('path/to/resource');
      expect(classifyUri(ast)).toBe('relative');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: 'path/to/resource',
          tokens: [
            { type: TokType.IDENT, value: 'path', pos: 0 },
            { type: TokType.Slash, value: '/', pos: 4 },
            { type: TokType.IDENT, value: 'to', pos: 5 },
            { type: TokType.Slash, value: '/', pos: 7 },
            { type: TokType.IDENT, value: 'resource', pos: 8 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'path', pos: 0 },
          { type: TokType.Slash, value: '/', pos: 4 },
          { type: TokType.IDENT, value: 'to', pos: 5 },
          { type: TokType.Slash, value: '/', pos: 7 },
          { type: TokType.IDENT, value: 'resource', pos: 8 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse path?query#fragment', () => {
      const ast = parseUri('path?query#fragment');
      expect(classifyUri(ast)).toBe('relative');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: 'path',
          tokens: [{ type: TokType.IDENT, value: 'path', pos: 0 }],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 4 },
          value: {
            kind: 'text',
            text: 'query',
            tokens: [{ type: TokType.IDENT, value: 'query', pos: 5 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 4 },
            { type: TokType.IDENT, value: 'query', pos: 5 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 10 },
          value: {
            kind: 'text',
            text: 'fragment',
            tokens: [{ type: TokType.IDENT, value: 'fragment', pos: 11 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 10 },
            { type: TokType.IDENT, value: 'fragment', pos: 11 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'path', pos: 0 },
          { type: TokType.QuestionMark, value: '?', pos: 4 },
          { type: TokType.IDENT, value: 'query', pos: 5 },
          { type: TokType.Hash, value: '#', pos: 10 },
          { type: TokType.IDENT, value: 'fragment', pos: 11 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('IPv6 addresses', () => {
    it('should parse http://[::1]', () => {
      const ast = parseUri('http://[::1]');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: '[::1]',
            tokens: [
              { type: TokType.LBracket, value: '[', pos: 7 },
              { type: TokType.Colon, value: ':', pos: 8 },
              { type: TokType.Colon, value: ':', pos: 9 },
              { type: TokType.IDENT, value: '1', pos: 10 },
              { type: TokType.RBracket, value: ']', pos: 11 },
            ],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.LBracket, value: '[', pos: 7 },
            { type: TokType.Colon, value: ':', pos: 8 },
            { type: TokType.Colon, value: ':', pos: 9 },
            { type: TokType.IDENT, value: '1', pos: 10 },
            { type: TokType.RBracket, value: ']', pos: 11 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.LBracket, value: '[', pos: 7 },
          { type: TokType.Colon, value: ':', pos: 8 },
          { type: TokType.Colon, value: ':', pos: 9 },
          { type: TokType.IDENT, value: '1', pos: 10 },
          { type: TokType.RBracket, value: ']', pos: 11 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse http://[2001:db8::1]:8080', () => {
      const ast = parseUri('http://[2001:db8::1]:8080');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: '[2001:db8::1]',
            tokens: [
              { type: TokType.LBracket, value: '[', pos: 7 },
              { type: TokType.IDENT, value: '2001', pos: 8 },
              { type: TokType.Colon, value: ':', pos: 12 },
              { type: TokType.IDENT, value: 'db8', pos: 13 },
              { type: TokType.Colon, value: ':', pos: 16 },
              { type: TokType.Colon, value: ':', pos: 17 },
              { type: TokType.IDENT, value: '1', pos: 18 },
              { type: TokType.RBracket, value: ']', pos: 19 },
            ],
          },
          port: {
            kind: 'text',
            text: '8080',
            tokens: [{ type: TokType.IDENT, value: '8080', pos: 21 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.LBracket, value: '[', pos: 7 },
            { type: TokType.IDENT, value: '2001', pos: 8 },
            { type: TokType.Colon, value: ':', pos: 12 },
            { type: TokType.IDENT, value: 'db8', pos: 13 },
            { type: TokType.Colon, value: ':', pos: 16 },
            { type: TokType.Colon, value: ':', pos: 17 },
            { type: TokType.IDENT, value: '1', pos: 18 },
            { type: TokType.RBracket, value: ']', pos: 19 },
            { type: TokType.Colon, value: ':', pos: 20 },
            { type: TokType.IDENT, value: '8080', pos: 21 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.LBracket, value: '[', pos: 7 },
          { type: TokType.IDENT, value: '2001', pos: 8 },
          { type: TokType.Colon, value: ':', pos: 12 },
          { type: TokType.IDENT, value: 'db8', pos: 13 },
          { type: TokType.Colon, value: ':', pos: 16 },
          { type: TokType.Colon, value: ':', pos: 17 },
          { type: TokType.IDENT, value: '1', pos: 18 },
          { type: TokType.RBracket, value: ']', pos: 19 },
          { type: TokType.Colon, value: ':', pos: 20 },
          { type: TokType.IDENT, value: '8080', pos: 21 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('edge cases', () => {
    it('should parse empty query', () => {
      const ast = parseUri('http://example.com?');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 18 },
          value: {
            kind: 'text',
            text: '',
            tokens: [],
          },
          tokens: [{ type: TokType.QuestionMark, value: '?', pos: 18 }],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.QuestionMark, value: '?', pos: 18 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse empty fragment', () => {
      const ast = parseUri('http://example.com#');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 18 },
          value: {
            kind: 'text',
            text: '',
            tokens: [],
          },
          tokens: [{ type: TokType.Hash, value: '#', pos: 18 }],
        },
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Hash, value: '#', pos: 18 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse complex query string', () => {
      const ast = parseUri('http://example.com?key1=value1&key2=value2');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 18 },
          value: {
            kind: 'text',
            text: 'key1=value1&key2=value2',
            tokens: [{ type: TokType.IDENT, value: 'key1=value1&key2=value2', pos: 19 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 18 },
            { type: TokType.IDENT, value: 'key1=value1&key2=value2', pos: 19 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.QuestionMark, value: '?', pos: 18 },
          { type: TokType.IDENT, value: 'key1=value1&key2=value2', pos: 19 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse percent-encoded path', () => {
      const ast = parseUri('http://example.com/path%20with%20spaces');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path%20with%20spaces',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: 'path%20with%20spaces', pos: 19 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: 'path%20with%20spaces', pos: 19 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('Unicode support', () => {
    it('should parse Unicode in hostname (IDN)', () => {
      const ast = parseUri('https://münchen.de/path');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'https',
            tokens: [{ type: TokType.IDENT, value: 'https', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 5 },
          tokens: [
            { type: TokType.IDENT, value: 'https', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 5 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 6 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'münchen.de',
            tokens: [{ type: TokType.IDENT, value: 'münchen.de', pos: 8 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 6 },
            { type: TokType.IDENT, value: 'münchen.de', pos: 8 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: 'path', pos: 19 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'https', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 5 },
          { type: TokType.DoubleSlash, value: '//', pos: 6 },
          { type: TokType.IDENT, value: 'münchen.de', pos: 8 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: 'path', pos: 19 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Unicode in path (Chinese characters)', () => {
      const ast = parseUri('http://example.com/文档/资料');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/文档/资料',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: '文档', pos: 19 },
            { type: TokType.Slash, value: '/', pos: 21 },
            { type: TokType.IDENT, value: '资料', pos: 22 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: '文档', pos: 19 },
          { type: TokType.Slash, value: '/', pos: 21 },
          { type: TokType.IDENT, value: '资料', pos: 22 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Unicode in query string (Japanese)', () => {
      const ast = parseUri('http://example.com?名前=値&キー=バリュー');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 18 },
          value: {
            kind: 'text',
            text: '名前=値&キー=バリュー',
            tokens: [{ type: TokType.IDENT, value: '名前=値&キー=バリュー', pos: 19 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 18 },
            { type: TokType.IDENT, value: '名前=値&キー=バリュー', pos: 19 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.QuestionMark, value: '?', pos: 18 },
          { type: TokType.IDENT, value: '名前=値&キー=バリュー', pos: 19 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Unicode in fragment (Russian)', () => {
      const ast = parseUri('http://example.com#секция');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 18 },
          value: {
            kind: 'text',
            text: 'секция',
            tokens: [{ type: TokType.IDENT, value: 'секция', pos: 19 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 18 },
            { type: TokType.IDENT, value: 'секция', pos: 19 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Hash, value: '#', pos: 18 },
          { type: TokType.IDENT, value: 'секция', pos: 19 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Unicode in userinfo', () => {
      const ast = parseUri('ftp://用户:密码@example.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ftp',
            tokens: [{ type: TokType.IDENT, value: 'ftp', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'ftp', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          userinfo: {
            kind: 'text',
            text: '用户:密码',
            tokens: [
              { type: TokType.IDENT, value: '用户', pos: 6 },
              { type: TokType.Colon, value: ':', pos: 8 },
              { type: TokType.IDENT, value: '密码', pos: 9 },
            ],
          },
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 12 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: '用户', pos: 6 },
            { type: TokType.Colon, value: ':', pos: 8 },
            { type: TokType.IDENT, value: '密码', pos: 9 },
            { type: TokType.At, value: '@', pos: 11 },
            { type: TokType.IDENT, value: 'example.com', pos: 12 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ftp', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: '用户', pos: 6 },
          { type: TokType.Colon, value: ':', pos: 8 },
          { type: TokType.IDENT, value: '密码', pos: 9 },
          { type: TokType.At, value: '@', pos: 11 },
          { type: TokType.IDENT, value: 'example.com', pos: 12 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Unicode emoji in path', () => {
      const ast = parseUri('http://example.com/🎉/celebration');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/🎉/celebration',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: '🎉', pos: 19 },
            { type: TokType.Slash, value: '/', pos: 21 },
            { type: TokType.IDENT, value: 'celebration', pos: 22 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: '🎉', pos: 19 },
          { type: TokType.Slash, value: '/', pos: 21 },
          { type: TokType.IDENT, value: 'celebration', pos: 22 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse mixed Unicode and ASCII', () => {
      const ast = parseUri('http://example.com/docs/文档?lang=中文&page=1#section-內容');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'http',
            tokens: [{ type: TokType.IDENT, value: 'http', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'http', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 7 }],
          },
          port: undefined,
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'example.com', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/docs/文档',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 18 },
            { type: TokType.IDENT, value: 'docs', pos: 19 },
            { type: TokType.Slash, value: '/', pos: 23 },
            { type: TokType.IDENT, value: '文档', pos: 24 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 26 },
          value: {
            kind: 'text',
            text: 'lang=中文&page=1',
            tokens: [{ type: TokType.IDENT, value: 'lang=中文&page=1', pos: 27 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 26 },
            { type: TokType.IDENT, value: 'lang=中文&page=1', pos: 27 },
          ],
        },
        fragment: {
          kind: 'fragment',
          delimiter: { type: TokType.Hash, value: '#', pos: 41 },
          value: {
            kind: 'text',
            text: 'section-內容',
            tokens: [{ type: TokType.IDENT, value: 'section-內容', pos: 42 }],
          },
          tokens: [
            { type: TokType.Hash, value: '#', pos: 41 },
            { type: TokType.IDENT, value: 'section-內容', pos: 42 },
          ],
        },
        tokens: [
          { type: TokType.IDENT, value: 'http', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'example.com', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 18 },
          { type: TokType.IDENT, value: 'docs', pos: 19 },
          { type: TokType.Slash, value: '/', pos: 23 },
          { type: TokType.IDENT, value: '文档', pos: 24 },
          { type: TokType.QuestionMark, value: '?', pos: 26 },
          { type: TokType.IDENT, value: 'lang=中文&page=1', pos: 27 },
          { type: TokType.Hash, value: '#', pos: 41 },
          { type: TokType.IDENT, value: 'section-內容', pos: 42 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Arabic Unicode in host-path URL', () => {
      const ast = parseUri('موقع.com/path');
      expect(classifyUri(ast)).toBe('host-path');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: {
          kind: 'authority',
          source: 'heuristic',
          slashes: undefined,
          userinfo: undefined,
          host: {
            kind: 'text',
            text: 'موقع.com',
            tokens: [{ type: TokType.IDENT, value: 'موقع.com', pos: 0 }],
          },
          port: undefined,
          tokens: [{ type: TokType.IDENT, value: 'موقع.com', pos: 0 }],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 8 },
            { type: TokType.IDENT, value: 'path', pos: 9 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'موقع.com', pos: 0 },
          { type: TokType.Slash, value: '/', pos: 8 },
          { type: TokType.IDENT, value: 'path', pos: 9 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Hebrew Unicode in relative path', () => {
      const ast = parseUri('תיקייה/קובץ.txt');
      expect(classifyUri(ast)).toBe('relative');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: undefined,
        authority: undefined,
        path: {
          kind: 'text',
          text: 'תיקייה/קובץ.txt',
          tokens: [
            { type: TokType.IDENT, value: 'תיקייה', pos: 0 },
            { type: TokType.Slash, value: '/', pos: 6 },
            { type: TokType.IDENT, value: 'קובץ.txt', pos: 7 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'תיקייה', pos: 0 },
          { type: TokType.Slash, value: '/', pos: 6 },
          { type: TokType.IDENT, value: 'קובץ.txt', pos: 7 },
        ],
      });
      validateUriAst(ast);
    });

    it('should parse Korean Unicode in mailto scheme', () => {
      const ast = parseUri('mailto:사용자@예제.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'mailto',
            tokens: [{ type: TokType.IDENT, value: 'mailto', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 6 },
          tokens: [
            { type: TokType.IDENT, value: 'mailto', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 6 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '사용자@예제.com',
          tokens: [
            { type: TokType.IDENT, value: '사용자', pos: 7 },
            { type: TokType.At, value: '@', pos: 10 },
            { type: TokType.IDENT, value: '예제.com', pos: 11 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'mailto', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.IDENT, value: '사용자', pos: 7 },
          { type: TokType.At, value: '@', pos: 10 },
          { type: TokType.IDENT, value: '예제.com', pos: 11 },
        ],
      });
      validateUriAst(ast);
    });
  });

  describe('classifyUri helper', () => {
    it('should classify absolute URIs', () => {
      expect(classifyUri(parseUri('http://example.com'))).toBe('absolute');
      expect(classifyUri(parseUri('https://example.com:443'))).toBe('absolute');
      expect(classifyUri(parseUri('mailto:user@example.com'))).toBe('absolute');
    });

    it('should classify network-path URIs', () => {
      expect(classifyUri(parseUri('//example.com'))).toBe('network-path');
      expect(classifyUri(parseUri('//example.com/path'))).toBe('network-path');
    });

    it('should classify host-path URIs', () => {
      expect(classifyUri(parseUri('example.com'))).toBe('host-path');
      expect(classifyUri(parseUri('intranet'))).toBe('relative');
      expect(classifyUri(parseUri('localhost:3000'))).toBe('host-path');
      expect(classifyUri(parseUri('192.168.1.1'))).toBe('host-path');
    });

    it('should classify absolute-path URIs', () => {
      expect(classifyUri(parseUri('/path'))).toBe('absolute-path');
      expect(classifyUri(parseUri('/path/to/resource'))).toBe('absolute-path');
    });

    it('should classify relative URIs', () => {
      expect(classifyUri(parseUri('path'))).toBe('relative');
      expect(classifyUri(parseUri('path/to/resource'))).toBe('relative');
    });
  });

  describe('validateUriAst', () => {
    it('should validate valid ASTs', () => {
      expect(() => validateUriAst(parseUri('http://example.com'))).not.toThrow();
      expect(() => validateUriAst(parseUri('//example.com'))).not.toThrow();
      expect(() => validateUriAst(parseUri('example.com'))).not.toThrow();
      expect(() => validateUriAst(parseUri('/path'))).not.toThrow();
      expect(() => validateUriAst(parseUri('path'))).not.toThrow();
    });
  });

  describe('edge cases: consecutive slashes', () => {
    it('should parse single slashes in path', () => {
      const ast = parseUri('http://example.com/path/to/resource');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast.path.text).toBe('/path/to/resource');
      validateUriAst(ast);
    });

    it('should parse network-path with single slash', () => {
      const ast = parseUri('//example.com/path/to/file');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast.authority?.host.text).toBe('example.com');
      expect(ast.path.text).toBe('/path/to/file');
      validateUriAst(ast);
    });

    it('should handle multiple leading slashes as network-path', () => {
      // Note: /// is lexed as // (DoubleSlash) + / (Slash)
      // The parser treats // as authority indicator, then / starts the path
      const ast = parseUri('///path');
      expect(classifyUri(ast)).toBe('network-path');
      expect(ast.path.text).toBe('/path');
      validateUriAst(ast);
    });

    it('should preserve slashes with query and fragment', () => {
      const ast = parseUri('http://example.com/path/file?query=1#frag');
      expect(ast.path.text).toBe('/path/file');
      expect(ast.query?.value.text).toBe('query=1');
      expect(ast.fragment?.value.text).toBe('frag');
      validateUriAst(ast);
    });
  });
});
