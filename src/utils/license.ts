import { getSettings } from "@/utils/settings";

const LICENSE_STATUS_KEY = "licenseStatus";

interface LicenseStatus {
  key: string;
  valid: boolean;
  checkedAt: number;
}

/**
 * Single source of truth for "does this user have PaySlip Pro?".
 * Reads the saved license key and validates it (cached for 24h). Every
 * Pro-gated feature should call this rather than re-checking the license.
 */
export async function isPro(): Promise<boolean> {
  const { licenseKey } = await getSettings();
  if (!licenseKey) return false;
  return validateLicense(licenseKey);
}

export async function validateLicense(key: string): Promise<boolean> {
  if (!key) return false;

  const result = await chrome.storage.local.get(LICENSE_STATUS_KEY);
  const cache: LicenseStatus | undefined = result[LICENSE_STATUS_KEY];

  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  if (cache && cache.key === key && (now - cache.checkedAt) < ONE_DAY) {
    return cache.valid;
  }

  try {
    const response = await fetch("https://api.lemonsqueezy.com/v1/licenses/validate", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ license_key: key }),
    });

    if (!response.ok) {
      return false;
    }

    const data = await response.json();
    const valid = data.valid === true;

    await chrome.storage.local.set({
      [LICENSE_STATUS_KEY]: {
        key,
        valid,
        checkedAt: now,
      },
    });

    return valid;
  } catch (error) {
    console.error("License validation error:", error);
    return false;
  }
}
