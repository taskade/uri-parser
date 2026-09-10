# Contributing to URI Parser

Thank you for your interest in contributing to the URI Parser!

## Development Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Run tests:
   ```bash
   npm test
   ```

4. Run tests in watch mode:
   ```bash
   npm run test:watch
   ```

5. Run linter:
   ```bash
   npm run lint
   ```

## Project Structure

```
uri-parser/
├── src/
│   ├── lexer-types.ts    # Token type definitions
│   ├── lexer.ts          # Lexer implementation
│   ├── parser-types.ts   # AST type definitions
│   ├── parser.ts         # Parser implementation
│   ├── errors.ts         # Error classes
│   └── index.ts          # Public API exports
├── scripts/
│   └── build.mjs         # Build script
└── tests/                # Test files
```

## Design Philosophy

This parser follows the temporal-parser philosophy:

1. **Explicit tokens → shallow grammar → AST → later normalization**
2. **Lexer is permissive and logic-light**
3. **Parser builds a typed AST**
4. **Lossless parsing** (raw values preserved)
5. **Easy to extend** with normalization passes

## Testing

- Write tests for new features
- Ensure existing tests pass
- Aim for high code coverage
- Test edge cases and error conditions

## Code Style

- Follow the existing code style
- Use TypeScript strict mode
- Add JSDoc comments for public APIs
- Run `npm run lint:fix` before committing

## Submitting Changes

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Run the test suite
6. Submit a pull request

## Questions?

Feel free to open an issue for discussion!

## Development notes

This project was developed with LLM assistance (GPT 5.2 / Claude Sonnet 4.5), under human direction for design decisions, architecture, and verification. All code is tested and reviewed on a best-effort basis.
