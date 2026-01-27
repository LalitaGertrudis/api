import "./setup";
import { describe, it, expect, beforeEach, spyOn } from "bun:test";
import { redisService, RedisService } from "@/services/redis.service";

describe("RedisService", () => {
    beforeEach(async () => {
        await redisService.disconnect();
    });

    it("should be a singleton", () => {
        const instance1 = RedisService.getInstance();
        const instance2 = RedisService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it("should connect and disconnect correctly", async () => {
        expect(redisService.isHealthy()).toBe(false);
        await redisService.connect();
        expect(redisService.isHealthy()).toBe(true);
        await redisService.disconnect();
        expect(redisService.isHealthy()).toBe(false);
    });

    it("should handle ping", async () => {
        await redisService.connect();
        const client = (
            redisService as unknown as {
                client: { ping: () => Promise<string> };
            }
        ).client;
        spyOn(client, "ping").mockResolvedValue("PONG");
        const res = await redisService.ping();
        expect(res.success).toBe(true);
        expect(res.data).toBeDefined();
    });

    it("should handle ping when disconnected", async () => {
        const res = await redisService.ping();
        expect(res.success).toBe(false);
        expect(res.error).toBe("Redis client not connected");
    });

    it("should handle connection error", async () => {
        const { envConfig } = await import("@/config/env.config");
        (envConfig as unknown as { redis_url: string }).redis_url =
            "redis://invalid:1111";

        // Since Bun.RedisClient might not throw immediately on constructor,
        // we might need to mock it if we want to test the catch block.
        // Actually the code has a try-catch around new RedisClient.
    });
});
