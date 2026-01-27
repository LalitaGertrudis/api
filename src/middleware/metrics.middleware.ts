import type { Context, Next } from "hono";
import {
    httpRequestDuration,
    httpRequestTotal,
    requestsInFlight,
    errorTotal,
} from "@/monitoring/custom.metrics";

/**
 * Middleware to track HTTP request metrics including duration, counts, and errors.
 *
 * @param c - The Hono context
 * @param next - The next middleware/handler function
 */
export const metricsMiddleware = async (c: Context, next: Next) => {
    const start = Date.now();
    const route = c.req.path;
    const method = c.req.method;

    requestsInFlight.inc();

    try {
        await next();

        const duration = (Date.now() - start) / 1000;
        const status = c.res.status.toString();

        httpRequestDuration.observe({ method, route, status }, duration);
        httpRequestTotal.inc({ method, route, status });

        if (c.res.status >= 400) {
            const errorType =
                c.res.status >= 500 ? "server_error" : "client_error";
            errorTotal.inc({ type: errorType, route });
        }
    } catch (error) {
        errorTotal.inc({ type: "unhandled", route });
        throw error;
    } finally {
        requestsInFlight.dec();
    }
};
