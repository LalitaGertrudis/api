#!/bin/sh

set -e

echo "=============================================="
echo "    Preparing Database for Development        "
echo "=============================================="

# Since docker-compose is waiting for the 'service_healthy' state
# of Postgres, we don't need a sleep or while loop here.

echo "Generating Prisma Client..."
bunx prisma generate

echo "Pushing Prisma schema..."
bunx prisma db push --accept-data-loss

echo "Running Seed Script..."
bun run prisma/seed.ts

echo "=============================================="
echo "    Starting Development Server...            "
echo "=============================================="

exec bun run dev
