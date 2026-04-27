import type { Payslip, Employee } from "@/types";
import { DEFAULT_HISTORY_LIMIT } from "@/utils/settings";

const STORAGE_KEY = "payslips";
const TEMPLATES_KEY = "templates";

export type EmployeeTemplate = { id: string; name: string; employee: Omit<Employee, "month" | "year"> };
export interface BackupData {
  payslips: Payslip[];
  templates: EmployeeTemplate[];
}

function normalizeLimit(limit = DEFAULT_HISTORY_LIMIT): number {
  return Math.max(1, Math.floor(limit));
}

function sortPayslips(payslips: Payslip[]): Payslip[] {
  return [...payslips].sort(
    (a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
}

/**
 * Saves a payslip to chrome.storage.local.
 * Keeps only the latest payslips according to the configured history limit.
 */
export async function savePayslip(p: Payslip, limit = DEFAULT_HISTORY_LIMIT): Promise<void> {
  const existing = await getPayslips();
  const updated = sortPayslips([p, ...existing]).slice(0, normalizeLimit(limit));
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

export async function savePayslipsBatch(payslips: Payslip[], limit = DEFAULT_HISTORY_LIMIT): Promise<number> {
  if (payslips.length === 0) return 0;

  const existing = await getPayslips();
  const updated = sortPayslips([...payslips, ...existing]).slice(0, normalizeLimit(limit));
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
  return updated.length;
}

export async function replacePayslips(payslips: Payslip[], limit = DEFAULT_HISTORY_LIMIT): Promise<void> {
  await chrome.storage.local.set({
    [STORAGE_KEY]: sortPayslips(payslips).slice(0, normalizeLimit(limit)),
  });
}

/**
 * Returns all saved payslips sorted newest first.
 */
export async function getPayslips(): Promise<Payslip[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const payslips: Payslip[] = result[STORAGE_KEY] ?? [];

  return sortPayslips(payslips);
}

/**
 * Clears all saved payslips from storage.
 */
export async function clearPayslips(): Promise<void> {
  await chrome.storage.local.remove(STORAGE_KEY);
}

export async function saveTemplate(t: EmployeeTemplate): Promise<void> {
  const existing = await getTemplates();
  // Filter out the existing template with same ID if updating
  const updated = [...existing.filter(temp => temp.id !== t.id), t];
  await chrome.storage.local.set({ [TEMPLATES_KEY]: updated });
}

export async function getTemplates(): Promise<EmployeeTemplate[]> {
  const result = await chrome.storage.local.get(TEMPLATES_KEY);
  const templates: EmployeeTemplate[] = result[TEMPLATES_KEY] ?? [];
  return templates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function deleteTemplate(id: string): Promise<void> {
  const existing = await getTemplates();
  const updated = existing.filter(t => t.id !== id);
  await chrome.storage.local.set({ [TEMPLATES_KEY]: updated });
}

export async function clearTemplates(): Promise<void> {
  await chrome.storage.local.remove(TEMPLATES_KEY);
}

export async function exportBackupData(): Promise<BackupData> {
  const [payslips, templates] = await Promise.all([getPayslips(), getTemplates()]);
  return { payslips, templates };
}

export async function restoreBackupData(data: BackupData, limit = DEFAULT_HISTORY_LIMIT): Promise<void> {
  if (!Array.isArray(data.payslips) || !Array.isArray(data.templates)) {
    throw new Error("Backup must include payslips and templates arrays.");
  }

  await chrome.storage.local.set({
    [STORAGE_KEY]: sortPayslips(data.payslips).slice(0, normalizeLimit(limit)),
    [TEMPLATES_KEY]: data.templates,
  });
}
