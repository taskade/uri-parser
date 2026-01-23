// parse-url.ts
// URL-specific parsing with normalization and validation
//
// This module provides stricter URL parsing compared to the permissive parseUri().
// Key differences:
// - Port validation: Ensures ports are numeric and in range 1-65535
// - Host validation: Requires non-empty hosts (except for file:// scheme)
// - Normalization: Lowercases scheme/host, strips default ports
// - URL-only: Rejects relative paths and absolute paths (requires authority)
//
// Separation of concerns:
// - parseUri(): Permissive parser, accepts any URI structure
// - parseUrl(): Strict validator, only accepts well-formed URLs
//
// This design allows parseUri() to handle edge cases and malformed input
// while parseUrl() enforces standards for production use.

import { UrlError } from './errors.js';
import { classifyUri, parseUri } from './parser.js';
import type { Authority, UriAst } from './parser-types.js';

export type ParsedUrl =
  | {
      kind: 'absolute';
      scheme: string;
      authority: UrlAuthority;
      path: string;
      query?: string;
      fragment?: string;
    }
  | {
      kind: 'network-path';
      authority: UrlAuthority;
      path: string;
      query?: string;
      fragment?: string;
    }
  | {
      kind: 'host-path';
      authority: UrlAuthority;
      path: string;
      query?: string;
      fragment?: string;
    };

type UrlAuthority = {
  userinfo?: string;
  host: string;
  port?: string;
};

const DEFAULT_PORTS: Record<string, number> = {
  http: 80,
  https: 443,
  ws: 80,
  wss: 443,
  ftp: 21,
  ssh: 22,
};

function normalizeAuthority(authority: UrlAuthority, scheme?: string): UrlAuthority {
  const host = authority.host.trim();
  if (host.length === 0 && scheme !== 'file') {
    throw new UrlError('URL authority host is required');
  }

  let port: string | undefined = authority.port;
  if (port !== undefined) {
    if (!/^\d+$/.test(port)) {
      throw new UrlError('URL port must be numeric');
    }
    const portNumber = Number(port);
    if (!Number.isInteger(portNumber) || portNumber < 1 || portNumber > 65535) {
      throw new UrlError('URL port must be between 1 and 65535');
    }
    const defaultPort = scheme !== undefined ? DEFAULT_PORTS[scheme] : undefined;
    if (defaultPort !== undefined && portNumber === defaultPort) {
      port = undefined;
    } else {
      port = String(portNumber);
    }
  }

  return {
    userinfo: authority.userinfo,
    host: host.toLowerCase(),
    port,
  };
}

function toUrlAuthority(authority: Authority): UrlAuthority {
  return {
    userinfo: authority.userinfo?.text,
    host: authority.host.text,
    port: authority.port?.text,
  };
}

function toUrlAst(ast: UriAst): ParsedUrl {
  const form = classifyUri(ast);

  switch (form) {
    case 'absolute': {
      if (!ast.authority) {
        throw new UrlError('Absolute URLs must include an authority');
      }
      const scheme = ast.scheme!.name.text.toLowerCase();
      const normalized: ParsedUrl = {
        kind: 'absolute',
        scheme,
        authority: normalizeAuthority(toUrlAuthority(ast.authority), scheme),
        path: ast.path.text,
      };
      if (ast.query !== undefined) {
        normalized.query = ast.query.value.text;
      }
      if (ast.fragment !== undefined) {
        normalized.fragment = ast.fragment.value.text;
      }
      return normalized;
    }
    case 'network-path': {
      if (!ast.authority) {
        throw new UrlError('Network-path URLs must include an authority');
      }
      return {
        kind: 'network-path',
        authority: normalizeAuthority(toUrlAuthority(ast.authority)),
        path: ast.path.text,
        ...(ast.query !== undefined ? { query: ast.query.value.text } : {}),
        ...(ast.fragment !== undefined ? { fragment: ast.fragment.value.text } : {}),
      };
    }
    case 'host-path': {
      if (!ast.authority) {
        throw new UrlError('Host-path URLs must include an authority');
      }
      return {
        kind: 'host-path',
        authority: normalizeAuthority(toUrlAuthority(ast.authority)),
        path: ast.path.text,
        ...(ast.query !== undefined ? { query: ast.query.value.text } : {}),
        ...(ast.fragment !== undefined ? { fragment: ast.fragment.value.text } : {}),
      };
    }
    case 'absolute-path':
    case 'relative':
      throw new UrlError('Input does not represent a URL');
  }
}

export function parseUrl(src: string): ParsedUrl {
  return toUrlAst(parseUri(src));
}
