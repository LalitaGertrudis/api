import { register } from "@/monitoring/default.metrics";
import { Hono } from "hono";

const main = new Hono();

main.get("/", (c) => c.text("Hello World"));

main.get("/health", (c) => {
    return c.json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
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
