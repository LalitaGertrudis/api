import { rateLimiter as rateLimiterMiddleware } from "hono-rate-limiter";
import type { Context } from "hono";
import { settingsService } from "@/services/settings.service";

/**
 * Key generator function for rate limiting
 *
 * This function determines what to limit a request on, representing a unique
 * characteristic of a user or class of user. It prioritizes:
 * 1. API keys in Authorization headers
 * 2. User IDs from authentication
 * 3. URL paths/routes for endpoint-specific limiting
 * 4. Specific query parameters
 *
 * Avoids IP addresses as they can be shared by many users in valid cases.
 */
export const keyGenerator = (c: Context): string => {
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
        const apiKey = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader.startsWith("ApiKey ")
              ? authHeader.substring(7)
              : authHeader;

        if (apiKey && apiKey !== "undefined" && apiKey !== "null") {
            return `api_key:${apiKey}`;
        }
    }

    const userId = c.get("userId") || c.get("user")?.id;
    if (userId) {
        return `user:${userId}`;
    }

    const customApiKey =
        c.req.header("X-API-Key") ||
        c.req.header("X-Auth-Token") ||
        c.req.header("X-Access-Token");
    if (customApiKey) {
        return `api_key:${customApiKey}`;
    }

    const sessionId = c.req.header("X-Session-ID") || c.get("sessionId");
    if (sessionId) {
        return `session:${sessionId}`;
    }

    const clientId = c.req.query("client_id");
    if (clientId) {
        return `client:${clientId}`;
    }

    const path = c.req.path;
    const method = c.req.method;

    if (
        path.startsWith("/public/") ||
        path === "/health" ||
        path === "/metrics"
    ) {
        return `endpoint:${method}:${path}`;
    }

    const userAgent = c.req.header("User-Agent") || "unknown";
    const acceptLanguage = c.req.header("Accept-Language") || "unknown";

    const fallbackKey = `${userAgent}:${acceptLanguage}`.slice(0, 50);
    return `fallback:${fallbackKey}`;
};

export const rateLimiter = () =>
    rateLimiterMiddleware({
        windowMs: 60 * 1000, // 1 minute (matching rate_limit.requests_per_minute)
        limit: async () =>
            await settingsService.getNumber(
                "rate_limit.requests_per_minute",
                100
            ),
        standardHeaders: "draft-6",
        keyGenerator,
    });
