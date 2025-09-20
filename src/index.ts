import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "@/config/rate-limiter.config";
import { log } from "@/helpers/logger.helper";
import { register } from "@/monitoring/metrics";
import { HTTPException } from "hono/http-exception";

log("API is running");

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", rateLimiter());

app.get("/health", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
    });
});

app.get("/metrics", async (c) => {
    try {
        const metrics = await register.metrics();
        return c.text(metrics, 200, {
            "Content-Type": register.contentType,
        });
    } catch (error) {
        console.error("Error generating metrics:", error);
        return c.text("Error generating metrics", 500);
    }
});

app.get("/", (c) => c.text("Hello World"));

app.onError((err, c) => {
    console.error("Global error handler:", err);

    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                message: err.message,
                errors: err.cause ? [err.cause] : undefined,
            },
            err.status
        );
    }

    return c.json(
        {
            success: false,
            message: "Internal server error",
        },
        500
    );
});

export default app;
