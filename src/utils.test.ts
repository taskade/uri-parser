// utils.test.ts
import { describe, expect, it } from 'vitest';

import { parseUri } from './parser.js';
import { nodeValue, preprocessUri, stringifyUri } from './utils.js';

describe('nodeValue', () => {
  it('should extract value from AstNode', () => {
    const ast = parseUri('http://example.com');
    expect(ast.scheme?.name.text).toBe('http');
  });

  it('should return undefined for undefined node', () => {
    expect(nodeValue(undefined)).toBeUndefined();
  });
});

describe('stringifyUri', () => {
  it('should stringify a simple absolute URI', () => {
    const ast = parseUri('http://example.com/path');
    const result = stringifyUri(ast);
    expect(result).toBe('http://example.com/path');
  });

  it('should stringify URI with all components', () => {
    const ast = parseUri('https://user@example.com:8080/path?query=value#fragment');
    const result = stringifyUri(ast);
    expect(result).toBe('https://user@example.com:8080/path?query=value#fragment');
  });

  it('should stringify network-path URI in preserve mode', () => {
    const ast = parseUri('//example.com/path');
    const result = stringifyUri(ast, 'preserve');
    expect(result).toBe('//example.com/path');
  });

  it('should stringify heuristic authority in preserve mode', () => {
    const ast = parseUri('example.com/path');
    const result = stringifyUri(ast, 'preserve');
    expect(result).toBe('example.com/path');
  });

  it('should normalize heuristic authority to slashes form', () => {
    const ast = parseUri('example.com/path');
    const result = stringifyUri(ast, 'normalize');
    expect(result).toBe('//example.com/path');
  });

  it('should stringify relative path', () => {
    const ast = parseUri('path/to/resource');
    const result = stringifyUri(ast);
    expect(result).toBe('path/to/resource');
  });

  it('should stringify absolute path', () => {
    const ast = parseUri('/path/to/resource');
    const result = stringifyUri(ast);
    expect(result).toBe('/path/to/resource');
  });

  it('should stringify empty path', () => {
    const ast = parseUri('http://example.com');
    const result = stringifyUri(ast);
    expect(result).toBe('http://example.com');
  });

  it('should stringify IPv6 host', () => {
    const ast = parseUri('http://[::1]:8080/path');
    const result = stringifyUri(ast);
    expect(result).toBe('http://[::1]:8080/path');
  });

  it('should default to preserve mode', () => {
    const ast = parseUri('localhost:3000/path');
    const result = stringifyUri(ast);
    expect(result).toBe('localhost:3000/path');
  });
});

describe('preprocessUri', () => {
  it('should strip whitespace and encode spaces', () => {
    const input = '  http://example.com/path with spaces  ';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/path%20with%20spaces');
  });

  it('should handle leading whitespace and internal spaces', () => {
    const input = '  http://example.com/my path';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/my%20path');
  });

  it('should handle trailing whitespace and internal spaces', () => {
    const input = 'http://example.com/my path  ';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/my%20path');
  });

  it('should handle both surrounding and internal spaces', () => {
    const input = '  http://example.com/path with many spaces  ';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/path%20with%20many%20spaces');
  });

  it('should handle newlines, tabs, and internal spaces', () => {
    const input = '\n\t http://example.com/path with spaces \t\n';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/path%20with%20spaces');
  });

  it('should not modify clean URIs', () => {
    const input = 'http://example.com/path';
    const result = preprocessUri(input);
    expect(result).toBe('http://example.com/path');
  });

  it('should handle complex URIs with query and fragment', () => {
    const input =
      '  http://example.com/path with spaces?key=value with spaces#section with spaces  ';
    const result = preprocessUri(input);
    expect(result).toBe(
      'http://example.com/path%20with%20spaces?key=value%20with%20spaces#section%20with%20spaces',
    );
  });

  describe('integration with parser', () => {
    it('should allow full parsing workflow', () => {
      const input = '  http://example.com:3000/path with spaces?query=value with spaces#section  ';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.scheme?.name.text).toBe('http');
      expect(ast.authority?.host.text).toBe('example.com');
      expect(ast.authority?.port?.text).toBe('3000');
      expect(ast.path.text).toBe('/path%20with%20spaces');
      expect(ast.query?.value.text).toBe('query=value%20with%20spaces');
      expect(ast.fragment?.value.text).toBe('section');
    });

    it('should handle network-path URL with spaces', () => {
      const input = '  //example.com/path with spaces  ';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.path.text).toBe('/path%20with%20spaces');
    });

    it('should handle relative path with spaces', () => {
      const input = '  path with spaces/to/resource  ';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.path.text).toBe('path%20with%20spaces/to/resource');
    });
  });

  describe('real-world examples', () => {
    it('should handle user copy-pasted URL with spaces', () => {
      // User copies from browser or document with extra whitespace
      const input = '  https://example.com/My Documents/file.pdf  ';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.path.text).toBe('/My%20Documents/file.pdf');
    });

    it('should handle HTML href with spaces', () => {
      // Common mistake in HTML
      const input = '  http://example.com/about us  ';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.path.text).toBe('/about%20us');
    });

    it('should handle search query with spaces', () => {
      const input = 'http://example.com/search?q=hello world';
      const cleaned = preprocessUri(input);
      const ast = parseUri(cleaned);
      expect(ast.kind).toBe('uri');
      expect(ast.query?.value.text).toBe('q=hello%20world');
    });
  });
});
