# Writing Unit Tests

**Description**: Guidelines, patterns, and workflows for writing, running, and maintaining unit tests in the Bun ecosystem.
**Freedom Level**: High (Flexible assertions and structures, provided coverage is maintained).

## Best Practices
- **Test Runner**: Exclusively use Bun's native test runner (`bun test`). Avoid Jest or Vitest unless specifically required by an external specialized bridge.
- **File Naming**: Name test files alongside implementations as `[filename].spec.ts`.
- **Mocking Strategy**: Extensively use `mock()` from `bun:test` to isolate logic. External services (Cognito, Redis, Database) should be fully mocked in unit tests.
- **Deterministic**: Tests must be hermetic and not depend on execution order or shared state. Clear mocks and shared state in `beforeEach` hooks.

## Workflow: Creating a Unit Test
1. Create a `*.spec.ts` file parallel to your logic module.
2. Import `describe`, `it`, `expect`, and `mock` from `bun:test`.
3. Set up the environment/mocks in `beforeEach`.
4. Follow the Arrange-Act-Assert (AAA) pattern for writing individual test cases.
5. Run tests locally using `bun test --watch` during development.
