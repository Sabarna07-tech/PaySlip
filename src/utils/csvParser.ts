import Papa from "papaparse";
import { calculatePayslip } from "./payroll";
import { savePayslipsBatch } from "./storage";
import type { Employee, PayrollRules, Payslip } from "@/types";
import { DEFAULT_PAYROLL_RULES } from "@/utils/settings";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const REQUIRED_HEADERS = ["name", "basic", "hra", "conveyance", "pan", "department"];

export interface CsvImportRow {
  rowNumber: number;
  employee: Employee;
  payslip: Payslip;
}

export interface CsvImportError {
  rowNumber: number;
  message: string;
}

export interface CsvImportPreview {
  rows: CsvImportRow[];
  errors: CsvImportError[];
  totalRows: number;
}

function parseNumber(value: unknown, field: string, rowNumber: number, errors: CsvImportError[]): number {
  const raw = String(value ?? "").trim();
  if (!raw) return 0;

  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) {
    errors.push({ rowNumber, message: `${field} must be a non-negative number.` });
    return 0;
  }

  return parsed;
}

function normalizeHeader(header: string): string {
  return header.replace(/^\uFEFF/, "").trim().toLowerCase();
}

function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => resolve(String(event.target?.result ?? ""));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsText(file);
  });
}

export async function previewCSV(
  file: File,
  rules: PayrollRules = DEFAULT_PAYROLL_RULES
): Promise<CsvImportPreview> {
  const text = await readFileAsText(file);
  const parsed = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: normalizeHeader,
  });

  const errors: CsvImportError[] = parsed.errors.map((error) => ({
    rowNumber: (error.row ?? 0) + 2,
    message: error.message,
  }));

  const headers = parsed.meta.fields ?? [];
  for (const header of REQUIRED_HEADERS) {
    if (!headers.includes(header)) {
      errors.push({ rowNumber: 1, message: `Missing required column: ${header}` });
    }
  }

  if (errors.some((error) => error.rowNumber === 1)) {
    return { rows: [], errors, totalRows: parsed.data.length };
  }

  const now = new Date();
  const rows: CsvImportRow[] = [];

  parsed.data.forEach((record, index) => {
    const rowNumber = index + 2;
    const rowErrors: CsvImportError[] = [];
    const name = String(record.name ?? "").trim();

    if (!name) {
      rowErrors.push({ rowNumber, message: "Name is required." });
    }

    const emp: Employee = {
      name,
      basicSalary: parseNumber(record.basic, "Basic", rowNumber, rowErrors),
      hra: parseNumber(record.hra, "HRA", rowNumber, rowErrors),
      conveyance: parseNumber(record.conveyance, "Conveyance", rowNumber, rowErrors),
      pan: String(record.pan ?? "").trim(),
      department: String(record.department ?? "").trim(),
      medical: parseNumber(record.medical, "Medical", rowNumber, rowErrors),
      special: parseNumber(record.special, "Special", rowNumber, rowErrors),
      lta: parseNumber(record.lta, "LTA", rowNumber, rowErrors),
      pfEmployer: String(record.pf ?? "").trim().toLowerCase() === "true",
      esiApplicable: String(record.esi ?? "").trim().toLowerCase() === "true",
      paidLeaves: parseNumber(record.paidleaves, "Paid Leaves", rowNumber, rowErrors),
      unpaidLeaves: parseNumber(record.unpaidleaves, "Unpaid Leaves", rowNumber, rowErrors),
      overtimeHours: parseNumber(record.overtimehours, "Overtime Hours", rowNumber, rowErrors),
      overtimeRate: parseNumber(record.overtimerate, "Overtime Rate", rowNumber, rowErrors),
      bonus: parseNumber(record.bonus, "Bonus", rowNumber, rowErrors),
      tds: parseNumber(record.tds, "TDS", rowNumber, rowErrors),
      month: String(record.month ?? "").trim() || MONTHS[now.getMonth()],
      year: parseNumber(record.year, "Year", rowNumber, rowErrors) || now.getFullYear(),
      taxRegime: String(record.taxregime ?? "new").trim().toLowerCase() === "old" ? "old" : "new",
    };

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
      return;
    }

    rows.push({
      rowNumber,
      employee: emp,
      payslip: calculatePayslip(emp, rules),
    });
  });

  return { rows, errors, totalRows: parsed.data.length };
}

export async function commitCSVPreview(
  preview: CsvImportPreview,
  historyLimit: number
): Promise<number> {
  const payslips = preview.rows.map((row) => row.payslip);
  await savePayslipsBatch(payslips, historyLimit);
  return payslips.length;
}

export async function processCSV(file: File, historyLimit: number, rules: PayrollRules): Promise<number> {
  const preview = await previewCSV(file, rules);
  if (preview.errors.length > 0) {
    throw new Error(preview.errors.map((error) => `Row ${error.rowNumber}: ${error.message}`).join("\n"));
  }
  return commitCSVPreview(preview, historyLimit);
}
