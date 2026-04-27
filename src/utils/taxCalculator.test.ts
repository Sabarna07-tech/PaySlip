import { describe, expect, it } from "vitest";
import { calculateEstimatedTDS } from "./taxCalculator";

describe("calculateEstimatedTDS", () => {
  it("returns zero within rebate limits", () => {
    expect(calculateEstimatedTDS(50000, "new")).toBe(0);
    expect(calculateEstimatedTDS(40000, "old")).toBe(0);
  });

  it("calculates monthly tax with cess above rebate limits", () => {
    expect(calculateEstimatedTDS(100000, "new")).toBe(5958);
    expect(calculateEstimatedTDS(100000, "old")).toBe(13650);
  });
});
