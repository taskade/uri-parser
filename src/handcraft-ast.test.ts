// handcraft-ast.test.ts
// Tests for handcrafting AST without tokens

import { describe, expect, it } from 'vitest';

import { validateUriAst } from './parser.js';
import type { Authority, Fragment, Query, Scheme, TextNode, UriAst } from './parser-types.js';
import { stringifyUri } from './utils.js';

describe('Handcrafting AST without tokens', () => {
  it('should allow creating a TextNode without tokens', () => {
    const textNode: TextNode = {
      kind: 'text',
      text: 'example.com',
    };

    expect(textNode.kind).toBe('text');
    expect(textNode.text).toBe('example.com');
    expect(textNode.tokens).toBeUndefined();
  });

  it('should allow creating a Scheme without tokens', () => {
    const scheme: Scheme = {
      kind: 'scheme',
      name: {
        kind: 'text',
        text: 'http',
      },
    };

    expect(scheme.kind).toBe('scheme');
    expect(scheme.name.text).toBe('http');
    expect(scheme.tokens).toBeUndefined();
    expect(scheme.colonToken).toBeUndefined();
  });

  it('should allow creating an Authority without tokens', () => {
    const authority: Authority = {
      kind: 'authority',
      source: 'slashes',
      host: {
        kind: 'text',
        text: 'example.com',
      },
    };

    expect(authority.kind).toBe('authority');
    expect(authority.host.text).toBe('example.com');
    expect(authority.tokens).toBeUndefined();
  });

  it('should allow creating a Query without tokens', () => {
    const query: Query = {
      kind: 'query',
      value: {
        kind: 'text',
        text: 'key=value',
      },
    };

    expect(query.kind).toBe('query');
    expect(query.value.text).toBe('key=value');
    expect(query.tokens).toBeUndefined();
    expect(query.delimiterToken).toBeUndefined();
  });

  it('should allow creating a Fragment without tokens', () => {
    const fragment: Fragment = {
      kind: 'fragment',
      value: {
        kind: 'text',
        text: 'section',
      },
    };

    expect(fragment.kind).toBe('fragment');
    expect(fragment.value.text).toBe('section');
    expect(fragment.tokens).toBeUndefined();
    expect(fragment.delimiterToken).toBeUndefined();
  });

  it('should allow creating a simple UriAst without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'http',
        },
      },
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: 'example.com',
        },
      },
      path: {
        kind: 'text',
        text: '/path',
      },
    };

    expect(ast.kind).toBe('uri');
    expect(ast.scheme?.name.text).toBe('http');
    expect(ast.authority?.host.text).toBe('example.com');
    expect(ast.path.text).toBe('/path');
    expect(ast.tokens).toBeUndefined();
  });

  it('should stringify a handcrafted AST correctly', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'https',
        },
      },
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: 'example.com',
        },
        port: {
          kind: 'text',
          text: '443',
        },
      },
      path: {
        kind: 'text',
        text: '/path/to/resource',
      },
      query: {
        kind: 'query',
        value: {
          kind: 'text',
          text: 'key=value&foo=bar',
        },
      },
      fragment: {
        kind: 'fragment',
        value: {
          kind: 'text',
          text: 'section',
        },
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('https://example.com:443/path/to/resource?key=value&foo=bar#section');
  });

  it('should validate a handcrafted AST without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'http',
        },
      },
      path: {
        kind: 'text',
        text: '/path',
      },
    };

    // Should not throw
    expect(() => validateUriAst(ast)).not.toThrow();
  });

  it('should allow creating an Authority with userinfo without tokens', () => {
    const authority: Authority = {
      kind: 'authority',
      source: 'slashes',
      userinfo: {
        kind: 'text',
        text: 'user:pass',
      },
      host: {
        kind: 'text',
        text: 'example.com',
      },
      port: {
        kind: 'text',
        text: '8080',
      },
    };

    expect(authority.userinfo?.text).toBe('user:pass');
    expect(authority.host.text).toBe('example.com');
    expect(authority.port?.text).toBe('8080');
    expect(authority.tokens).toBeUndefined();
  });

  it('should allow creating a network-path URI without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: 'example.com',
        },
      },
      path: {
        kind: 'text',
        text: '/path',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('//example.com/path');
  });

  it('should allow creating a host-path URI without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      authority: {
        kind: 'authority',
        source: 'heuristic',
        host: {
          kind: 'text',
          text: 'example.com',
        },
      },
      path: {
        kind: 'text',
        text: '/path',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('example.com/path');
  });

  it('should allow creating a relative path URI without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      path: {
        kind: 'text',
        text: 'relative/path',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('relative/path');
  });

  it('should allow creating an absolute path URI without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      path: {
        kind: 'text',
        text: '/absolute/path',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('/absolute/path');
  });

  it('should allow creating a scheme-only URI without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'mailto',
        },
      },
      path: {
        kind: 'text',
        text: 'user@example.com',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('mailto:user@example.com');
  });

  it('should allow creating a URI with IPv6 address without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'http',
        },
      },
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: '[::1]',
        },
        port: {
          kind: 'text',
          text: '8080',
        },
      },
      path: {
        kind: 'text',
        text: '/path',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('http://[::1]:8080/path');
  });

  it('should allow creating a URI with empty path without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'http',
        },
      },
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: 'example.com',
        },
      },
      path: {
        kind: 'text',
        text: '',
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('http://example.com');
  });

  it('should allow creating a URI with empty query/fragment without tokens', () => {
    const ast: UriAst = {
      kind: 'uri',
      scheme: {
        kind: 'scheme',
        name: {
          kind: 'text',
          text: 'http',
        },
      },
      authority: {
        kind: 'authority',
        source: 'slashes',
        host: {
          kind: 'text',
          text: 'example.com',
        },
      },
      path: {
        kind: 'text',
        text: '',
      },
      query: {
        kind: 'query',
        value: {
          kind: 'text',
          text: '',
        },
      },
      fragment: {
        kind: 'fragment',
        value: {
          kind: 'text',
          text: '',
        },
      },
    };

    const stringified = stringifyUri(ast);
    expect(stringified).toBe('http://example.com?#');
  });
});
