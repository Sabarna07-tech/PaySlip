import { describe, expect, it } from "vitest";
import { solveGrossForNet, DEFAULT_COMPOSITION } from "./reverseCalc";
import { calculatePayslip } from "./payroll";
import { DEFAULT_PAYROLL_RULES } from "./settings";

describe("solveGrossForNet", () => {
  it("with no deductions (below PT threshold), gross equals net", () => {
    // Below the default ₹15k professional-tax threshold, no statutory deductions apply.
    const r = solveGrossForNet(10000, { pfEmployer: false, esiApplicable: false });
    expect(r.gross).toBe(10000);
    expect(r.achievedNet).toBe(10000);
    expect(r.exact).toBe(true);
  });

  it("recovers a gross whose net matches the requested take-home (round-trip)", () => {
    const target = 60000;
    const r = solveGrossForNet(target, { pfEmployer: true, esiApplicable: false });
    // Feeding the solved employee back through the engine reproduces the net.
    const recomputed = calculatePayslip(r.payslip.employee, DEFAULT_PAYROLL_RULES);
    expect(recomputed.netPay).toBe(r.achievedNet);
    expect(Math.abs(r.achievedNet - target)).toBeLessThanOrEqual(2);
  });

  it("produces a gross greater than net when deductions apply", () => {
    const r = solveGrossForNet(40000, { pfEmployer: true, esiApplicable: false, tds: 2000 });
    expect(r.gross).toBeGreaterThan(40000);
    expect(r.payslip.deductions.total).toBeGreaterThan(0);
  });

  it("normalises a composition that does not sum to 1", () => {
    const r = solveGrossForNet(30000, {
      composition: { basic: 5, hra: 2, conveyance: 1, medical: 1, special: 1 },
      pfEmployer: false,
      esiApplicable: false,
    });
    const e = r.payslip.employee;
    const sum = e.basicSalary + e.hra + e.conveyance + e.medical + e.special;
    // Components should reconstruct (approximately) the gross.
    expect(Math.abs(sum - r.gross)).toBeLessThanOrEqual(3);
  });

  it("carries employee metadata into the result", () => {
    const r = solveGrossForNet(25000, { meta: { name: "Asha", month: "March", year: 2026 } });
    expect(r.payslip.employee.name).toBe("Asha");
    expect(r.payslip.employee.month).toBe("March");
  });

  it("exposes a usable default composition", () => {
    const total =
      DEFAULT_COMPOSITION.basic +
      DEFAULT_COMPOSITION.hra +
      DEFAULT_COMPOSITION.conveyance +
      DEFAULT_COMPOSITION.medical +
      DEFAULT_COMPOSITION.special;
    expect(total).toBeCloseTo(1, 5);
  });
});
