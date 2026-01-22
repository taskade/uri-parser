// lexer-types.ts
// Token types and interfaces for the lexer

export enum TokType {
  // IDENT: sequences of non-delimiter, non-whitespace characters
  // Examples: "example", "localhost", "192.168", "user%20name", "path+with+plus"
  IDENT = 'IDENT',

  // Single-character punctuation tokens
  Colon = 'Colon', // :
  Slash = 'Slash', // /
  QuestionMark = 'QuestionMark', // ?
  Hash = 'Hash', // #
  At = 'At', // @
  LBracket = 'LBracket', // [
  RBracket = 'RBracket', // ]

  // Special multi-character token
  DoubleSlash = 'DoubleSlash', // //

  EOF = 'EOF',
}

export type Token = {
  type: TokType;
  value: string;
  pos: number; // position in source string
};
