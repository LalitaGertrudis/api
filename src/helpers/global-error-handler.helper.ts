import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { HTTPResponseError } from "hono/types";

export const globalErrorHandler = (
    err: Error | HTTPResponseError,
    c: Context
) => {
    console.error("Global error handler:", err);

    if (err instanceof HTTPException) {
        return c.json(
            {
                success: false,
                message: err.message,
                errors: err.cause ? [err.cause] : undefined,
            },
            err.status
        );
    }

    return c.json(
        {
            success: false,
            message: "Internal server error",
        },
        500
    );
};
