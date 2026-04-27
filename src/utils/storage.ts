import type { Payslip, Employee } from "@/types";

const STORAGE_KEY = "payslips";
const MAX_PAYSLIPS = 10;
const TEMPLATES_KEY = "templates";

export type EmployeeTemplate = { id: string; name: string; employee: Omit<Employee, "month" | "year"> }

/**
 * Saves a payslip to chrome.storage.local.
 * Keeps only the last 10 payslips, discarding the oldest.
 */
export async function savePayslip(p: Payslip): Promise<void> {
  const existing = await getPayslips();
  const updated = [p, ...existing].slice(0, MAX_PAYSLIPS);
  await chrome.storage.local.set({ [STORAGE_KEY]: updated });
}

/**
 * Returns all saved payslips sorted newest first.
 */
export async function getPayslips(): Promise<Payslip[]> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  const payslips: Payslip[] = result[STORAGE_KEY] ?? [];

  return payslips.sort(
    (a, b) =>
      new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
  );
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
