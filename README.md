# API Bun Template

A high-performance, enterprise-ready boilerplate for TypeScript API servers. It leverages the Bun runtime and incorporates industry standards for modern backend development.

## Technologies Used

- **Runtime**: [Bun](https://bun.sh)
- **Framework**: [Hono](https://hono.dev/)
- **Validation & Typing**: [Zod](https://zod.dev/) & TypeScript
- **Documentation**: OpenAPI & Swagger UI
- **Logging**: Pino
- **Caching**: Redis
- **Observability**: Prometheus, Grafana, AlertManager
- **Containerization**: Docker & Docker Compose

## Prerequisites

- **[Bun](https://bun.sh/)** installed (`curl -fsSL https://bun.sh/install | bash`)
- **[Docker](https://www.docker.com/)** and **Docker Compose**

## Getting Started (Local Development)

The preferred method for local development utilizes Bun natively for execution speed, alongside Docker for supporting infrastructure dependencies such as Redis.

1. **Install dependencies:**

    ```bash
    bun install
    ```

2. **Start the development server (with hot-reloading):**

    ```bash
    bun run dev
    ```

3. **Run tests:**
    ```bash
    bun test
    ```

## Docker Deployment and Operations

The application stack, including the API, Redis, and observability infrastructure (Prometheus, Grafana, AlertManager), is orchestrated via Docker Compose.

### Development Mode

This configuration mounts the local `src` directory into the container to support hot-reloading during active development.

```bash
# Start Docker development stack
bun run docker:dev

# Stop Docker development stack
bun run docker:dev:stop
```

### Production Mode

This configuration builds the production image and executes the stack reflecting a deployed environment.

```bash
# Start production stack
bun run docker:start

# Stop production stack
bun run docker:stop
```

## Available Scripts

The following commands are defined in the project package configuration:

- `dev`: Start the local development server with watch mode enabled.
- `test`: Execute the test suite using Bun's native test runner.
- `linter:fix`: Execute ESLint with automatic issue resolution.
- `prettier:check`: Validate codebase formatting.
- `prettier:write`: Automatically resolve codebase formatting issues.
- `ts:check`: Execute the TypeScript compiler to identify type inconsistencies.
- `docker:build`: Construct the production Docker container image.
- `docker:start`: Initialize the production Docker Compose stack.
- `docker:stop`: Terminate the production Docker Compose stack.
- `docker:dev`: Initialize the development Docker Compose stack.
- `docker:dev:stop`: Terminate the development Docker Compose stack.
- `docker:logs`: Stream logs from all Docker Compose services.
- `monitoring:logs`: Stream logs strictly from Prometheus and AlertManager.

## Observability Infrastructure

When initializing the application via Docker Compose, the complete observability stack is provisioned automatically:

- **API Health Check**: Access at `http://localhost:3000/health`
- **Prometheus Metrics Endpoint**: Exposes internal service metrics to the Prometheus instance.
- **Grafana Dashboard**: Access at `http://localhost:3001` (Default credentials: `admin`/`admin`).
- **Prometheus UI**: Access at `http://localhost:9090`
- **AlertManager UI**: Access at `http://localhost:9093`
