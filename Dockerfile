# Multi-stage build for Bun TypeScript API
FROM oven/bun:1 AS base
WORKDIR /usr/src/app

# Dependencies stage
FROM base AS deps
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# Build stage
FROM base AS build
COPY package.json bun.lock ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .
RUN bun run prettier:check && bun run linter:fix
RUN bun install --frozen-lockfile --production

# Development stage
FROM base AS development
COPY package.json bun.lock ./
COPY --from=deps /usr/src/app/node_modules ./node_modules
COPY . .

EXPOSE 3000

ENV NODE_ENV=development

CMD ["bun", "dev"]

# Production stage
FROM base AS production
RUN groupadd --system --gid 1001 bunuser && \
    useradd --system --uid 1001 --gid bunuser bunuser

COPY --from=build --chown=bunuser:bunuser /usr/src/app/node_modules ./node_modules
COPY --from=build --chown=bunuser:bunuser /usr/src/app/package.json ./
COPY --from=build --chown=bunuser:bunuser /usr/src/app/src ./src
COPY --from=build --chown=bunuser:bunuser /usr/src/app/tsconfig.json ./

USER bunuser

EXPOSE 3000

ENV NODE_ENV=production

CMD ["bun", "run", "./src/index.ts"]