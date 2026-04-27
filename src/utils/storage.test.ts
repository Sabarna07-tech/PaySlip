import { describe, expect, it } from "vitest";
import type { Employee, Payslip } from "@/types";
import { getPayslips, savePayslip, savePayslipsBatch } from "./storage";
import { calculatePayslip } from "./payroll";

function employee(name: string): Employee {
  return {
    name,
    basicSalary: 1000,
    hra: 0,
    conveyance: 0,
    medical: 0,
    special: 0,
    pfEmployer: false,
    esiApplicable: false,
    paidLeaves: 0,
    unpaidLeaves: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    bonus: 0,
    tds: 0,
    month: "April",
    year: 2026,
  };
}

function payslip(name: string, generatedAt: string): Payslip {
  return {
    ...calculatePayslip(employee(name)),
    generatedAt,
  };
}

describe("storage", () => {
  it("trims saved payslips to the configured limit", async () => {
    await savePayslip(payslip("old", "2026-04-01T00:00:00.000Z"), 2);
    await savePayslip(payslip("middle", "2026-04-02T00:00:00.000Z"), 2);
    await savePayslip(payslip("new", "2026-04-03T00:00:00.000Z"), 2);

    const saved = await getPayslips();
    expect(saved.map((item) => item.employee.name)).toEqual(["new", "middle"]);
  });

  it("saves imported batches atomically before trimming", async () => {
    await savePayslipsBatch([
      payslip("one", "2026-04-01T00:00:00.000Z"),
      payslip("two", "2026-04-02T00:00:00.000Z"),
      payslip("three", "2026-04-03T00:00:00.000Z"),
    ], 3);

    const saved = await getPayslips();
    expect(saved.map((item) => item.employee.name)).toEqual(["three", "two", "one"]);
  });
});
