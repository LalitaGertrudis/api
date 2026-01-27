import { z } from "zod";

/**
 * Schema for environment variables validation.
 */
const envSchema = z.object({
    NODE_ENV: z
        .enum(["development", "production", "test"])
        .default("development"),
    PORT: z
        .string()
        .default("3000")
        .transform((val) => parseInt(val, 10)),
    JWKS_URI: z.string().min(1, "JWKS_URI is required"),
    REDIS_URL: z.string().url().default("redis://localhost:6379"),
});

/**
 * Validates environment variables.
 * @param env The environment object to validate (usually process.env).
 * @returns The validated and typed environment configuration.
 */
export const validateEnv = (env: Record<string, string | undefined>) => {
    const result = envSchema.safeParse(env);

    if (!result.success) {
        console.error("Invalid environment variables:", result.error.format());
        process.exit(1);
        throw new Error("Invalid environment variables");
    }

    const { data } = result;

    return {
        node_env: data.NODE_ENV,
        jwks_uri: data.JWKS_URI,
        port: data.PORT,
        redis_url: data.REDIS_URL,
    } as const;
};

/**
 * Validated environment configuration singleton.
 */
export const envConfig = validateEnv(process.env);
