import { describe, expect, it } from "vitest";
import type { Employee, PayrollRules } from "@/types";
import { calculatePayslip } from "./payroll";
import { DEFAULT_PAYROLL_RULES } from "./settings";

const employee: Employee = {
  name: "Asha Rao",
  basicSalary: 30000,
  hra: 10000,
  conveyance: 2000,
  medical: 1000,
  special: 5000,
  pfEmployer: true,
  esiApplicable: true,
  paidLeaves: 0,
  unpaidLeaves: 2,
  overtimeHours: 4,
  overtimeRate: 250,
  bonus: 1000,
  tds: 500,
  month: "April",
  year: 2026,
};

describe("calculatePayslip", () => {
  it("uses configurable statutory rules", () => {
    const rules: PayrollRules = {
      ...DEFAULT_PAYROLL_RULES,
      workingDays: 20,
      pfBasicCeiling: 10000,
      pfRate: 0.1,
      esiGrossThreshold: 100000,
      esiRate: 0.01,
      professionalTaxThreshold: 40000,
      professionalTaxAmount: 250,
    };

    const payslip = calculatePayslip(employee, rules);

    expect(payslip.earnings.total).toBe(50000);
    expect(payslip.deductions.pf).toBe(1000);
    expect(payslip.deductions.esi).toBe(500);
    expect(payslip.deductions.pt).toBe(250);
    expect(payslip.deductions.unpaidLeaveDeduction).toBe(4800);
    expect(payslip.netPay).toBe(42950);
  });
});
