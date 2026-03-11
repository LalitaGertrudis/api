/**
 * @file Main entry point for the Hono-based API server.
 */
import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { envConfig } from "@/config/env.config";
import { rateLimiter } from "@/config/rate-limiter.config";
import { globalErrorHandler } from "@/helpers/global-error-handler.helper";
import { api } from "@/routes/api.routes";
import { main } from "@/routes/main.routes";
import { redisService } from "@/services/redis.service";
import { dbService } from "@/services/db.service";
import { logger } from "@/helpers/logger.helper";
import { metricsMiddleware } from "@/middleware/metrics.middleware";
import {
    requestIdMiddleware,
    logMiddleware,
} from "@/middleware/tracing.middleware";

const app = new OpenAPIHono();

// Middlewares
app.use("*", requestIdMiddleware);
app.use("*", logMiddleware);
app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", rateLimiter());
app.use("*", metricsMiddleware);

// OpenAPI Documentation
app.doc("/openapi.json", {
    openapi: "3.0.0",
    info: {
        version: "1.0.0",
        title: "API Template",
        description: "High-performance API powered by Bun and Hono",
    },
});

app.get("/docs", swaggerUI({ url: "/openapi.json" }));

// Routes
app.route("/", main);
app.route("/api", api);

app.onError(globalErrorHandler);

const port = envConfig.port;

/**
 * Starts the application by connecting to dependencies.
 */
export const startApp = async () => {
    try {
        await redisService.connect();
        logger.info("Application started successfully with Redis connection");

        await dbService.connect();
    } catch (error) {
        const errorMessage =
            error instanceof Error ? error.message : "Unknown error";
        logger.error(`Failed to initialize Redis connection: ${errorMessage}`);
        logger.info("Application starting without Redis connection");
    }
};

/**
 * Gracefully shuts down the application.
 */
export const shutdown = async () => {
    logger.info("Shutting down gracefully");
    await redisService.disconnect();
    await dbService.disconnect();
};

/**
 * Registers process signal handlers.
 */
export const registerHandlers = () => {
    process.on("SIGINT", async () => {
        logger.info("Received SIGINT, shutting down gracefully");
        await shutdown();
        process.exit(0);
    });

    process.on("SIGTERM", async () => {
        logger.info("Received SIGTERM, shutting down gracefully");
        await shutdown();
        process.exit(0);
    });
};

// Auto-start if not in test environment
if (process.env.NODE_ENV !== "test") {
    registerHandlers();
    await startApp();
}

export default {
    port,
    fetch: app.fetch,
};
