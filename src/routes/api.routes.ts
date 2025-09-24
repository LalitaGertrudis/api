import { Hono } from "hono";
import { jwk } from "hono/jwk";
import { envConfig } from "@/config/env.config";

const api = new Hono();

api.use(
    "*",
    jwk({
        jwks_uri: `https://${envConfig.jwks_uri}/.well-known/jwks.json`,
    })
);

api.get("/", (c) => c.text("api ok"));

export { api };
