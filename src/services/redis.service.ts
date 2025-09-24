import { RedisClient } from "bun";
import { envConfig } from "@/config/env.config";
import { log } from "@/helpers/logger.helper";

export interface RedisOperationResult<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
}

export class RedisService {
    private static instance: RedisService;
    private client: RedisClient | null = null;
    private isConnected = false;

    private constructor() {}

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

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

    public async disconnect(): Promise<void> {
        if (this.client && this.isConnected) {
            try {
                this.client.close();
                this.isConnected = false;
                this.client = null;
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : "Unknown error";
                log(`Error disconnecting Redis: ${errorMessage}`);
            }
        }
    }

    public async ping(): Promise<RedisOperationResult<string>> {
        if (!this.client || !this.isConnected) {
            return { success: false, error: "Redis client not connected" };
        }

        try {
            const result = await this.client.ping('test');
            return { success: true, data: result };
        } catch (error) {
            this.isConnected = false;
            const errorMessage =
                error instanceof Error ? error.message : "Unknown error";
            return { success: false, error: errorMessage };
        }
    }

    public isHealthy(): boolean {
        return this.isConnected && this.client !== null;
    }
}

export const redisService = RedisService.getInstance();
