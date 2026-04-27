import { validateLicense } from "./license";

export interface QuotaStore {
  count: number;
  resetMonth: string;
}

const QUOTA_KEY = "quota";
export const FREE_LIMIT = 2;

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, "0")}`;
}

export async function getQuota(): Promise<QuotaStore> {
  const result = await chrome.storage.local.get(QUOTA_KEY);
  const currentMonth = getCurrentMonth();
  return result[QUOTA_KEY] || { count: 0, resetMonth: currentMonth };
}

export async function incrementQuota(): Promise<void> {
  const quota = await getQuota();
  const currentMonth = getCurrentMonth();

  if (quota.resetMonth !== currentMonth) {
    quota.count = 0;
    quota.resetMonth = currentMonth;
  }

  quota.count += 1;
  await chrome.storage.local.set({ [QUOTA_KEY]: quota });
}

export async function isOverLimit(licenseKey: string): Promise<boolean> {
  if (licenseKey) {
    const isValid = await validateLicense(licenseKey);
    if (isValid) {
      return false; // Unlimited usage if license is valid
    }
  }

  const quota = await getQuota();
  const currentMonth = getCurrentMonth();

  // If the month has changed, they have full quota again (it will be reset on the next increment)
  if (quota.resetMonth !== currentMonth) {
    return false;
  }

  return quota.count >= FREE_LIMIT;
}
