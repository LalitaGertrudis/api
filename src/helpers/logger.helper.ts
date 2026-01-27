import pino from "pino";
import { envConfig } from "@/config/env.config";

/**
 * Configure Pino logger with development-friendly output in non-production environments.
 */
const nodeEnv = envConfig.node_env;

export const logger = pino({
    level: nodeEnv === "production" ? "info" : "debug",
    transport:
        nodeEnv !== "production"
            ? {
                  target: "pino-pretty",
                  options: {
                      colorize: true,
                  },
              }
            : undefined,
});
