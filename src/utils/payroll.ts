import type { Employee, Earnings, Deductions, Payslip } from "@/types";

const WORKING_DAYS = 26;

/**
 * Formats a number as Indian Rupees with lakh/crore grouping.
 * e.g. 123456 → "₹1,23,456"
 */
export function formatINR(n: number): string {
  const formatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return formatter.format(n);
}

/**
 * Pure, synchronous payroll calculation.
 * Computes earnings, deductions, and net pay from an Employee record.
 */
export function calculatePayslip(emp: Employee): Payslip {
  // ── Earnings ──────────────────────────────────────────────
  const basic = emp.basicSalary;
  const hra = emp.hra;
  const conveyance = emp.conveyance;
  const medical = emp.medical;
  const special = emp.special;
  const overtimePay = emp.overtimeHours * emp.overtimeRate;
  const bonus = emp.bonus;

  const grossEarnings =
    basic + hra + conveyance + medical + special + overtimePay + bonus;

  const earnings: Earnings = {
    basic,
    hra,
    conveyance,
    medical,
    special,
    overtimePay,
    bonus,
    total: grossEarnings,
  };

  // ── Deductions ────────────────────────────────────────────
  const perDaySalary =
    (basic + hra + conveyance + medical + special) / WORKING_DAYS;
  const unpaidLeaveDeduction = perDaySalary * emp.unpaidLeaves;

  const pf = emp.pfEmployer ? Math.round(basic * 0.12) : 0;
  const esi =
    emp.esiApplicable && grossEarnings <= 21000
      ? Math.round(grossEarnings * 0.0075)
      : 0;
  const tds = emp.tds;

  const totalDeductions = pf + esi + tds + unpaidLeaveDeduction;

  const deductions: Deductions = {
    pf,
    esi,
    tds,
    unpaidLeaveDeduction,
    total: totalDeductions,
  };

  // ── Net Pay ───────────────────────────────────────────────
  const netPay = grossEarnings - totalDeductions;

  return {
    id: crypto.randomUUID(),
    employee: emp,
    earnings,
    deductions,
    netPay,
    generatedAt: new Date().toISOString(),
  };
}
