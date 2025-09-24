import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "@/config/rate-limiter.config";
import { globalErrorHandler } from "@/helpers/global-error-handler.helper";
import { api } from "@/routes/api.routes";
import { main } from "@/routes/main.routes";

const app = new Hono();

app.use("*", logger());
app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", rateLimiter());

app.route("/", main);
app.route("/api", api);

app.onError(globalErrorHandler);

const port = process.env.PORT || 3000;

export default {
    port,
    fetch: app.fetch,
};
