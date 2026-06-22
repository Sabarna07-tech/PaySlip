import type { Employee, Payslip, PayrollRules } from "@/types";
import { calculatePayslip } from "@/utils/payroll";
import { DEFAULT_PAYROLL_RULES } from "@/utils/settings";

/**
 * Fractional split of gross pay across the five standard components.
 * Fractions should sum to ~1; they are normalised defensively before use.
 */
export interface SalaryComposition {
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
}

export const DEFAULT_COMPOSITION: SalaryComposition = {
  basic: 0.5,
  hra: 0.2,
  conveyance: 0.05,
  medical: 0.05,
  special: 0.2,
};

export interface ReverseOptions {
  composition?: SalaryComposition;
  pfEmployer?: boolean;
  esiApplicable?: boolean;
  tds?: number;
  /** Optional employee metadata (name, month, year, etc.) carried into the result. */
  meta?: Partial<Employee>;
}

export interface ReverseResult {
  /** Gross pay that yields (as close as possible to) the requested net. */
  gross: number;
  /** Actual net produced by that gross — equals target when `exact`. */
  achievedNet: number;
  /** True when the achieved net matches the target within ₹1. */
  exact: boolean;
  /** A fully-formed payslip, ready to preview, save, or export to PDF. */
  payslip: Payslip;
}

function normalizeComposition(c: SalaryComposition): SalaryComposition {
  const sum = c.basic + c.hra + c.conveyance + c.medical + c.special;
  if (sum <= 0) return { ...DEFAULT_COMPOSITION };
  return {
    basic: c.basic / sum,
    hra: c.hra / sum,
    conveyance: c.conveyance / sum,
    medical: c.medical / sum,
    special: c.special / sum,
  };
}

function buildEmployee(gross: number, opts: Required<Pick<ReverseOptions, "composition" | "pfEmployer" | "esiApplicable" | "tds">>, meta: Partial<Employee>): Employee {
  const c = opts.composition;
  const now = new Date();
  return {
    name: "",
    customAllowances: [],
    basicSalary: Math.round(gross * c.basic),
    hra: Math.round(gross * c.hra),
    conveyance: Math.round(gross * c.conveyance),
    medical: Math.round(gross * c.medical),
    special: Math.round(gross * c.special),
    lta: 0,
    pfEmployer: opts.pfEmployer,
    esiApplicable: opts.esiApplicable,
    paidLeaves: 0,
    unpaidLeaves: 0,
    overtimeHours: 0,
    overtimeRate: 0,
    bonus: 0,
    tds: opts.tds,
    taxRegime: "new",
    month: MONTHS[now.getMonth()],
    year: now.getFullYear(),
    ...meta,
  };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/**
 * Inverse payroll: given a desired take-home (net) pay and a salary composition,
 * find the gross pay that produces it. Net pay is non-decreasing in gross (aside
 * from small statutory step changes), so a bounded binary search converges
 * reliably. The achieved net is reported honestly — statutory rounding/steps can
 * make some exact targets unreachable, in which case `exact` is false.
 */
export function solveGrossForNet(
  targetNet: number,
  opts: ReverseOptions = {},
  rules: PayrollRules = DEFAULT_PAYROLL_RULES
): ReverseResult {
  const resolved = {
    composition: normalizeComposition(opts.composition ?? DEFAULT_COMPOSITION),
    pfEmployer: opts.pfEmployer ?? false,
    esiApplicable: opts.esiApplicable ?? false,
    tds: Math.max(0, opts.tds ?? 0),
  };
  const meta = opts.meta ?? {};

  const target = Math.max(0, targetNet);
  const netAt = (gross: number) =>
    calculatePayslip(buildEmployee(gross, resolved, meta), rules).netPay;

  // Gross is always >= net. Find an upper bound where net >= target.
  let lo = target;
  let hi = Math.max(target * 1.5, target + 50000) + 1;
  let guard = 0;
  while (netAt(hi) < target && guard < 40) {
    hi *= 1.5;
    guard += 1;
  }

  // Binary search on gross.
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    if (netAt(mid) < target) {
      lo = mid;
    } else {
      hi = mid;
    }
  }

  const gross = Math.round(hi);
  const payslip = calculatePayslip(buildEmployee(gross, resolved, meta), rules);

  return {
    gross,
    achievedNet: payslip.netPay,
    exact: Math.abs(payslip.netPay - target) <= 1,
    payslip,
  };
}
