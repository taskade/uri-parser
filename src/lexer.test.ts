// lexer.test.ts
import { describe, expect, it } from 'vitest';

import { lexUri } from './lexer.js';
import { TokType } from './lexer-types.js';

describe('lexUri', () => {
  it('should lex network-path URL', () => {
    const tokens = lexUri('//example.com');
    expect(tokens).toMatchObject([
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex absolute URL with scheme', () => {
    const tokens = lexUri('http://example.com');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex URL with path', () => {
    const tokens = lexUri('http://example.com/path/to/resource');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'path' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'to' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'resource' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex URL with port', () => {
    const tokens = lexUri('http://localhost:3000');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'localhost' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.IDENT, value: '3000' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex URL with query string', () => {
    const tokens = lexUri('http://example.com?key=value');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.QuestionMark, value: '?' },
      { type: TokType.IDENT, value: 'key=value' }, // Query string is lexed as single IDENT
      { type: TokType.EOF },
    ]);
  });

  it('should lex URL with fragment', () => {
    const tokens = lexUri('http://example.com#section');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.Hash, value: '#' },
      { type: TokType.IDENT, value: 'section' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex URL with userinfo', () => {
    const tokens = lexUri('http://user@example.com');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'user' },
      { type: TokType.At, value: '@' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex IPv6 address', () => {
    const tokens = lexUri('http://[::1]:8080');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.LBracket, value: '[' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.IDENT, value: '1' },
      { type: TokType.RBracket, value: ']' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.IDENT, value: '8080' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex absolute path', () => {
    const tokens = lexUri('/path/to/resource');
    expect(tokens).toMatchObject([
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'path' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'to' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'resource' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex relative path', () => {
    const tokens = lexUri('path/to/resource');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'path' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'to' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'resource' },
      { type: TokType.EOF },
    ]);
  });

  it('should stop lexing at whitespace', () => {
    const tokens = lexUri('http://example.com some text');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.EOF },
    ]);
  });

  it('should lex full URL with all components', () => {
    const tokens = lexUri('https://user@example.com:8080/path/to/resource?key=value#section');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'https' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'user' },
      { type: TokType.At, value: '@' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.IDENT, value: '8080' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'path' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'to' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'resource' },
      { type: TokType.QuestionMark, value: '?' },
      { type: TokType.IDENT, value: 'key=value' },
      { type: TokType.Hash, value: '#' },
      { type: TokType.IDENT, value: 'section' },
      { type: TokType.EOF },
    ]);
  });

  it('should handle percent-encoded characters', () => {
    const tokens = lexUri('http://example.com/path%20with%20spaces');
    expect(tokens).toMatchObject([
      { type: TokType.IDENT, value: 'http' },
      { type: TokType.Colon, value: ':' },
      { type: TokType.DoubleSlash, value: '//' },
      { type: TokType.IDENT, value: 'example.com' },
      { type: TokType.Slash, value: '/' },
      { type: TokType.IDENT, value: 'path%20with%20spaces' },
      { type: TokType.EOF },
    ]);
  });

  describe('Unicode support', () => {
    it('should lex Unicode in hostname', () => {
      const tokens = lexUri('https://münchen.de');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'https' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'münchen.de' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Unicode in path (Chinese)', () => {
      const tokens = lexUri('http://example.com/文档/资料');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'example.com' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: '文档' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: '资料' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Unicode in query string (Japanese)', () => {
      const tokens = lexUri('http://example.com?名前=値');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'example.com' },
        { type: TokType.QuestionMark, value: '?' },
        { type: TokType.IDENT, value: '名前=値' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Unicode in fragment (Russian)', () => {
      const tokens = lexUri('http://example.com#секция');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'example.com' },
        { type: TokType.Hash, value: '#' },
        { type: TokType.IDENT, value: 'секция' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex emoji characters', () => {
      const tokens = lexUri('http://example.com/🎉/celebration');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'example.com' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: '🎉' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: 'celebration' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Arabic Unicode', () => {
      const tokens = lexUri('http://موقع.com/path');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'موقع.com' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: 'path' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Hebrew Unicode', () => {
      const tokens = lexUri('תיקייה/קובץ.txt');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'תיקייה' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: 'קובץ.txt' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex Korean Unicode', () => {
      const tokens = lexUri('mailto:사용자@예제.com');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'mailto' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.IDENT, value: '사용자' },
        { type: TokType.At, value: '@' },
        { type: TokType.IDENT, value: '예제.com' },
        { type: TokType.EOF },
      ]);
    });

    it('should lex mixed Unicode and ASCII', () => {
      const tokens = lexUri('http://example.com/docs/文档?lang=中文');
      expect(tokens).toMatchObject([
        { type: TokType.IDENT, value: 'http' },
        { type: TokType.Colon, value: ':' },
        { type: TokType.DoubleSlash, value: '//' },
        { type: TokType.IDENT, value: 'example.com' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: 'docs' },
        { type: TokType.Slash, value: '/' },
        { type: TokType.IDENT, value: '文档' },
        { type: TokType.QuestionMark, value: '?' },
        { type: TokType.IDENT, value: 'lang=中文' },
        { type: TokType.EOF },
      ]);
    });
  });
});
