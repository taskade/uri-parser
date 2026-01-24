// ast-with-tokens.test.ts
// Tests for the AST with tokens feature

import { describe, expect, it } from 'vitest';

import { authorityValue, nodeValue, parseUri } from './index.js';
import { TokType } from './lexer-types.js';

describe('AST with Tokens', () => {
  describe('AstNode structure', () => {
    it('should include value and tokens in scheme', () => {
      const ast = parseUri('http://example.com');
      expect(ast.kind).toBe('uri');
      expect(ast.scheme).toBeDefined();
      expect(ast.scheme).toHaveProperty('kind');
      expect(ast.scheme?.kind).toBe('scheme');
      expect(ast.scheme).toHaveProperty('name');
      expect(ast.scheme).toHaveProperty('tokens');
      expect(ast.scheme?.name.text).toBe('http');
      expect(Array.isArray(ast.scheme?.tokens)).toBe(true);
      expect(ast.scheme?.tokens.length).toBeGreaterThan(0);
    });

    it('should include value and tokens in path', () => {
      const ast = parseUri('http://example.com/path/to/resource');
      expect(ast.path).toHaveProperty('text');
      expect(ast.path).toHaveProperty('tokens');
      expect(ast.path.text).toBe('/path/to/resource');
      expect(Array.isArray(ast.path.tokens)).toBe(true);
    });

    it('should include value and tokens in authority', () => {
      const ast = parseUri('http://user@example.com:443');
      expect(ast.kind).toBe('uri');
      expect(ast.authority).toBeDefined();
      expect(ast.authority).toHaveProperty('tokens');
      expect(ast.authority?.userinfo).toHaveProperty('text');
      expect(ast.authority?.userinfo).toHaveProperty('tokens');
      expect(ast.authority?.userinfo?.text).toBe('user');
      expect(ast.authority?.host).toHaveProperty('text');
      expect(ast.authority?.host).toHaveProperty('tokens');
      expect(ast.authority?.host.text).toBe('example.com');
      expect(ast.authority?.port).toHaveProperty('text');
      expect(ast.authority?.port).toHaveProperty('tokens');
      expect(ast.authority?.port?.text).toBe('443');
      expect(Array.isArray(ast.authority?.tokens)).toBe(true);
    });

    it('should include value and tokens in query', () => {
      const ast = parseUri('http://example.com?key=value&foo=bar');
      expect(ast.query).toBeDefined();
      expect(ast.query).toHaveProperty('kind');
      expect(ast.query?.kind).toBe('query');
      expect(ast.query).toHaveProperty('delimiterToken');
      expect(ast.query).toHaveProperty('value');
      expect(ast.query).toHaveProperty('tokens');
      expect(ast.query?.value.text).toBe('key=value&foo=bar');
      expect(Array.isArray(ast.query?.tokens)).toBe(true);
    });

    it('should include value and tokens in fragment', () => {
      const ast = parseUri('http://example.com#section');
      expect(ast.fragment).toBeDefined();
      expect(ast.fragment).toHaveProperty('kind');
      expect(ast.fragment?.kind).toBe('fragment');
      expect(ast.fragment).toHaveProperty('delimiterToken');
      expect(ast.fragment).toHaveProperty('value');
      expect(ast.fragment).toHaveProperty('tokens');
      expect(ast.fragment?.value.text).toBe('section');
      expect(Array.isArray(ast.fragment?.tokens)).toBe(true);
    });
  });

  describe('Token positions', () => {
    it('should have correct positions for scheme tokens', () => {
      const ast = parseUri('https://example.com');
      expect(ast.kind).toBe('uri');
      const schemeTokens = ast.scheme?.tokens;
      expect(schemeTokens).toBeDefined();
      expect(schemeTokens?.[0]).toMatchObject({
        type: TokType.IDENT,
        value: 'https',
        pos: 0,
      });
      expect(schemeTokens?.[1]).toMatchObject({
        type: TokType.Colon,
        value: ':',
        pos: 5,
      });
    });

    it('should have correct positions for authority tokens', () => {
      const ast = parseUri('http://example.com:443');
      expect(ast.kind).toBe('uri');
      expect(ast.authority).toBeDefined();
      const tokens = ast.authority?.tokens;
      const hostToken = tokens?.find((t) => t.value === 'example.com');
      expect(hostToken).toBeDefined();
      expect(hostToken?.pos).toBe(7);

      const portToken = tokens?.find((t) => t.value === '443');
      expect(portToken).toBeDefined();
      expect(portToken?.pos).toBe(19);
    });

    it('should have correct positions for path tokens', () => {
      const ast = parseUri('http://example.com/path/to/file');
      const tokens = ast.path.tokens;
      expect(tokens[0]).toMatchObject({ type: TokType.Slash, pos: 18 });
      expect(tokens[1]).toMatchObject({
        type: TokType.IDENT,
        value: 'path',
        pos: 19,
      });
    });
  });

  describe('Token traceability', () => {
    it('should allow reconstructing source from tokens', () => {
      const uri = 'https://example.com:443/path?key=value#frag';
      const ast = parseUri(uri);

      // Check we can trace back to source
      expect(ast.kind).toBe('uri');
      expect(ast.scheme).toBeDefined();
      const schemeTokens = ast.scheme?.tokens;
      if (schemeTokens) {
        const schemeStart = schemeTokens[0].pos;
        const schemeEnd =
          schemeTokens[schemeTokens.length - 1].pos +
          schemeTokens[schemeTokens.length - 1].value.length;
        expect(uri.substring(schemeStart, schemeEnd)).toBe('https:');
      }
    });

    it('should preserve token order', () => {
      const ast = parseUri('http://user:pass@example.com:443/path');
      expect(ast.kind).toBe('uri');
      expect(ast.authority).toBeDefined();
      const positions = ast.authority?.tokens.map((t) => t.pos) ?? [];
      // Positions should be in ascending order
      for (let i = 1; i < positions.length; i++) {
        const current = positions[i];
        const previous = positions[i - 1];
        if (current !== undefined && previous !== undefined) {
          expect(current).toBeGreaterThanOrEqual(previous);
        }
      }
    });
  });

  describe('nodeValue', () => {
    it('should extract value from AstNode', () => {
      const ast = parseUri('http://example.com/path?q=1#frag');
      expect(nodeValue(ast.path)).toBe('/path');
      expect(nodeValue(ast.query)).toBe('q=1');
      expect(nodeValue(ast.fragment)).toBe('frag');
    });

    it('should return undefined for undefined nodes', () => {
      const ast = parseUri('http://example.com/path');
      expect(nodeValue(ast.query)).toBeUndefined();
      expect(nodeValue(ast.fragment)).toBeUndefined();
    });

    it('should work with authority', () => {
      const ast = parseUri('http://user@example.com:443');
      expect(ast.kind).toBe('uri');
      expect(ast.authority).toBeDefined();
      const authValue = authorityValue(ast.authority);
      expect(authValue).toMatchObject({
        source: 'slashes',
        userinfo: 'user',
        host: 'example.com',
        port: '443',
      });
    });
  });

  describe('Unicode with tokens', () => {
    it('should preserve Unicode in tokens', () => {
      const ast = parseUri('https://münchen.de/文档?名前=値#секция');

      if (ast.authority !== undefined) {
        const hostToken = ast.authority.tokens.find((t) => t.value === 'münchen.de');
        expect(hostToken?.value).toBe('münchen.de');
      }

      const pathToken = ast.path.tokens.find((t) => t.value === '文档');
      expect(pathToken?.value).toBe('文档');

      const queryToken = ast.query?.tokens.find((t) => t.value.includes('名前'));
      expect(queryToken?.value).toContain('名前');

      const fragToken = ast.fragment?.tokens.find((t) => t.value === 'секция');
      expect(fragToken?.value).toBe('секция');
    });

    it('should have correct positions for Unicode characters', () => {
      const uri = 'http://ex.com/文档';
      const ast = parseUri(uri);

      // The Unicode character should be at position 14 (after "http://ex.com/")
      const unicodeToken = ast.path.tokens.find((t) => t.value === '文档');
      expect(unicodeToken).toBeDefined();
      expect(unicodeToken?.pos).toBe(14);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty components', () => {
      const ast = parseUri('http://example.com?#');
      expect(ast.query?.value.text).toBe('');
      expect(ast.query?.tokens.length).toBeGreaterThan(0); // At least the ? token

      expect(ast.fragment?.value.text).toBe('');
      expect(ast.fragment?.tokens.length).toBeGreaterThan(0); // At least the # token
    });

    it('should handle scheme-only paths', () => {
      const ast = parseUri('mailto:user@example.com');
      expect(ast.kind).toBe('uri');
      expect(ast.path.text).toBe('user@example.com');
      expect(ast.path.tokens.length).toBeGreaterThan(0);
    });

    it('should handle IPv6 addresses', () => {
      const ast = parseUri('http://[::1]:8080/path');
      if (ast.authority !== undefined) {
        expect(ast.authority.host.text).toBe('[::1]');
        const bracketTokens = ast.authority.tokens.filter(
          (t) => t.type === TokType.LBracket || t.type === TokType.RBracket,
        );
        expect(bracketTokens.length).toBe(2);
      }
    });
  });

  describe('Complex URIs', () => {
    it('should handle all components with tokens', () => {
      const uri = 'https://user:pass@example.com:443/path/to/file?key=val&x=y#sec';
      const ast = parseUri(uri);

      expect(ast.kind).toBe('uri');
      // Verify all components have tokens
      expect(ast.scheme?.tokens.length).toBeGreaterThan(0);
      expect(ast.authority?.tokens.length).toBeGreaterThan(0);
      expect(ast.path.tokens.length).toBeGreaterThan(0);
      expect(ast.query?.tokens.length).toBeGreaterThan(0);
      expect(ast.fragment?.tokens.length).toBeGreaterThan(0);

      // Verify token count makes sense
      const totalTokens =
        (ast.scheme?.tokens.length ?? 0) +
        (ast.authority?.tokens.length ?? 0) +
        ast.path.tokens.length +
        (ast.query?.tokens.length ?? 0) +
        (ast.fragment?.tokens.length ?? 0);

      expect(totalTokens).toBeGreaterThan(10); // Complex URI should have many tokens
    });
  });
});
