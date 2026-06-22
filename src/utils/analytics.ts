import type { Payslip } from "@/types";
import { monthIndex } from "@/utils/reports";

export interface DeptStat {
  dept: string;
  net: number;
  count: number;
}

export interface TrendPoint {
  key: string; // sortable YYYYMM
  label: string; // e.g. "Apr 25"
  net: number;
  count: number;
}

export interface DashboardData {
  totalPayslips: number;
  totalNet: number;
  /** Distinct employees seen across history (by PAN, falling back to name). */
  distinctEmployees: number;
  latestPeriodLabel: string;
  latestPeriodNet: number;
  latestPeriodCount: number;
  deptSplit: DeptStat[];
  trend: TrendPoint[];
}

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function periodKey(p: Payslip): string {
  const idx = monthIndex(p.employee.month);
  const m = (idx >= 0 ? idx + 1 : 1).toString().padStart(2, "0");
  return `${p.employee.year}${m}`;
}

function periodLabel(key: string): string {
  const year = key.slice(0, 4);
  const month = Number(key.slice(4, 6)) - 1;
  return `${SHORT_MONTHS[month] ?? "?"} ${year.slice(2)}`;
}

function employeeId(p: Payslip): string {
  const pan = (p.employee.pan || "").trim().toUpperCase();
  return pan ? `pan:${pan}` : `name:${p.employee.name.trim().toLowerCase()}`;
}

/**
 * Aggregates payslip history into the headline metrics, department cost split,
 * and recent-period trend shown on the dashboard. Pure and deterministic.
 */
export function computeDashboard(payslips: Payslip[]): DashboardData {
  const totalNet = payslips.reduce((s, p) => s + p.netPay, 0);

  const employees = new Set(payslips.map(employeeId));

  // Department split (top 5 by net).
  const deptMap = new Map<string, DeptStat>();
  for (const p of payslips) {
    const dept = p.employee.department?.trim() || "Unassigned";
    const stat = deptMap.get(dept) ?? { dept, net: 0, count: 0 };
    stat.net += p.netPay;
    stat.count += 1;
    deptMap.set(dept, stat);
  }
  const deptSplit = [...deptMap.values()].sort((a, b) => b.net - a.net).slice(0, 5);

  // Trend by payroll period (last 6 periods, chronological).
  const trendMap = new Map<string, TrendPoint>();
  for (const p of payslips) {
    const key = periodKey(p);
    const point = trendMap.get(key) ?? { key, label: periodLabel(key), net: 0, count: 0 };
    point.net += p.netPay;
    point.count += 1;
    trendMap.set(key, point);
  }
  const trend = [...trendMap.values()].sort((a, b) => a.key.localeCompare(b.key)).slice(-6);

  const latest = trend[trend.length - 1];

  return {
    totalPayslips: payslips.length,
    totalNet,
    distinctEmployees: employees.size,
    latestPeriodLabel: latest?.label ?? "—",
    latestPeriodNet: latest?.net ?? 0,
    latestPeriodCount: latest?.count ?? 0,
    deptSplit,
    trend,
  };
}
