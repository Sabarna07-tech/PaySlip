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
  const basic = emp.basicSalary || 0;
  const hra = emp.hra || 0;
  const conveyance = emp.conveyance || 0;
  const medical = emp.medical || 0;
  const special = emp.special || 0;
  const lta = emp.lta || 0;
  const customAllowancesTotal = (emp.customAllowances || []).reduce((acc, curr) => acc + curr.amount, 0);
  const overtimePay = (emp.overtimeHours || 0) * (emp.overtimeRate || 0);
  const bonus = emp.bonus || 0;

  const grossEarnings =
    basic + hra + conveyance + medical + special + lta + customAllowancesTotal + overtimePay + bonus;

  const earnings: Earnings = {
    basic,
    hra,
    conveyance,
    medical,
    special,
    lta,
    customAllowancesTotal,
    overtimePay,
    bonus,
    total: grossEarnings,
  };

  // ── Deductions ────────────────────────────────────────────
  const perDaySalary =
    (basic + hra + conveyance + medical + special) / WORKING_DAYS;
  const unpaidLeaveDeduction = perDaySalary * emp.unpaidLeaves;

  // Max basic wage for PF is ₹15,000
  const pfBasic = Math.min(basic, 15000);
  const pf = emp.pfEmployer ? Math.round(pfBasic * 0.12) : 0;

  // ESI: Employee share is 0.75%. (Note: Employer share is 3.25%).
  // Only deduct if gross earnings are <= ₹21,000.
  const esi =
    emp.esiApplicable && grossEarnings <= 21000
      ? Math.round(grossEarnings * 0.0075)
      : 0;
      
  const tds = emp.tds;
  
  // Professional Tax stub
  const pt = grossEarnings > 15000 ? 200 : 0;

  const totalDeductions = pf + esi + tds + pt + unpaidLeaveDeduction;

  const deductions: Deductions = {
    pf,
    esi,
    tds,
    pt,
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
