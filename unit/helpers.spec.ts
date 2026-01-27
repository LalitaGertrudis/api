import "./setup";
import { describe, it, expect, spyOn } from "bun:test";
import { BusinessError, ErrorCode } from "@/helpers/error-registry.helper";
import { globalErrorHandler } from "@/helpers/global-error-handler.helper";
import { logger } from "@/helpers/logger.helper";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";

describe("Helpers", () => {
    describe("BusinessError", () => {
        it("should format response correctly", () => {
            const err = new BusinessError(400, ErrorCode.BAD_REQUEST, "Msg", {
                foo: "bar",
            });
            const res = err.toResponse();
            expect(res.success).toBe(false);
            expect(res.error.code).toBe(ErrorCode.BAD_REQUEST);
            expect(res.error.details).toEqual({ foo: "bar" });
        });
    });

    describe("Global Error Handler", () => {
        const mockCtx = {
            get: () => "id",
            json: (body: unknown, status: number) => ({ body, status }),
        } as unknown as Context;

        it("should handle BusinessError", () => {
            const err = new BusinessError(400, ErrorCode.BAD_REQUEST, "Msg");
            const res = globalErrorHandler(err, mockCtx) as unknown as {
                status: number;
                body: { success: boolean; error: { code: string } };
            };
            expect(res.status).toBe(400);
            expect(res.body.success).toBe(false);
        });

        it("should handle HTTPException", () => {
            const err = new HTTPException(401, { message: "Auth failed" });
            const res = globalErrorHandler(err, mockCtx) as unknown as {
                status: number;
                body: { success: boolean; error: { code: string } };
            };
            expect(res.status).toBe(401);
            expect(res.body.error.code).toBe(ErrorCode.BAD_REQUEST);
        });

        it("should handle unknown errors", () => {
            const err = new Error("Boom");
            const res = globalErrorHandler(err, mockCtx) as unknown as {
                status: number;
                body: { success: boolean; error: { code: string } };
            };
            expect(res.status).toBe(500);
            expect(res.body.error.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
        });
    });

    describe("Logger", () => {
        it("should log via helper", () => {
            const spy = spyOn(logger, "info").mockImplementation(() => {});
            logger.info("hello");
            expect(spy).toHaveBeenCalled();
            spy.mockRestore();
        });
    });
});
