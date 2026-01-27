import type { Context, Next } from "hono";
import { logger } from "@/helpers/logger.helper";

/**
 * Middleware to inject a unique Request ID for tracing.
 * Also attaches the request ID to the logger context.
 */
export const requestIdMiddleware = async (c: Context, next: Next) => {
    const requestId = crypto.randomUUID();
    c.set("requestId", requestId);
    c.header("X-Request-Id", requestId);

    // Contextual logging for the duration of the request
    await next();
};

/**
 * Middleware to log incoming requests and outgoing responses using Pino.
 */
export const logMiddleware = async (c: Context, next: Next) => {
    const start = Date.now();
    const { method, path } = c.req;
    const requestId = c.get("requestId");

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    logger.info({
        msg: `${method} ${path} ${status} - ${duration}ms`,
        method,
        path,
        status,
        duration,
        requestId,
    });
};
