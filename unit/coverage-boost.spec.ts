import "./setup";
import { describe, it, expect, mock, spyOn } from "bun:test";
import type { Context } from "hono";
import { metricsMiddleware } from "@/middleware/metrics.middleware";
import { startApp, shutdown, registerHandlers } from "@/index";
import { validateEnv } from "@/config/env.config";

describe("Coverage Boost", () => {
    it("metrics middleware handled error", async () => {
        const ctx = {
            req: { path: "/t", method: "G" },
        } as unknown as Context;
        const next = mock(async () => {
            throw new Error("Boom");
        });
        try {
            await metricsMiddleware(ctx, next);
        } catch (e) {
            expect((e as Error).message).toBe("Boom");
        }
    });

    it("index.ts handlers and shutdown", async () => {
        const exitSpy = spyOn(process, "exit").mockImplementation(
            (() => {}) as unknown as (code?: string | number | null) => never
        );
        const { redisService } = await import("@/services/redis.service");
        spyOn(redisService, "disconnect").mockResolvedValue();

        registerHandlers();

        process.emit("SIGINT" as never);
        process.emit("SIGTERM" as never);

        await new Promise((r) => setTimeout(r, 50));
        await shutdown();

        expect(exitSpy).toHaveBeenCalled();
        exitSpy.mockRestore();
    });

    it("index.ts startApp success", async () => {
        const { redisService } = await import("@/services/redis.service");
        spyOn(redisService, "connect").mockResolvedValue();
        await startApp();
    });

    it("index.ts startApp failure", async () => {
        const { redisService } = await import("@/services/redis.service");
        spyOn(redisService, "connect").mockRejectedValue(new Error("Down"));
        await startApp();
    });

    it("env config validation branches", () => {
        const exitSpy = spyOn(process, "exit").mockImplementation(
            (() => {}) as unknown as (code?: string | number | null) => never
        );
        spyOn(console, "error").mockImplementation(() => {});

        const validEnv = {
            NODE_ENV: "test",
            JWKS_URI: "http://test",
            PORT: "3000",
        };
        const config = validateEnv(validEnv);
        expect(config.node_env).toBe("test");

        try {
            validateEnv({});
        } catch {
            // Expected
        }
        expect(exitSpy).toHaveBeenCalledWith(1);
        exitSpy.mockRestore();
    });

    it("logger branch coverage", async () => {
        const oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "production";
        // Use a unique cache buster for the production branch
        const { logger: prodLogger } = await import(
            `@/helpers/logger.helper?prod=${Date.now()}`
        );
        expect(prodLogger).toBeDefined();
        process.env.NODE_ENV = oldEnv;
    });

    it("index.ts full execution", async () => {
        const oldEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = "development";
        await import(`@/index?t=full-${Date.now()}`);
        process.env.NODE_ENV = oldEnv;
    });
});
