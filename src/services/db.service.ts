import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { envConfig } from "@/config/env.config";
import { logger } from "@/helpers/logger.helper";

// Cached in globalThis to prevent connection exhaustion during hot-reloads
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

let prisma: PrismaClient;

if (globalForPrisma.prisma) {
    prisma = globalForPrisma.prisma;
} else {
    // Instantiate Postgres pool and Prisma adapter
    const pool = new Pool({ connectionString: envConfig.database_url });
    // Add type assertion using mapped parameters to bypass @types/pg version mismatch
    type AdapterPool = ConstructorParameters<typeof PrismaPg>[0];
    const adapter = new PrismaPg(pool as unknown as AdapterPool);
    prisma = new PrismaClient({ adapter });

    if (envConfig.node_env !== "production") {
        globalForPrisma.prisma = prisma;
    }
}

class DbService {
    public client = prisma;

    public async connect() {
        try {
            await this.client.$connect();
            logger.info("Database connection established successfully.");
        } catch (error) {
            logger.error(
                `Database connection failed: ${(error as Error).message}`
            );
            throw error;
        }
    }

    public async disconnect() {
        await this.client.$disconnect();
    }
}

export const dbService = new DbService();
