import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "@/config/rate-limiter.config";
import { globalErrorHandler } from "@/helpers/global-error-handler.helper";
import { api } from "@/routes/api.routes";
import { main } from "@/routes/main.routes";
import { redisService } from "@/services/redis.service";
import { log } from "@/helpers/logger.helper";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", rateLimiter());

app.route("/", main);
app.route("/api", api);

app.onError(globalErrorHandler);

const port = process.env.PORT || 3000;

// Initialize Redis connection
try {
    await redisService.connect();
    log("Application started successfully with Redis connection");
} catch (error) {
    const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
    log(`Failed to initialize Redis connection: ${errorMessage}`);
    log("Application starting without Redis connection");
}

// Graceful shutdown
process.on("SIGINT", async () => {
    log("Received SIGINT, shutting down gracefully");
    await redisService.disconnect();
    process.exit(0);
});

process.on("SIGTERM", async () => {
    log("Received SIGTERM, shutting down gracefully");
    await redisService.disconnect();
    process.exit(0);
});

export default {
    port,
    fetch: app.fetch,
};
