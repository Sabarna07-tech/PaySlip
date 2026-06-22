import { describe, expect, it } from "vitest";
import type { Payslip } from "@/types";
import {
  buildAnnualRegister,
  financialYearStart,
  fyLabel,
  listFinancialYears,
  registerToCSV,
} from "./reports";

function makePayslip(over: {
  name: string;
  pan?: string;
  month: string;
  year: number;
  gross: number;
  net: number;
  pf?: number;
  tds?: number;
}): Payslip {
  return {
    id: crypto.randomUUID(),
    employee: {
      name: over.name,
      pan: over.pan,
      department: "Eng",
      basicSalary: over.gross,
      hra: 0, conveyance: 0, medical: 0, special: 0,
      pfEmployer: false, esiApplicable: false,
      paidLeaves: 0, unpaidLeaves: 0, overtimeHours: 0, overtimeRate: 0,
      bonus: 0, tds: over.tds ?? 0,
      month: over.month, year: over.year,
    },
    earnings: {
      basic: over.gross, hra: 0, conveyance: 0, medical: 0, special: 0,
      lta: 0, customAllowancesTotal: 0, overtimePay: 0, bonus: 0, total: over.gross,
    },
    deductions: {
      pf: over.pf ?? 0, esi: 0, tds: over.tds ?? 0, pt: 0,
      unpaidLeaveDeduction: 0, total: (over.pf ?? 0) + (over.tds ?? 0),
    },
    netPay: over.net,
    generatedAt: new Date().toISOString(),
  };
}

describe("financial year", () => {
  it("maps April–December to the same calendar year", () => {
    expect(financialYearStart(makePayslip({ name: "A", month: "April", year: 2025, gross: 1, net: 1 }))).toBe(2025);
    expect(financialYearStart(makePayslip({ name: "A", month: "December", year: 2025, gross: 1, net: 1 }))).toBe(2025);
  });

  it("maps January–March to the previous calendar year", () => {
    expect(financialYearStart(makePayslip({ name: "A", month: "March", year: 2026, gross: 1, net: 1 }))).toBe(2025);
  });

  it("formats a readable label", () => {
    expect(fyLabel(2025)).toBe("FY 2025-26");
    expect(fyLabel(2009)).toBe("FY 2009-10");
  });
});

describe("buildAnnualRegister", () => {
  const payslips: Payslip[] = [
    makePayslip({ name: "Asha", pan: "ABCDE1234F", month: "April", year: 2025, gross: 50000, net: 45000, pf: 1800, tds: 3200 }),
    makePayslip({ name: "Asha", pan: "ABCDE1234F", month: "May", year: 2025, gross: 50000, net: 45000, pf: 1800, tds: 3200 }),
    makePayslip({ name: "Ravi", pan: "ZZZZZ9999Z", month: "April", year: 2025, gross: 30000, net: 28000 }),
    // Belongs to the *previous* FY (Jan 2026 => FY 2025), so it joins Asha's FY.
    makePayslip({ name: "Asha", pan: "ABCDE1234F", month: "January", year: 2026, gross: 50000, net: 45000, pf: 1800, tds: 3200 }),
    // A different FY entirely.
    makePayslip({ name: "Asha", pan: "ABCDE1234F", month: "June", year: 2024, gross: 40000, net: 38000 }),
  ];

  it("aggregates per employee within one financial year", () => {
    const reg = buildAnnualRegister(payslips, 2025);
    expect(reg.label).toBe("FY 2025-26");
    expect(reg.rows).toHaveLength(2);

    const asha = reg.rows.find((r) => r.name === "Asha")!;
    expect(asha.months).toBe(3);
    expect(asha.gross).toBe(150000);
    expect(asha.tds).toBe(9600);
    expect(asha.net).toBe(135000);
  });

  it("groups by PAN even across the year boundary", () => {
    const reg = buildAnnualRegister(payslips, 2025);
    // The January-2026 slip rolled into the FY-2025 Asha row, not a new one.
    expect(reg.rows.filter((r) => r.name === "Asha")).toHaveLength(1);
  });

  it("computes company-wide totals", () => {
    const reg = buildAnnualRegister(payslips, 2025);
    expect(reg.totals.employees).toBe(2);
    expect(reg.totals.payslips).toBe(4);
    expect(reg.totals.gross).toBe(180000);
    expect(reg.totals.net).toBe(163000);
  });

  it("lists available financial years newest first", () => {
    expect(listFinancialYears(payslips)).toEqual([2025, 2024]);
  });

  it("exports CSV with a header and totals row", () => {
    const csv = registerToCSV(buildAnnualRegister(payslips, 2025));
    const lines = csv.split("\r\n");
    expect(lines[0]).toContain("Employee");
    expect(lines[0]).toContain("Net Pay");
    expect(lines[lines.length - 1]).toContain("TOTAL");
    expect(lines).toHaveLength(2 + 1 + 1); // header + 2 employees + total
  });
});
