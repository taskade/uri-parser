// index.test.ts
// Integration tests that exercise the full public API

import { describe, expect, it } from 'vitest';

import { classifyUri, LexError, lexUri, ParseError, parseUri, parseUrl, TokType } from './index.js';

describe('Public API', () => {
  it('should export lexUri', () => {
    expect(lexUri).toBeDefined();
    const tokens = lexUri('http://example.com');
    expect(tokens).toBeDefined();
    expect(tokens.length).toBeGreaterThan(0);
  });

  it('should export parseUri', () => {
    expect(parseUri).toBeDefined();
    const ast = parseUri('http://example.com');
    expect(ast).toBeDefined();
    expect(ast.kind).toBe('uri');
    expect(classifyUri(ast)).toBe('absolute');
  });

  it('should export parseUrl', () => {
    expect(parseUrl).toBeDefined();
    const url = parseUrl('http://example.com:80/path');
    expect(url).toMatchObject({
      kind: 'absolute',
      scheme: 'http',
      authority: { host: 'example.com' },
      path: '/path',
    });
  });

  it('should export TokType enum', () => {
    expect(TokType).toBeDefined();
    expect(TokType.IDENT).toBe('IDENT');
    expect(TokType.Colon).toBe('Colon');
    expect(TokType.EOF).toBe('EOF');
  });

  it('should export error classes', () => {
    expect(LexError).toBeDefined();
    expect(ParseError).toBeDefined();

    const lexError = new LexError('test', 0);
    expect(lexError).toBeInstanceOf(Error);
    expect(lexError.position).toBe(0);

    const parseError = new ParseError('test', 0);
    expect(parseError).toBeInstanceOf(Error);
    expect(parseError.position).toBe(0);
  });

  it('should export classifyUri', () => {
    expect(classifyUri).toBeDefined();
    expect(classifyUri(parseUri('http://example.com'))).toBe('absolute');
    expect(classifyUri(parseUri('//example.com'))).toBe('network-path');
    expect(classifyUri(parseUri('example.com'))).toBe('host-path');
    expect(classifyUri(parseUri('/path'))).toBe('absolute-path');
    expect(classifyUri(parseUri('path'))).toBe('relative');
  });

  describe('End-to-end examples from README', () => {
    it('should parse absolute URL', () => {
      const result = parseUri('http://example.com:3000/path?x=1#y');
      expect(result.kind).toBe('uri');
      expect(classifyUri(result)).toBe('absolute');
      expect(result).toMatchObject({
        kind: 'uri',
        scheme: {
          kind: 'scheme',
          name: { kind: 'text', text: 'http', tokens: expect.any(Array) },
        },
        authority: {
          kind: 'authority',
          source: 'slashes',
          host: { kind: 'text', text: 'example.com', tokens: expect.any(Array) },
          port: { kind: 'text', text: '3000', tokens: expect.any(Array) },
          tokens: expect.any(Array),
        },
        path: { kind: 'text', text: '/path', tokens: expect.any(Array) },
        query: { kind: 'query', value: { kind: 'text', text: 'x=1', tokens: expect.any(Array) } },
        fragment: {
          kind: 'fragment',
          value: { kind: 'text', text: 'y', tokens: expect.any(Array) },
        },
      });
    });

    it('should parse network-path URL', () => {
      const result = parseUri('//example.com:3000/path?x=1#y');
      expect(result.kind).toBe('uri');
      expect(classifyUri(result)).toBe('network-path');
      expect(result).toMatchObject({
        kind: 'uri',
        authority: {
          kind: 'authority',
          source: 'slashes',
          host: { kind: 'text', text: 'example.com', tokens: expect.any(Array) },
          port: { kind: 'text', text: '3000', tokens: expect.any(Array) },
          tokens: expect.any(Array),
        },
        path: { kind: 'text', text: '/path', tokens: expect.any(Array) },
        query: { kind: 'query', value: { kind: 'text', text: 'x=1', tokens: expect.any(Array) } },
        fragment: {
          kind: 'fragment',
          value: { kind: 'text', text: 'y', tokens: expect.any(Array) },
        },
      });
    });

    it('should parse host-path URL', () => {
      const result = parseUri('example.com/path');
      expect(result.kind).toBe('uri');
      expect(classifyUri(result)).toBe('host-path');
      expect(result).toMatchObject({
        kind: 'uri',
        authority: {
          kind: 'authority',
          source: 'heuristic',
          host: { kind: 'text', text: 'example.com', tokens: expect.any(Array) },
          tokens: expect.any(Array),
        },
        path: { kind: 'text', text: '/path', tokens: expect.any(Array) },
      });
    });

    it('should parse absolute path', () => {
      const result = parseUri('/path/to/resource');
      expect(result.kind).toBe('uri');
      expect(classifyUri(result)).toBe('absolute-path');
      expect(result).toMatchObject({
        kind: 'uri',
        path: { kind: 'text', text: '/path/to/resource', tokens: expect.any(Array) },
      });
    });

    it('should parse relative path', () => {
      const result = parseUri('path/to/resource');
      expect(result.kind).toBe('uri');
      expect(classifyUri(result)).toBe('relative');
      expect(result).toMatchObject({
        kind: 'uri',
        path: { kind: 'text', text: 'path/to/resource', tokens: expect.any(Array) },
      });
    });
  });
});
