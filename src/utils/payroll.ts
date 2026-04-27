import type { Employee, Earnings, Deductions, Payslip, PayrollRules } from "@/types";
import { DEFAULT_PAYROLL_RULES } from "@/utils/settings";

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
export function calculatePayslip(emp: Employee, rules: PayrollRules = DEFAULT_PAYROLL_RULES): Payslip {
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
    (basic + hra + conveyance + medical + special) / rules.workingDays;
  const unpaidLeaveDeduction = perDaySalary * emp.unpaidLeaves;

  const pfBasic = Math.min(basic, rules.pfBasicCeiling);
  const pf = emp.pfEmployer ? Math.round(pfBasic * rules.pfRate) : 0;

  const esi =
    emp.esiApplicable && grossEarnings <= rules.esiGrossThreshold
      ? Math.round(grossEarnings * rules.esiRate)
      : 0;
      
  const tds = emp.tds;
  
  const pt = grossEarnings > rules.professionalTaxThreshold ? rules.professionalTaxAmount : 0;

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
