import type { Payslip } from "@/types";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Per-employee year-to-date totals across a financial year. */
export interface EmployeeYTD {
  name: string;
  pan: string;
  department: string;
  months: number;
  gross: number;
  pf: number;
  esi: number;
  tds: number;
  pt: number;
  unpaidLeave: number;
  deductions: number;
  net: number;
}

export interface AnnualRegister {
  /** Financial-year start year, e.g. 2025 for "FY 2025-26". */
  fyStart: number;
  label: string;
  rows: EmployeeYTD[];
  totals: {
    employees: number;
    payslips: number;
    gross: number;
    deductions: number;
    net: number;
  };
}

export function monthIndex(month: string): number {
  return MONTHS.indexOf(month);
}

/**
 * Indian financial year runs April–March. April–December belong to the FY that
 * starts in the same calendar year; January–March belong to the previous one.
 */
export function financialYearStart(p: Payslip): number {
  const idx = monthIndex(p.employee.month);
  // Unknown month names fall back to the calendar year to avoid losing data.
  if (idx < 0) return p.employee.year;
  return idx >= 3 ? p.employee.year : p.employee.year - 1;
}

export function fyLabel(fyStart: number): string {
  const end = (fyStart + 1) % 100;
  return `FY ${fyStart}-${end.toString().padStart(2, "0")}`;
}

/** Distinct financial years present in the payslips, most recent first. */
export function listFinancialYears(payslips: Payslip[]): number[] {
  const set = new Set<number>();
  for (const p of payslips) set.add(financialYearStart(p));
  return [...set].sort((a, b) => b - a);
}

function employeeKey(p: Payslip): string {
  const pan = (p.employee.pan || "").trim().toUpperCase();
  return pan ? `pan:${pan}` : `name:${p.employee.name.trim().toLowerCase()}`;
}

/**
 * Aggregates every payslip in a financial year into a per-employee register —
 * the backbone of year-end reports, audits, and Form-16 prep.
 */
export function buildAnnualRegister(payslips: Payslip[], fyStart: number): AnnualRegister {
  const inYear = payslips.filter((p) => financialYearStart(p) === fyStart);

  const groups = new Map<string, EmployeeYTD>();
  for (const p of inYear) {
    const key = employeeKey(p);
    const row =
      groups.get(key) ??
      {
        name: p.employee.name,
        pan: p.employee.pan || "",
        department: p.employee.department || "",
        months: 0,
        gross: 0,
        pf: 0,
        esi: 0,
        tds: 0,
        pt: 0,
        unpaidLeave: 0,
        deductions: 0,
        net: 0,
      };

    row.months += 1;
    row.gross += p.earnings.total;
    row.pf += p.deductions.pf;
    row.esi += p.deductions.esi;
    row.tds += p.deductions.tds;
    row.pt += p.deductions.pt;
    row.unpaidLeave += p.deductions.unpaidLeaveDeduction;
    row.deductions += p.deductions.total;
    row.net += p.netPay;
    // Keep the most recent department/pan seen.
    if (p.employee.department) row.department = p.employee.department;
    groups.set(key, row);
  }

  const rows = [...groups.values()].sort((a, b) => a.name.localeCompare(b.name));

  return {
    fyStart,
    label: fyLabel(fyStart),
    rows,
    totals: {
      employees: rows.length,
      payslips: inYear.length,
      gross: round2(rows.reduce((s, r) => s + r.gross, 0)),
      deductions: round2(rows.reduce((s, r) => s + r.deductions, 0)),
      net: round2(rows.reduce((s, r) => s + r.net, 0)),
    },
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function csvCell(value: string | number): string {
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/** Serialises a register to RFC-4180 CSV (salary register / payroll summary). */
export function registerToCSV(register: AnnualRegister): string {
  const header = [
    "Employee", "PAN", "Department", "Months",
    "Gross", "PF", "ESI", "TDS", "Prof. Tax", "Unpaid Leave",
    "Total Deductions", "Net Pay",
  ];

  const lines = [header.map(csvCell).join(",")];

  for (const r of register.rows) {
    lines.push(
      [
        r.name, r.pan, r.department, r.months,
        round2(r.gross), round2(r.pf), round2(r.esi), round2(r.tds),
        round2(r.pt), round2(r.unpaidLeave), round2(r.deductions), round2(r.net),
      ]
        .map(csvCell)
        .join(",")
    );
  }

  lines.push(
    ["TOTAL", "", "", register.totals.payslips, register.totals.gross, "", "", "", "", "", register.totals.deductions, register.totals.net]
      .map(csvCell)
      .join(",")
  );

  return lines.join("\r\n");
}
