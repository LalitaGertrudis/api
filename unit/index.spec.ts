import { describe, it, expect } from "bun:test";
import app from "@/index";

describe("API", () => {
    it("should be defined", () => {
        expect(app).toBeDefined();
    });
});
