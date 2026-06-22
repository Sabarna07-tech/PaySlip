import type { PayrollRules } from "@/types";
import type { PdfThemeId } from "@/config";
import { safeSet } from "@/utils/safeStorage";

export const DEFAULT_PAYROLL_RULES: PayrollRules = {
  workingDays: 26,
  pfBasicCeiling: 15000,
  pfRate: 0.12,
  esiGrossThreshold: 21000,
  esiRate: 0.0075,
  professionalTaxThreshold: 15000,
  professionalTaxAmount: 200,
  taxYear: "FY 2024-25 / AY 2025-26",
};

export const DEFAULT_HISTORY_LIMIT = 50;

export interface AppSettings {
  companyName: string;
  companyAddress: string;
  licenseKey: string;
  companyLogoBase64?: string;
  historyLimit: number;
  payrollRules: PayrollRules;
  pdfTheme: PdfThemeId;
}

const SETTINGS_KEY = "appSettings";

export function normalizeSettings(settings?: Partial<AppSettings>): AppSettings {
  return {
    companyName: settings?.companyName ?? "",
    companyAddress: settings?.companyAddress ?? "",
    licenseKey: settings?.licenseKey ?? "",
    companyLogoBase64: settings?.companyLogoBase64 ?? "",
    historyLimit: Math.max(1, Math.floor(settings?.historyLimit ?? DEFAULT_HISTORY_LIMIT)),
    payrollRules: {
      ...DEFAULT_PAYROLL_RULES,
      ...(settings?.payrollRules ?? {}),
    },
    pdfTheme: settings?.pdfTheme ?? "classic",
  };
}

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return normalizeSettings(result[SETTINGS_KEY]);
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await safeSet({ [SETTINGS_KEY]: normalizeSettings(settings) });
}
