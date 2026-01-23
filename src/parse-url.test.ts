// parse-url.test.ts
import { describe, expect, it } from 'vitest';

import { parseUrl, UrlError } from './index.js';

describe('parseUrl', () => {
  it('should normalize scheme and host casing', () => {
    const url = parseUrl('HTTP://ExAmPlE.COM/Path');
    expect(url).toEqual({
      kind: 'absolute',
      scheme: 'http',
      authority: { host: 'example.com' },
      path: '/Path',
    });
  });

  it('should strip default ports for known schemes', () => {
    const url = parseUrl('https://example.com:443/path');
    expect(url).toEqual({
      kind: 'absolute',
      scheme: 'https',
      authority: { host: 'example.com' },
      path: '/path',
    });
  });

  it('should normalize numeric port strings', () => {
    const url = parseUrl('http://example.com:0080/path');
    expect(url).toEqual({
      kind: 'absolute',
      scheme: 'http',
      authority: { host: 'example.com' },
      path: '/path',
    });
  });

  it('should preserve non-default ports', () => {
    const url = parseUrl('http://example.com:8080/path');
    expect(url).toEqual({
      kind: 'absolute',
      scheme: 'http',
      authority: { host: 'example.com', port: '8080' },
      path: '/path',
    });
  });

  it('should normalize network-path URLs', () => {
    const url = parseUrl('//EXAMPLE.COM/path');
    expect(url).toEqual({
      kind: 'network-path',
      authority: { host: 'example.com' },
      path: '/path',
    });
  });

  it('should normalize host-path URLs', () => {
    const url = parseUrl('localhost:3000/path');
    expect(url).toEqual({
      kind: 'host-path',
      authority: { host: 'localhost', port: '3000' },
      path: '/path',
    });
  });

  it('should throw on absolute URLs without authority', () => {
    expect(() => parseUrl('mailto:user@example.com')).toThrow(UrlError);
  });

  it('should throw on relative paths', () => {
    expect(() => parseUrl('path/to/resource')).toThrow(UrlError);
  });

  it('should reject non-numeric ports', () => {
    expect(() => parseUrl('http://example.com:abc/path')).toThrow(UrlError);
  });

  it('should reject out-of-range ports', () => {
    expect(() => parseUrl('http://example.com:99999/path')).toThrow(UrlError);
  });
});
