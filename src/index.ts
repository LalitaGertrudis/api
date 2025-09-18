import { Hono } from "hono";
import { logger } from "hono/logger";
import { log } from "@/helpers/logger.helper";
import { register } from "@/monitoring/metrics";

log("API is running");

const app = new Hono();

app.use(logger());

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

export default app;
