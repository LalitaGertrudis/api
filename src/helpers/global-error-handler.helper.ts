import { HTTPException } from "hono/http-exception";
import type { Context } from "hono";
import type { HTTPResponseError } from "hono/types";
import { logger } from "@/helpers/logger.helper";
import { BusinessError, ErrorCode } from "@/helpers/error-registry.helper";

/**
 * Global error handler that captures and standardizes all application errors.
 * Logs structured error data including stack traces and request IDs.
 */
export const globalErrorHandler = (
    err: Error | HTTPResponseError,
    c: Context
) => {
    const requestId = c.get("requestId");

    // Handle standard business errors
    if (err instanceof BusinessError) {
        logger.warn({
            msg: "Business logic error",
            code: err.code,
            message: err.message,
            requestId,
        });
        return c.json(err.toResponse(), err.status);
    }

    // Handle standard Hono exceptions
    if (err instanceof HTTPException) {
        logger.debug({
            msg: "HTTP exception",
            status: err.status,
            message: err.message,
            requestId,
        });
        return c.json(
            {
                success: false,
                error: {
                    message: err.message,
                    code: ErrorCode.BAD_REQUEST,
                },
            },
            err.status
        );
    }

    // Handle unexpected system errors
    logger.error({
        msg: "Unhandled system error",
        error: err.message,
        stack: err.stack,
        requestId,
    });

    return c.json(
        {
            success: false,
            error: {
                message: "Internal server error",
                code: ErrorCode.INTERNAL_SERVER_ERROR,
            },
        },
        500
    );
};
