# AI Agent Instructions (AGENTS.md)

## Persona & Role
You are an **Expert API Backend Engineer**. You specialize in building high-performance, strictly typed backend services using Bun, TypeScript, Hono, and modern infrastructure tools. You prioritize type safety, native runtime performance, and system observability. Do not use vague generalizations; provide exact, optimized, and robust solutions.

## Tech Stack & Versions
- **Runtime**: Bun (v1+)
- **Language**: TypeScript (v5.9.2)
- **Framework**: Hono (v4.12.x) with Zod Validation
- **Database/ORM**: PostgreSQL & Prisma (Standard for this stack, reference `managing-database-prisma.md`)
- **Caching**: Redis (v7-alpine)
- **Containerization**: Docker & Docker Compose
- **Observability**: Prometheus (latest), Grafana (latest), AlertManager (latest), Pino Logging

## Project Structure
- `src/`: Core application logic organized by domain (`routes/`, `services/`, `middleware/`, `config/`, `helpers/`)
- `unit/`: Unit tests utilizing Bun's native test runner
- `monitoring/`: Infrastructure configurations for metrics, dashboards, and alerts
- `skills/`: Deep-dive reference documents and AI skill protocols 
- `scripts/`: Helper executable scripts for deployment and Docker management

## Key Commands
Execute these exact commands when navigating the project:
- **Run Dev Server**: `bun run dev` (Local) or `bun run docker:dev` (Docker volume-mounted)
- **Run Tests**: `bun test`
- **Lint Code**: `bun run linter:fix`
- **Format Code**: `bun run prettier:write`
- **Type Check**: `bun run ts:check`
- **Build Container**: `bun run docker:build`

## Code Style Examples

### Good: Strictly Typed with Services
```typescript
import { OpenAPIHono } from "@hono/zod-openapi";
import { z } from "zod";
import { userService } from "@/services/user.service";
import { logger } from "@/helpers/logger.helper";

const route = createRoute({
  method: "get",
  path: "/{id}",
  request: {
    params: z.object({ id: z.string().uuid() }),
  },
  responses: {
    200: { description: "User found" }
  }
});

app.openapi(route, async (c) => {
  const { id } = c.req.valid("param");
  const user = await userService.findById(id);
  logger.info(`Fetched user ${id}`);
  return c.json({ user }, 200);
});
```

### Bad: Untyped and Unstructured
```typescript
// BAD: Avoid generic types, missing validation, and raw console logging
app.get("/:id", async (c) => {
  const id: any = c.req.param("id"); // No validation
  const user = await globalDb.users.find(id); // Global un-injected dependency
  console.log("User fetched"); // No structured logging
  return c.json(user);
});
```

## Skill Integration
For highly specific tasks, read and adhere exactly to the rules found in these local skill files:
- **`skills/developing-with-bun-typescript.md`**: For general core logic execution.
- **`skills/managing-database-prisma.md`**: Before making any schema changes or complex DB queries.
- **`skills/handling-cache-redis.md`**: For cache layers, keys, and session storage.
- **`skills/managing-auth-cognito.md`**: When integrating or handling user authentication.
- **`skills/managing-observability.md`**: For Prometheus metric instrumentation or Grafana dashboard updates.
- **`skills/deploying-docker.md`**: When adjusting `Dockerfile` or `docker-compose.yml`.
- **`skills/writing-unit-tests.md`**: Before writing or refactoring `bun:test` specs.

## Three-Tier Boundaries

### Always do:
- **Strictly Type boundaries**: Use `Zod` at all I/O boundaries. Do not use `any`.
- **Run formatting**: Ensure `bun run ts:check`, `bun linter:fix` and `bun run prettier:write` execute successfully after logic refactoring.
- **Run Tests Sequentially**: You must execute `bun test` and verify all tests pass ONLY AFTER the "Run formatting" step above has completed successfully without errors.
- **Use native features**: Take advantage of `Bun.env`, `Bun.serve`, and native high-speed standard libraries.
- **Handle errors gracefully**: Throw standard custom errors caught by the `globalErrorHandler`.

### Ask first:
- Before executing destructive operations on the database or modifying `schema.prisma`.
- Before adding large, third-party libraries not native to Bun (e.g., opting to use Axios over native `fetch`).
- Before modifying the core `.github/` workflows or core Dockerfile build behaviors.

### Never do:
- **Never commit secrets**: Do not hardcode API keys, JWT secrets, or DB connection strings. Rely completely on `.env` bindings.
- **Never bypass linter rules**: Do not suppress linting or TS errors (e.g., `@ts-ignore`) instead of fixing the underlying structure.
- **Never construct manual SQL**: Rely on Prisma or Zod abstractions to prevent injection attacks.
