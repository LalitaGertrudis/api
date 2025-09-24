import { envConfig } from "@/config/env.config";
import { register } from "@/monitoring/default.metrics";
import { redisService } from "@/services/redis.service";
import { Hono } from "hono";

const main = new Hono();

main.get("/", (c) => c.text("api server ok"));

main.get("/health", async (c) => {
    const redisHealth = await redisService.ping();

    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        node_env: envConfig.node_env,
        redis: redisHealth.success ? "ok" : redisHealth.error,
    });
});

main.get("/metrics", async (c) => {
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

export { main };
