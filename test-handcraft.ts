// Test demonstrating the current difficulty in handcrafting AST
import type { UriAst, TextNode } from './src/parser-types.js';
import { stringifyUri } from './src/utils.js';

// Try to create a simple AST by hand for: http://example.com/path
// Current issue: We need to provide tokens, which is tedious and unnecessary

const ast: UriAst = {
  kind: 'uri',
  scheme: {
    kind: 'scheme',
    name: {
      kind: 'text',
      text: 'http',
      tokens: [], // This is tedious - we have to provide this even though we don't care
    },
    colon: { type: 'Colon' as any, value: ':', pos: 4 }, // More tedious token info
    tokens: [], // And again...
  },
  authority: {
    kind: 'authority',
    source: 'slashes',
    slashes: [{ type: 'DoubleSlash' as any, value: '//', pos: 5 }],
    host: {
      kind: 'text',
      text: 'example.com',
      tokens: [], // So much boilerplate!
    },
    tokens: [],
  },
  path: {
    kind: 'text',
    text: '/path',
    tokens: [], // We just want to create a simple AST!
  },
  tokens: [], // Why do we need all these tokens if we're building by hand?
};

console.log('Handcrafted AST:', ast);
console.log('Stringified:', stringifyUri(ast));
console.log('\nThe problem: Too much boilerplate for handcrafting AST!');
console.log('We should be able to make tokens optional.');
