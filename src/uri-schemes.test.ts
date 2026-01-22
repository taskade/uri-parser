// uri-schemes.test.ts
// Tests for various URI schemes (not just HTTP/HTTPS)

import { describe, expect, it } from 'vitest';

import { TokType } from './lexer-types.js';
import { classifyUri, parseUri } from './parser.js';
import { UriAst } from './parser-types.js';

describe('URI Schemes', () => {
  describe('mailto:', () => {
    it('should parse mailto:user@example.com', () => {
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
      } satisfies UriAst);
    });

    it('should parse mailto with query parameters', () => {
      const ast = parseUri('mailto:user@example.com?subject=Hello&body=World');
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
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 23 },
          value: {
            kind: 'text',
            text: 'subject=Hello&body=World',
            tokens: [{ type: TokType.IDENT, value: 'subject=Hello&body=World', pos: 24 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 23 },
            { type: TokType.IDENT, value: 'subject=Hello&body=World', pos: 24 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'mailto', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.IDENT, value: 'user', pos: 7 },
          { type: TokType.At, value: '@', pos: 11 },
          { type: TokType.IDENT, value: 'example.com', pos: 12 },
          { type: TokType.QuestionMark, value: '?', pos: 23 },
          { type: TokType.IDENT, value: 'subject=Hello&body=World', pos: 24 },
        ],
      });
    });

    it('should parse mailto with multiple recipients', () => {
      const ast = parseUri('mailto:user1@example.com,user2@example.com');
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
          text: 'user1@example.com,user2@example.com',
          tokens: [
            { type: TokType.IDENT, value: 'user1', pos: 7 },
            { type: TokType.At, value: '@', pos: 12 },
            { type: TokType.IDENT, value: 'example.com,user2', pos: 13 },
            { type: TokType.At, value: '@', pos: 30 },
            { type: TokType.IDENT, value: 'example.com', pos: 31 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'mailto', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.IDENT, value: 'user1', pos: 7 },
          { type: TokType.At, value: '@', pos: 12 },
          { type: TokType.IDENT, value: 'example.com,user2', pos: 13 },
          { type: TokType.At, value: '@', pos: 30 },
          { type: TokType.IDENT, value: 'example.com', pos: 31 },
        ],
      });
    });

    it('should parse mailto without recipient (empty)', () => {
      const ast = parseUri('mailto:?subject=Feedback');
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
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 7 },
          value: {
            kind: 'text',
            text: 'subject=Feedback',
            tokens: [{ type: TokType.IDENT, value: 'subject=Feedback', pos: 8 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 7 },
            { type: TokType.IDENT, value: 'subject=Feedback', pos: 8 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'mailto', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.QuestionMark, value: '?', pos: 7 },
          { type: TokType.IDENT, value: 'subject=Feedback', pos: 8 },
        ],
      });
    });
  });

  describe('tel:', () => {
    it('should parse tel:+1-234-567-8900', () => {
      const ast = parseUri('tel:+1-234-567-8900');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'tel',
            tokens: [{ type: TokType.IDENT, value: 'tel', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'tel', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '+1-234-567-8900',
          tokens: [{ type: TokType.IDENT, value: '+1-234-567-8900', pos: 4 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'tel', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.IDENT, value: '+1-234-567-8900', pos: 4 },
        ],
      });
    });

    it('should parse tel with extension', () => {
      const ast = parseUri('tel:+1-234-567-8900;ext=123');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'tel',
            tokens: [{ type: TokType.IDENT, value: 'tel', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'tel', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '+1-234-567-8900;ext=123',
          tokens: [{ type: TokType.IDENT, value: '+1-234-567-8900;ext=123', pos: 4 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'tel', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.IDENT, value: '+1-234-567-8900;ext=123', pos: 4 },
        ],
      });
    });

    it('should parse simple phone number', () => {
      const ast = parseUri('tel:1234567890');
      // Note: After removing single-label hostname support, this is now parsed as scheme:path
      // (absolute URI) rather than host:port
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'tel',
            tokens: [{ type: TokType.IDENT, value: 'tel', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'tel', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '1234567890',
          tokens: [{ type: TokType.IDENT, value: '1234567890', pos: 4 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'tel', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.IDENT, value: '1234567890', pos: 4 },
        ],
      });
    });
  });

  describe('file:', () => {
    it('should parse file:///path/to/file', () => {
      const ast = parseUri('file:///path/to/file');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'file',
            tokens: [{ type: TokType.IDENT, value: 'file', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'file', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          host: {
            kind: 'text',
            text: '',
            tokens: [],
          },
          tokens: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
        },
        path: {
          kind: 'text',
          text: '/path/to/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 7 },
            { type: TokType.IDENT, value: 'path', pos: 8 },
            { type: TokType.Slash, value: '/', pos: 12 },
            { type: TokType.IDENT, value: 'to', pos: 13 },
            { type: TokType.Slash, value: '/', pos: 15 },
            { type: TokType.IDENT, value: 'file', pos: 16 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'file', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.Slash, value: '/', pos: 7 },
          { type: TokType.IDENT, value: 'path', pos: 8 },
          { type: TokType.Slash, value: '/', pos: 12 },
          { type: TokType.IDENT, value: 'to', pos: 13 },
          { type: TokType.Slash, value: '/', pos: 15 },
          { type: TokType.IDENT, value: 'file', pos: 16 },
        ],
      });
    });

    it('should parse file://localhost/path/to/file', () => {
      const ast = parseUri('file://localhost/path/to/file');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'file',
            tokens: [{ type: TokType.IDENT, value: 'file', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'file', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 5 }],
          host: {
            kind: 'text',
            text: 'localhost',
            tokens: [{ type: TokType.IDENT, value: 'localhost', pos: 7 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 5 },
            { type: TokType.IDENT, value: 'localhost', pos: 7 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path/to/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 16 },
            { type: TokType.IDENT, value: 'path', pos: 17 },
            { type: TokType.Slash, value: '/', pos: 21 },
            { type: TokType.IDENT, value: 'to', pos: 22 },
            { type: TokType.Slash, value: '/', pos: 24 },
            { type: TokType.IDENT, value: 'file', pos: 25 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'file', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.DoubleSlash, value: '//', pos: 5 },
          { type: TokType.IDENT, value: 'localhost', pos: 7 },
          { type: TokType.Slash, value: '/', pos: 16 },
          { type: TokType.IDENT, value: 'path', pos: 17 },
          { type: TokType.Slash, value: '/', pos: 21 },
          { type: TokType.IDENT, value: 'to', pos: 22 },
          { type: TokType.Slash, value: '/', pos: 24 },
          { type: TokType.IDENT, value: 'file', pos: 25 },
        ],
      });
    });

    it('should parse file: with just path (non-standard)', () => {
      const ast = parseUri('file:/path/to/file');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'file',
            tokens: [{ type: TokType.IDENT, value: 'file', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'file', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '/path/to/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 5 },
            { type: TokType.IDENT, value: 'path', pos: 6 },
            { type: TokType.Slash, value: '/', pos: 10 },
            { type: TokType.IDENT, value: 'to', pos: 11 },
            { type: TokType.Slash, value: '/', pos: 13 },
            { type: TokType.IDENT, value: 'file', pos: 14 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'file', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.Slash, value: '/', pos: 5 },
          { type: TokType.IDENT, value: 'path', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 10 },
          { type: TokType.IDENT, value: 'to', pos: 11 },
          { type: TokType.Slash, value: '/', pos: 13 },
          { type: TokType.IDENT, value: 'file', pos: 14 },
        ],
      });
    });
  });

  describe('data:', () => {
    it('should parse data URI with base64', () => {
      const ast = parseUri('data:image/png;base64,iVBORw0KGgo=');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'data',
            tokens: [{ type: TokType.IDENT, value: 'data', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'data', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: 'image/png;base64,iVBORw0KGgo=',
          tokens: [
            { type: TokType.IDENT, value: 'image', pos: 5 },
            { type: TokType.Slash, value: '/', pos: 10 },
            { type: TokType.IDENT, value: 'png;base64,iVBORw0KGgo=', pos: 11 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'data', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.IDENT, value: 'image', pos: 5 },
          { type: TokType.Slash, value: '/', pos: 10 },
          { type: TokType.IDENT, value: 'png;base64,iVBORw0KGgo=', pos: 11 },
        ],
      });
    });

    it('should parse data URI with text', () => {
      const ast = parseUri('data:text/plain;charset=UTF-8,Hello%20World');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'data',
            tokens: [{ type: TokType.IDENT, value: 'data', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'data', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: 'text/plain;charset=UTF-8,Hello%20World',
          tokens: [
            { type: TokType.IDENT, value: 'text', pos: 5 },
            { type: TokType.Slash, value: '/', pos: 9 },
            {
              type: TokType.IDENT,
              value: 'plain;charset=UTF-8,Hello%20World',
              pos: 10,
            },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'data', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.IDENT, value: 'text', pos: 5 },
          { type: TokType.Slash, value: '/', pos: 9 },
          {
            type: TokType.IDENT,
            value: 'plain;charset=UTF-8,Hello%20World',
            pos: 10,
          },
        ],
      });
    });

    it('should parse simple data URI', () => {
      const ast = parseUri('data:,Hello%20World');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'data',
            tokens: [{ type: TokType.IDENT, value: 'data', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 4 },
          tokens: [
            { type: TokType.IDENT, value: 'data', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 4 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: ',Hello%20World',
          tokens: [{ type: TokType.IDENT, value: ',Hello%20World', pos: 5 }],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'data', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 4 },
          { type: TokType.IDENT, value: ',Hello%20World', pos: 5 },
        ],
      });
    });
  });

  describe('ftp:', () => {
    it('should parse ftp://ftp.example.com/file', () => {
      const ast = parseUri('ftp://ftp.example.com/file');
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
          host: {
            kind: 'text',
            text: 'ftp.example.com',
            tokens: [{ type: TokType.IDENT, value: 'ftp.example.com', pos: 6 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'ftp.example.com', pos: 6 },
          ],
        },
        path: {
          kind: 'text',
          text: '/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 21 },
            { type: TokType.IDENT, value: 'file', pos: 22 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ftp', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'ftp.example.com', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 21 },
          { type: TokType.IDENT, value: 'file', pos: 22 },
        ],
      });
    });

    it('should parse ftp with credentials', () => {
      const ast = parseUri('ftp://user:pass@ftp.example.com/file');
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
            text: 'ftp.example.com',
            tokens: [{ type: TokType.IDENT, value: 'ftp.example.com', pos: 16 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'user', pos: 6 },
            { type: TokType.Colon, value: ':', pos: 10 },
            { type: TokType.IDENT, value: 'pass', pos: 11 },
            { type: TokType.At, value: '@', pos: 15 },
            { type: TokType.IDENT, value: 'ftp.example.com', pos: 16 },
          ],
        },
        path: {
          kind: 'text',
          text: '/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 31 },
            { type: TokType.IDENT, value: 'file', pos: 32 },
          ],
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
          { type: TokType.IDENT, value: 'ftp.example.com', pos: 16 },
          { type: TokType.Slash, value: '/', pos: 31 },
          { type: TokType.IDENT, value: 'file', pos: 32 },
        ],
      });
    });

    it('should parse ftp with port', () => {
      const ast = parseUri('ftp://ftp.example.com:2121/file');
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
          host: {
            kind: 'text',
            text: 'ftp.example.com',
            tokens: [{ type: TokType.IDENT, value: 'ftp.example.com', pos: 6 }],
          },
          port: {
            kind: 'text',
            text: '2121',
            tokens: [{ type: TokType.IDENT, value: '2121', pos: 22 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'ftp.example.com', pos: 6 },
            { type: TokType.Colon, value: ':', pos: 21 },
            { type: TokType.IDENT, value: '2121', pos: 22 },
          ],
        },
        path: {
          kind: 'text',
          text: '/file',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 26 },
            { type: TokType.IDENT, value: 'file', pos: 27 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ftp', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'ftp.example.com', pos: 6 },
          { type: TokType.Colon, value: ':', pos: 21 },
          { type: TokType.IDENT, value: '2121', pos: 22 },
          { type: TokType.Slash, value: '/', pos: 26 },
          { type: TokType.IDENT, value: 'file', pos: 27 },
        ],
      });
    });
  });

  describe('ws: and wss:', () => {
    it('should parse ws://example.com/socket', () => {
      const ast = parseUri('ws://example.com/socket');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ws',
            tokens: [{ type: TokType.IDENT, value: 'ws', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 2 },
          tokens: [
            { type: TokType.IDENT, value: 'ws', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 2 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 3 }],
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 5 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 3 },
            { type: TokType.IDENT, value: 'example.com', pos: 5 },
          ],
        },
        path: {
          kind: 'text',
          text: '/socket',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 16 },
            { type: TokType.IDENT, value: 'socket', pos: 17 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ws', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 2 },
          { type: TokType.DoubleSlash, value: '//', pos: 3 },
          { type: TokType.IDENT, value: 'example.com', pos: 5 },
          { type: TokType.Slash, value: '/', pos: 16 },
          { type: TokType.IDENT, value: 'socket', pos: 17 },
        ],
      });
    });

    it('should parse wss://example.com/socket', () => {
      const ast = parseUri('wss://example.com/socket');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'wss',
            tokens: [{ type: TokType.IDENT, value: 'wss', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'wss', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          host: {
            kind: 'text',
            text: 'example.com',
            tokens: [{ type: TokType.IDENT, value: 'example.com', pos: 6 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'example.com', pos: 6 },
          ],
        },
        path: {
          kind: 'text',
          text: '/socket',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 17 },
            { type: TokType.IDENT, value: 'socket', pos: 18 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'wss', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'example.com', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 17 },
          { type: TokType.IDENT, value: 'socket', pos: 18 },
        ],
      });
    });

    it('should parse ws with port and query', () => {
      const ast = parseUri('ws://localhost:8080/socket?token=abc123');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ws',
            tokens: [{ type: TokType.IDENT, value: 'ws', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 2 },
          tokens: [
            { type: TokType.IDENT, value: 'ws', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 2 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 3 }],
          host: {
            kind: 'text',
            text: 'localhost',
            tokens: [{ type: TokType.IDENT, value: 'localhost', pos: 5 }],
          },
          port: {
            kind: 'text',
            text: '8080',
            tokens: [{ type: TokType.IDENT, value: '8080', pos: 15 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 3 },
            { type: TokType.IDENT, value: 'localhost', pos: 5 },
            { type: TokType.Colon, value: ':', pos: 14 },
            { type: TokType.IDENT, value: '8080', pos: 15 },
          ],
        },
        path: {
          kind: 'text',
          text: '/socket',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 19 },
            { type: TokType.IDENT, value: 'socket', pos: 20 },
          ],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 26 },
          value: {
            kind: 'text',
            text: 'token=abc123',
            tokens: [{ type: TokType.IDENT, value: 'token=abc123', pos: 27 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 26 },
            { type: TokType.IDENT, value: 'token=abc123', pos: 27 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ws', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 2 },
          { type: TokType.DoubleSlash, value: '//', pos: 3 },
          { type: TokType.IDENT, value: 'localhost', pos: 5 },
          { type: TokType.Colon, value: ':', pos: 14 },
          { type: TokType.IDENT, value: '8080', pos: 15 },
          { type: TokType.Slash, value: '/', pos: 19 },
          { type: TokType.IDENT, value: 'socket', pos: 20 },
          { type: TokType.QuestionMark, value: '?', pos: 26 },
          { type: TokType.IDENT, value: 'token=abc123', pos: 27 },
        ],
      });
    });
  });

  describe('git:', () => {
    it('should parse git://github.com/user/repo.git', () => {
      const ast = parseUri('git://github.com/user/repo.git');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'git',
            tokens: [{ type: TokType.IDENT, value: 'git', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'git', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          host: {
            kind: 'text',
            text: 'github.com',
            tokens: [{ type: TokType.IDENT, value: 'github.com', pos: 6 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'github.com', pos: 6 },
          ],
        },
        path: {
          kind: 'text',
          text: '/user/repo.git',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 16 },
            { type: TokType.IDENT, value: 'user', pos: 17 },
            { type: TokType.Slash, value: '/', pos: 21 },
            { type: TokType.IDENT, value: 'repo.git', pos: 22 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'git', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'github.com', pos: 6 },
          { type: TokType.Slash, value: '/', pos: 16 },
          { type: TokType.IDENT, value: 'user', pos: 17 },
          { type: TokType.Slash, value: '/', pos: 21 },
          { type: TokType.IDENT, value: 'repo.git', pos: 22 },
        ],
      });
    });

    it('should parse git+ssh://git@github.com/user/repo.git', () => {
      const ast = parseUri('git+ssh://git@github.com/user/repo.git');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'git+ssh',
            tokens: [{ type: TokType.IDENT, value: 'git+ssh', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 7 },
          tokens: [
            { type: TokType.IDENT, value: 'git+ssh', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 7 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 8 }],
          userinfo: {
            kind: 'text',
            text: 'git',
            tokens: [{ type: TokType.IDENT, value: 'git', pos: 10 }],
          },
          host: {
            kind: 'text',
            text: 'github.com',
            tokens: [{ type: TokType.IDENT, value: 'github.com', pos: 14 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 8 },
            { type: TokType.IDENT, value: 'git', pos: 10 },
            { type: TokType.At, value: '@', pos: 13 },
            { type: TokType.IDENT, value: 'github.com', pos: 14 },
          ],
        },
        path: {
          kind: 'text',
          text: '/user/repo.git',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 24 },
            { type: TokType.IDENT, value: 'user', pos: 25 },
            { type: TokType.Slash, value: '/', pos: 29 },
            { type: TokType.IDENT, value: 'repo.git', pos: 30 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'git+ssh', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 7 },
          { type: TokType.DoubleSlash, value: '//', pos: 8 },
          { type: TokType.IDENT, value: 'git', pos: 10 },
          { type: TokType.At, value: '@', pos: 13 },
          { type: TokType.IDENT, value: 'github.com', pos: 14 },
          { type: TokType.Slash, value: '/', pos: 24 },
          { type: TokType.IDENT, value: 'user', pos: 25 },
          { type: TokType.Slash, value: '/', pos: 29 },
          { type: TokType.IDENT, value: 'repo.git', pos: 30 },
        ],
      });
    });
  });

  describe('magnet:', () => {
    it('should parse magnet link', () => {
      const ast = parseUri('magnet:?xt=urn:btih:abc123&dn=example');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'magnet',
            tokens: [{ type: TokType.IDENT, value: 'magnet', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 6 },
          tokens: [
            { type: TokType.IDENT, value: 'magnet', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 6 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 7 },
          value: {
            kind: 'text',
            text: 'xt=urn:btih:abc123&dn=example',
            tokens: [
              { type: TokType.IDENT, value: 'xt=urn', pos: 8 },
              { type: TokType.Colon, value: ':', pos: 14 },
              { type: TokType.IDENT, value: 'btih', pos: 15 },
              { type: TokType.Colon, value: ':', pos: 19 },
              { type: TokType.IDENT, value: 'abc123&dn=example', pos: 20 },
            ],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 7 },
            { type: TokType.IDENT, value: 'xt=urn', pos: 8 },
            { type: TokType.Colon, value: ':', pos: 14 },
            { type: TokType.IDENT, value: 'btih', pos: 15 },
            { type: TokType.Colon, value: ':', pos: 19 },
            { type: TokType.IDENT, value: 'abc123&dn=example', pos: 20 },
          ],
        },
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'magnet', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 6 },
          { type: TokType.QuestionMark, value: '?', pos: 7 },
          { type: TokType.IDENT, value: 'xt=urn', pos: 8 },
          { type: TokType.Colon, value: ':', pos: 14 },
          { type: TokType.IDENT, value: 'btih', pos: 15 },
          { type: TokType.Colon, value: ':', pos: 19 },
          { type: TokType.IDENT, value: 'abc123&dn=example', pos: 20 },
        ],
      });
    });
  });

  describe('ssh:', () => {
    it('should parse ssh://user@host.com', () => {
      const ast = parseUri('ssh://user@host.com');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ssh',
            tokens: [{ type: TokType.IDENT, value: 'ssh', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'ssh', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          userinfo: {
            kind: 'text',
            text: 'user',
            tokens: [{ type: TokType.IDENT, value: 'user', pos: 6 }],
          },
          host: {
            kind: 'text',
            text: 'host.com',
            tokens: [{ type: TokType.IDENT, value: 'host.com', pos: 11 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'user', pos: 6 },
            { type: TokType.At, value: '@', pos: 10 },
            { type: TokType.IDENT, value: 'host.com', pos: 11 },
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
          { type: TokType.IDENT, value: 'ssh', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'user', pos: 6 },
          { type: TokType.At, value: '@', pos: 10 },
          { type: TokType.IDENT, value: 'host.com', pos: 11 },
        ],
      });
    });

    it('should parse ssh with port', () => {
      const ast = parseUri('ssh://user@host.com:2222/path');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'ssh',
            tokens: [{ type: TokType.IDENT, value: 'ssh', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'ssh', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          slashes: [{ type: TokType.DoubleSlash, value: '//', pos: 4 }],
          userinfo: {
            kind: 'text',
            text: 'user',
            tokens: [{ type: TokType.IDENT, value: 'user', pos: 6 }],
          },
          host: {
            kind: 'text',
            text: 'host.com',
            tokens: [{ type: TokType.IDENT, value: 'host.com', pos: 11 }],
          },
          port: {
            kind: 'text',
            text: '2222',
            tokens: [{ type: TokType.IDENT, value: '2222', pos: 20 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 4 },
            { type: TokType.IDENT, value: 'user', pos: 6 },
            { type: TokType.At, value: '@', pos: 10 },
            { type: TokType.IDENT, value: 'host.com', pos: 11 },
            { type: TokType.Colon, value: ':', pos: 19 },
            { type: TokType.IDENT, value: '2222', pos: 20 },
          ],
        },
        path: {
          kind: 'text',
          text: '/path',
          tokens: [
            { type: TokType.Slash, value: '/', pos: 24 },
            { type: TokType.IDENT, value: 'path', pos: 25 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'ssh', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.DoubleSlash, value: '//', pos: 4 },
          { type: TokType.IDENT, value: 'user', pos: 6 },
          { type: TokType.At, value: '@', pos: 10 },
          { type: TokType.IDENT, value: 'host.com', pos: 11 },
          { type: TokType.Colon, value: ':', pos: 19 },
          { type: TokType.IDENT, value: '2222', pos: 20 },
          { type: TokType.Slash, value: '/', pos: 24 },
          { type: TokType.IDENT, value: 'path', pos: 25 },
        ],
      });
    });
  });

  describe('urn:', () => {
    it('should parse URN', () => {
      const ast = parseUri('urn:isbn:0451450523');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'urn',
            tokens: [{ type: TokType.IDENT, value: 'urn', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'urn', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: 'isbn:0451450523',
          tokens: [
            { type: TokType.IDENT, value: 'isbn', pos: 4 },
            { type: TokType.Colon, value: ':', pos: 8 },
            { type: TokType.IDENT, value: '0451450523', pos: 9 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'urn', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.IDENT, value: 'isbn', pos: 4 },
          { type: TokType.Colon, value: ':', pos: 8 },
          { type: TokType.IDENT, value: '0451450523', pos: 9 },
        ],
      });
    });

    it('should parse URN UUID', () => {
      const ast = parseUri('urn:uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toEqual({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'urn',
            tokens: [{ type: TokType.IDENT, value: 'urn', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 3 },
          tokens: [
            { type: TokType.IDENT, value: 'urn', pos: 0 },
            { type: TokType.Colon, value: ':', pos: 3 },
          ],
        },
        authority: undefined,
        path: {
          kind: 'text',
          text: 'uuid:f81d4fae-7dec-11d0-a765-00a0c91e6bf6',
          tokens: [
            { type: TokType.IDENT, value: 'uuid', pos: 4 },
            { type: TokType.Colon, value: ':', pos: 8 },
            { type: TokType.IDENT, value: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6', pos: 9 },
          ],
        },
        query: undefined,
        fragment: undefined,
        tokens: [
          { type: TokType.IDENT, value: 'urn', pos: 0 },
          { type: TokType.Colon, value: ':', pos: 3 },
          { type: TokType.IDENT, value: 'uuid', pos: 4 },
          { type: TokType.Colon, value: ':', pos: 8 },
          { type: TokType.IDENT, value: 'f81d4fae-7dec-11d0-a765-00a0c91e6bf6', pos: 9 },
        ],
      });
    });
  });

  describe('Custom schemes', () => {
    it('should parse custom app scheme', () => {
      const ast = parseUri('myapp://action?param=value');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toMatchObject({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'myapp',
            tokens: [{ type: TokType.IDENT, value: 'myapp', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 5 },
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          host: {
            kind: 'text',
            text: 'action',
            tokens: [{ type: TokType.IDENT, value: 'action', pos: 8 }],
          },
          tokens: [
            { type: TokType.DoubleSlash, value: '//', pos: 6 },
            { type: TokType.IDENT, value: 'action', pos: 8 },
          ],
        },
        path: {
          kind: 'text',
          text: '',
          tokens: [],
        },
        query: {
          kind: 'query',
          delimiter: { type: TokType.QuestionMark, value: '?', pos: 14 },
          value: {
            kind: 'text',
            text: 'param=value',
            tokens: [{ type: TokType.IDENT, value: 'param=value', pos: 15 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 14 },
            { type: TokType.IDENT, value: 'param=value', pos: 15 },
          ],
        },
        fragment: undefined,
      });
    });

    it('should parse custom scheme without authority', () => {
      const ast = parseUri('myapp:action/sub?param=value');
      expect(classifyUri(ast)).toBe('absolute');
      expect(ast).toMatchObject({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: {
            kind: 'text',
            text: 'myapp',
            tokens: [{ type: TokType.IDENT, value: 'myapp', pos: 0 }],
          },
          colon: { type: TokType.Colon, value: ':', pos: 5 },
        },
        authority: undefined,
        path: {
          text: 'action/sub',
          tokens: [
            { type: TokType.IDENT, value: 'action', pos: 6 },
            { type: TokType.Slash, value: '/', pos: 12 },
            { type: TokType.IDENT, value: 'sub', pos: 13 },
          ],
        },
        query: {
          kind: 'query',
          value: {
            kind: 'text',
            text: 'param=value',
            tokens: [{ type: TokType.IDENT, value: 'param=value', pos: 17 }],
          },
          tokens: [
            { type: TokType.QuestionMark, value: '?', pos: 16 },
            { type: TokType.IDENT, value: 'param=value', pos: 17 },
          ],
        },
        fragment: undefined,
      });
    });
  });
});
