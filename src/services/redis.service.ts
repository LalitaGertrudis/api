import { RedisClient } from "bun";
import { envConfig } from "@/config/env.config";
import { logger } from "@/helpers/logger.helper";

export interface RedisOperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

/**
 * Service to manage Redis connections and operations.
 * Implements the Singleton pattern.
 */
export class RedisService {
    private static instance: RedisService;
    private client: RedisClient | null = null;
    private isConnected = false;

    private constructor() {}

    /**
     * Gets the singleton instance of RedisService.
     */
    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    /**
     * Establishes a connection to the Redis server.
     * @throws Error if connection fails.
     */
    public async connect(): Promise<void> {
        try {
            if (this.isConnected && this.client) {
                return;
            }

            this.client = new RedisClient(envConfig.redis_url);
            this.isConnected = true;
        } catch (error) {
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            this.isConnected = false;
            this.client = null;
            throw new Error(`Redis connection failed: ${errorMessage}`);
        }
    }

    /**
     * Closes the Redis connection gracefully.
     */
    public async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            try {
                this.client.close();
                this.isConnected = false;
                this.client = null;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                logger.error(`Error disconnecting Redis: ${errorMessage}`);
            }
        }
    }

    /**
     * Sends a PING command to Redis to check connectivity.
     */
    public async ping(): Promise<RedisOperationResult<string>> {
        if (!this.client || !this.isConnected) {
            return { success: false, error: "Redis client not connected" };
        }

        try {
            const result = await this.client.ping("test");
            return { success: true, data: result };
        } catch (error) {
            this.isConnected = false;
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: errorMessage };
        }
    }

    /**
     * Checks if the Redis service is healthy and connected.
     */
    public isHealthy(): boolean {
        return this.isConnected && this.client !== null;
    }
}

export const redisService = RedisService.getInstance();
