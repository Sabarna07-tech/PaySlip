import type { Payslip } from "@/types";

const STORAGE_KEY = "payslips";
const MAX_PAYSLIPS = 10;

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
