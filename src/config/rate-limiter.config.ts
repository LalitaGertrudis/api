import { rateLimiter as rateLimiterMiddleware } from "hono-rate-limiter";
import type { Context } from "hono";

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
const keyGenerator = (c: Context): string => {
    // 1. Check for API key in Authorization header (highest priority)
    const authHeader = c.req.header("Authorization");
    if (authHeader) {
        // Extract API key from Bearer token or API key format
        const apiKey = authHeader.startsWith("Bearer ")
            ? authHeader.substring(7)
            : authHeader.startsWith("ApiKey ")
              ? authHeader.substring(7)
              : authHeader;

        if (apiKey && apiKey !== "undefined" && apiKey !== "null") {
            return `api_key:${apiKey}`;
        }
    }

    // 2. Check for user ID from authentication context
    // This assumes you have user authentication middleware that sets user context
    const userId = c.get("userId") || c.get("user")?.id;
    if (userId) {
        return `user:${userId}`;
    }

    // 3. Check for API key in custom headers (common patterns)
    const customApiKey =
        c.req.header("X-API-Key") ||
        c.req.header("X-Auth-Token") ||
        c.req.header("X-Access-Token");
    if (customApiKey) {
        return `api_key:${customApiKey}`;
    }

    // 4. Check for session ID
    const sessionId = c.req.header("X-Session-ID") || c.get("sessionId");
    if (sessionId) {
        return `session:${sessionId}`;
    }

    // 5. Check for specific query parameters that identify users
    const clientId = c.req.query("client_id");
    if (clientId) {
        return `client:${clientId}`;
    }

    // 6. Use URL path for endpoint-specific rate limiting
    // This allows different limits per endpoint
    const path = c.req.path;
    const method = c.req.method;

    // For public endpoints, use path-based limiting
    if (
        path.startsWith("/public/") ||
        path === "/health" ||
        path === "/metrics"
    ) {
        return `endpoint:${method}:${path}`;
    }

    // 7. Fallback: use a combination of headers that might identify a client
    const userAgent = c.req.header("User-Agent") || "unknown";
    const acceptLanguage = c.req.header("Accept-Language") || "unknown";

    // Create a hash-like identifier from available headers
    const fallbackKey = `${userAgent}:${acceptLanguage}`.slice(0, 50);
    return `fallback:${fallbackKey}`;
};

export const rateLimiter = () =>
    rateLimiterMiddleware({
        windowMs: 15 * 60 * 1000, // 15 minutes
        limit: 100,
        standardHeaders: "draft-6",
        keyGenerator,
    });
