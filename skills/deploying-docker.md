# Deploying Containerization: Docker

**Description**: Standards and workflows for building and maintaining production-ready Docker containers for the Bun runtime.
**Freedom Level**: Low (Strict adherence to security and build optimization standards).

## Best Practices

- **Base Image**: Always use the official `oven/bun:alpine` as the base image to minimize surface area and image size.
- **Multi-stage Builds**: Use multi-stage Dockerfiles. Separate the dependency install phase from the production runtime phase.
- **Security**: Never run the application as the `root` user. Always switch to a non-root user (e.g., `USER bun`) before the `CMD` instruction.
- **Ignore Context**: Maintain a strictly updated `.dockerignore` file. Prevent `node_modules/`, `.git/`, `.env`, and test files from entering the Docker build context.

## Workflow: Dockerfile Structure

1. `FROM oven/bun:alpine as builder`
2. Copy `package.json` and `bun.lockb`.
3. Run `bun install --frozen-lockfile`.
4. Copy source code and build (if a build step exists).
5. `FROM oven/bun:alpine as runner`
6. Switch user, copy artifacts from the builder.
7. Expose ports and set `CMD ["bun", "run", "src/index.ts"]`.
