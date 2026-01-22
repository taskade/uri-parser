// errors.ts
// Error classes for lexer and parser

export class LexError extends Error {
  public readonly position: number;
  constructor(message: string, position: number) {
    super(`${message} at position ${position}`);
    this.name = 'LexError';
    this.position = position;
  }
}

export class ParseError extends Error {
  public readonly position: number;
  constructor(message: string, position: number) {
    super(`${message} at position ${position}`);
    this.name = 'ParseError';
    this.position = position;
  }
}

export class UrlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UrlError';
  }
}
