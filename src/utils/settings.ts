export interface AppSettings {
  companyName: string;
  companyAddress: string;
  licenseKey: string;
  companyLogoBase64?: string;
}

const SETTINGS_KEY = "appSettings";

export async function getSettings(): Promise<AppSettings> {
  const result = await chrome.storage.local.get(SETTINGS_KEY);
  return result[SETTINGS_KEY] || { companyName: "", companyAddress: "", licenseKey: "", companyLogoBase64: "" };
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
}
