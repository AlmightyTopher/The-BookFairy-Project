# Contributing

## Getting Started
- Use Node 20, npm 10.
- Branch from `main`, PRs must pass CI.
- Add tests for new behavior, update Zod schemas as needed.
- No breaking changes without a changelog entry.

## Development Workflow
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Run linting: `npm run lint`
6. Run type checking: `npm run typecheck`
7. Submit a pull request

## Code Style
- Use TypeScript for all new code
- Follow existing naming conventions
- Add JSDoc comments for public APIs
- Use Zod schemas for data validation

## Testing
- Write tests for all new functionality
- Maintain test coverage above 80%
- Use descriptive test names
- Mock external dependencies
