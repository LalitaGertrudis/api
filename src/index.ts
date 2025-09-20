import { Hono } from "hono";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "@/config/rate-limiter.config";
import { log } from "@/helpers/logger.helper";
import { main } from "@/routes/main.routes";

log("API is running");

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", rateLimiter());

app.route("/", main);

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
