import "./setup";
import { describe, it, expect, spyOn, mock, beforeEach } from "bun:test";
import type { Context } from "hono";

// Import app for route testing
import app from "@/index";
import { keyGenerator } from "@/config/rate-limiter.config";
import { metricsMiddleware } from "@/middleware/metrics.middleware";
import {
    requestIdMiddleware,
    logMiddleware,
} from "@/middleware/tracing.middleware";
import { redisService } from "@/services/redis.service";

describe("API & Middlewares", () => {
    describe("Routes", () => {
        beforeEach(() => {
            spyOn(redisService, "ping").mockResolvedValue({
                success: true,
                data: "PONG",
            });
        });

        it("should respond to GET /", async () => {
            const res = await app.fetch(new Request("http://localhost/"));
            expect(res.status).toBe(200);
        });

        it("should respond to GET /health", async () => {
            const res = await app.fetch(new Request("http://localhost/health"));
            expect(res.status).toBe(200);
            const body = (await res.json()) as { status: string };
            expect(body.status).toBe("ok");
        });

        it("should respond to GET /metrics", async () => {
            const res = await app.fetch(
                new Request("http://localhost/metrics")
            );
            expect(res.status).toBe(200);
        });

        it("should handle metrics error", async () => {
            const { register } = await import("@/monitoring/default.metrics");
            spyOn(register, "metrics").mockRejectedValue(
                new Error("Metrics Fail")
            );
            const res = await app.fetch(
                new Request("http://localhost/metrics")
            );
            expect(res.status).toBe(500);
        });
    });

    describe("Rate Limiter Key Generator", () => {
        it("should extract keys correctly", () => {
            const ctxAuth = {
                req: {
                    header: (k: string) =>
                        k === "Authorization" ? "Bearer t" : undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxAuth)).toBe("api_key:t");

            const ctxApiKey = {
                req: {
                    header: (k: string) =>
                        k === "Authorization" ? "ApiKey k1" : undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxApiKey)).toBe("api_key:k1");

            const ctxInvalidAuth = {
                req: {
                    header: (k: string) =>
                        k === "Authorization" ? "undefined" : undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxInvalidAuth)).not.toContain("api_key:");

            const ctxUser = {
                req: {
                    header: () => undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: (k: string) => (k === "userId" ? "u1" : undefined),
            } as unknown as Context;
            expect(keyGenerator(ctxUser)).toBe("user:u1");

            const ctxSession = {
                req: {
                    header: (k: string) =>
                        k === "X-Session-ID" ? "s1" : undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxSession)).toBe("session:s1");

            const ctxClient = {
                req: {
                    header: () => undefined,
                    query: (k: string) =>
                        k === "client_id" ? "c1" : undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxClient)).toBe("client:c1");

            const ctxCustomKey = {
                req: {
                    header: (k: string) =>
                        k === "X-API-Key" ? "ck1" : undefined,
                    query: () => undefined,
                    path: "/t",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxCustomKey)).toBe("api_key:ck1");

            const ctxPublic = {
                req: {
                    header: () => undefined,
                    query: () => undefined,
                    path: "/public/test",
                    method: "GET",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxPublic)).toBe("endpoint:GET:/public/test");

            const ctxFallback = {
                req: {
                    header: (k: string) =>
                        k === "User-Agent" ? "Bot" : undefined,
                    query: () => undefined,
                    path: "/private",
                    method: "POST",
                },
                get: () => undefined,
            } as unknown as Context;
            expect(keyGenerator(ctxFallback)).toContain("fallback:Bot");
        });
    });

    describe("Middlewares", () => {
        it("tracing should set headers", async () => {
            const headers = new Map();
            const ctx = {
                set: () => {},
                header: (k: string, v: string) => headers.set(k, v),
            } as unknown as Context;
            const next = mock(async () => {});
            await requestIdMiddleware(ctx, next);
            expect(headers.has("X-Request-Id")).toBe(true);
        });

        it("log middleware should work", async () => {
            const ctx = {
                req: { method: "G", path: "/" },
                get: () => "id",
                res: { status: 200 },
            } as unknown as Context;
            const next = mock(async () => {});
            await logMiddleware(ctx, next);
            expect(next).toHaveBeenCalled();
        });

        it("metrics middleware status", async () => {
            const ctx = {
                req: { path: "/t", method: "G" },
                res: { status: 200 },
            } as unknown as Context;
            const next = mock(async () => {});
            await metricsMiddleware(ctx, next);

            const ctxErr = {
                req: { path: "/t", method: "G" },
                res: { status: 500 },
            } as unknown as Context;
            await metricsMiddleware(ctxErr, next);
            expect(next).toHaveBeenCalled();
        });
    });
});
