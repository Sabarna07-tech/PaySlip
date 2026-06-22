import { describe, expect, it } from "vitest";
import type { Payslip } from "@/types";
import { computeDashboard } from "./analytics";
import { runPayroll, summarizePayRun, type RosterEmployee } from "./payRun";
import { DEFAULT_PAYROLL_RULES } from "./settings";

function makePayslip(over: {
  name: string;
  pan?: string;
  dept?: string;
  month: string;
  year: number;
  net: number;
  gross?: number;
}): Payslip {
  const gross = over.gross ?? over.net;
  return {
    id: crypto.randomUUID(),
    employee: {
      name: over.name, pan: over.pan, department: over.dept,
      basicSalary: gross, hra: 0, conveyance: 0, medical: 0, special: 0,
      pfEmployer: false, esiApplicable: false,
      paidLeaves: 0, unpaidLeaves: 0, overtimeHours: 0, overtimeRate: 0,
      bonus: 0, tds: 0, month: over.month, year: over.year,
    },
    earnings: { basic: gross, hra: 0, conveyance: 0, medical: 0, special: 0, lta: 0, customAllowancesTotal: 0, overtimePay: 0, bonus: 0, total: gross },
    deductions: { pf: 0, esi: 0, tds: 0, pt: 0, unpaidLeaveDeduction: 0, total: gross - over.net },
    netPay: over.net,
    generatedAt: new Date().toISOString(),
  };
}

describe("computeDashboard", () => {
  const data: Payslip[] = [
    makePayslip({ name: "Asha", pan: "AAAAA1111A", dept: "Eng", month: "April", year: 2025, net: 45000 }),
    makePayslip({ name: "Ravi", pan: "BBBBB2222B", dept: "Sales", month: "April", year: 2025, net: 30000 }),
    makePayslip({ name: "Asha", pan: "AAAAA1111A", dept: "Eng", month: "May", year: 2025, net: 45000 }),
  ];

  it("computes headline totals and distinct employees", () => {
    const d = computeDashboard(data);
    expect(d.totalPayslips).toBe(3);
    expect(d.totalNet).toBe(120000);
    expect(d.distinctEmployees).toBe(2);
  });

  it("splits cost by department, highest first", () => {
    const d = computeDashboard(data);
    expect(d.deptSplit[0].dept).toBe("Eng");
    expect(d.deptSplit[0].net).toBe(90000);
  });

  it("orders the trend chronologically and reports the latest period", () => {
    const d = computeDashboard(data);
    expect(d.trend.map((t) => t.key)).toEqual(["202504", "202505"]);
    expect(d.latestPeriodLabel).toBe("May 25");
    expect(d.latestPeriodNet).toBe(45000);
  });

  it("handles empty history", () => {
    const d = computeDashboard([]);
    expect(d.totalPayslips).toBe(0);
    expect(d.latestPeriodLabel).toBe("—");
  });
});

describe("runPayroll", () => {
  const roster: RosterEmployee[] = [
    { name: "Asha", basicSalary: 30000, hra: 12000, conveyance: 0, medical: 0, special: 8000, pfEmployer: true, esiApplicable: false, paidLeaves: 0, unpaidLeaves: 0, overtimeHours: 0, overtimeRate: 0, bonus: 0, tds: 0 },
    { name: "Ravi", basicSalary: 20000, hra: 8000, conveyance: 0, medical: 0, special: 2000, pfEmployer: false, esiApplicable: true, paidLeaves: 0, unpaidLeaves: 0, overtimeHours: 0, overtimeRate: 0, bonus: 0, tds: 0 },
  ];

  it("generates one payslip per roster employee for the chosen period", () => {
    const slips = runPayroll(roster, "June", 2026, DEFAULT_PAYROLL_RULES);
    expect(slips).toHaveLength(2);
    expect(slips[0].employee.month).toBe("June");
    expect(slips[0].employee.year).toBe(2026);
    expect(slips[0].employee.name).toBe("Asha");
  });

  it("summarizes a pay run", () => {
    const slips = runPayroll(roster, "June", 2026, DEFAULT_PAYROLL_RULES);
    const sum = summarizePayRun(slips);
    expect(sum.count).toBe(2);
    expect(sum.net).toBe(slips[0].netPay + slips[1].netPay);
    expect(sum.gross).toBe(slips[0].earnings.total + slips[1].earnings.total);
  });
});
