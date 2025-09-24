export const envConfig = {
    node_env: process.env.NODE_ENV,
    jwks_uri: process.env.JWKS_URI,
    port: process.env.PORT,
    redis_url: process.env.REDIS_URL || "redis://localhost:6379",
};
