import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";

/**
 * Standard business error codes for client-side consumption.
 */
export enum ErrorCode {
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    VALIDATION_ERROR = "VALIDATION_ERROR",
    UNAUTHORIZED = "UNAUTHORIZED",
    FORBIDDEN = "FORBIDDEN",
    NOT_FOUND = "NOT_FOUND",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    BAD_REQUEST = "BAD_REQUEST",
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE",
}

/**
 * Custom Business Error class that extends Hono's HTTPException.
 */
export class BusinessError extends HTTPException {
    public readonly code: ErrorCode;
    public readonly details?: unknown;

    constructor(
        status: ContentfulStatusCode,
        code: ErrorCode,
        message: string,
        details?: unknown
    ) {
        super(status, { message });
        this.code = code;
        this.details = details;
    }

    /**
     * Converts the error to a standard JSON response body.
     */
    public toResponse() {
        return {
            success: false,
            error: {
                message: this.message,
                code: this.code,
                details: this.details,
            },
        };
    }
}
