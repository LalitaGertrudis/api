# Developing with Bun & TypeScript

**Description**: Core guidelines and workflows for writing application code using the Bun runtime and TypeScript. Apply this skill whenever authoring new application logic, setting up routes, or managing dependencies.
**Freedom Level**: High (Flexible implementation within standard patterns, prioritize developer experience and performance).

## Best Practices
- **Package Management**: Exclusively use `bun` CLI. Do not use `npm`, `yarn`, or `pnpm`. Install packages via `bun add`.
- **Native APIs**: Prefer Bun's highly optimized native APIs (e.g., `Bun.serve()`, `Bun.file()`, `Bun.env`, `Bun.password`) over Node.js equivalents where possible.
- **Type Safety**: Strict typing is mandatory. Absolutely no `any` types; prefer `unknown` at system boundaries and parse data using a validation library (e.g., Zod). 
- **Error Handling**: Use custom Error classes. Avoid throwing raw strings. Return standardized JSON error responses.

## Workflow: Starting a New Module
1. Create a strongly-typed interface for the domain entity.
2. Define Zod schemas for request validation (body, query, params).
3. Implement the service layer containing business logic (independent of HTTP framework).
4. Implement the controller/handler, injecting the service.
