import type { Employee, Payslip, PayrollRules } from "@/types";
import { calculatePayslip } from "@/utils/payroll";

/** An employee record without a fixed pay period — i.e. a saved roster entry. */
export type RosterEmployee = Omit<Employee, "month" | "year">;

export interface PayRunSummary {
  count: number;
  gross: number;
  deductions: number;
  net: number;
}

/**
 * Runs payroll for a set of roster employees against a single pay period,
 * producing one payslip each. Pure: the same inputs always yield the same
 * payslips (modulo their random ids / timestamps).
 */
export function runPayroll(
  employees: RosterEmployee[],
  month: string,
  year: number,
  rules: PayrollRules
): Payslip[] {
  return employees.map((e) => calculatePayslip({ ...e, month, year } as Employee, rules));
}

export function summarizePayRun(payslips: Payslip[]): PayRunSummary {
  return payslips.reduce<PayRunSummary>(
    (acc, p) => ({
      count: acc.count + 1,
      gross: acc.gross + p.earnings.total,
      deductions: acc.deductions + p.deductions.total,
      net: acc.net + p.netPay,
    }),
    { count: 0, gross: 0, deductions: 0, net: 0 }
  );
}
