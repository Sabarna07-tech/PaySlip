import { getSettings } from "@/utils/settings";

const LICENSE_STATUS_KEY = "licenseStatus";
const INSTANCE_KEY = "licenseInstance";
const ONE_DAY = 24 * 60 * 60 * 1000;
const LS_API = "https://api.lemonsqueezy.com/v1/licenses";

interface LicenseStatus {
  key: string;
  valid: boolean;
  checkedAt: number;
}

interface LicenseInstance {
  key: string;
  instanceId: string;
}

export interface LicenseResult {
  ok: boolean;
  error?: string;
}

async function getInstance(): Promise<LicenseInstance | undefined> {
  const r = await chrome.storage.local.get(INSTANCE_KEY);
  return r[INSTANCE_KEY] as LicenseInstance | undefined;
}

async function getCache(): Promise<LicenseStatus | undefined> {
  const r = await chrome.storage.local.get(LICENSE_STATUS_KEY);
  return r[LICENSE_STATUS_KEY] as LicenseStatus | undefined;
}

async function setCache(key: string, valid: boolean): Promise<void> {
  await chrome.storage.local.set({
    [LICENSE_STATUS_KEY]: { key, valid, checkedAt: Date.now() } satisfies LicenseStatus,
  });
}

/**
 * Activates a license on THIS device/install, consuming one activation slot.
 * The product's **activation limit** in Lemon Squeezy (set in the dashboard,
 * e.g. 2–3) caps how many devices a single key can run on — this is what stops
 * a buyer from sharing one key with the whole office.
 */
export async function activateLicense(key: string): Promise<LicenseResult> {
  if (!key) return { ok: false, error: "Enter a license key." };
  try {
    const res = await fetch(`${LS_API}/activate`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        license_key: key,
        instance_name: `PaySlip on ${navigator.platform || "browser"}`,
      }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));

    if (res.ok && data.activated && (data.instance as { id?: string } | undefined)?.id) {
      const instanceId = String((data.instance as { id: string }).id);
      await chrome.storage.local.set({ [INSTANCE_KEY]: { key, instanceId } satisfies LicenseInstance });
      await setCache(key, true);
      return { ok: true };
    }

    return {
      ok: false,
      error:
        (data.error as string) ||
        "Activation failed — the key may be invalid or has reached its device limit.",
    };
  } catch {
    return { ok: false, error: "Network error during activation. Please try again." };
  }
}

/**
 * Validates the license for THIS device (cached 24h). A key that was never
 * activated on this device is treated as invalid, so a shared key only works on
 * the limited number of devices where it has actually been activated.
 */
export async function validateLicense(key: string): Promise<boolean> {
  if (!key) return false;

  const cache = await getCache();
  if (cache && cache.key === key && Date.now() - cache.checkedAt < ONE_DAY) {
    return cache.valid;
  }

  const instance = await getInstance();
  if (!instance || instance.key !== key) {
    // Not activated on this device yet — force the user through activation.
    return false;
  }

  try {
    const res = await fetch(`${LS_API}/validate`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ license_key: key, instance_id: instance.instanceId }),
    });
    const data = await res.json().catch(() => ({} as Record<string, unknown>));
    const valid = res.ok && data.valid === true;
    await setCache(key, valid);
    return valid;
  } catch {
    // Offline: fall back to the last known state so paying users aren't locked out.
    return cache?.key === key ? cache.valid : false;
  }
}

/**
 * Used by the "Activate"/"Verify" buttons: activates this device the first time
 * a key is entered, and simply re-validates on subsequent checks (so it never
 * burns a second activation slot for the same device).
 */
export async function activateOrValidate(key: string): Promise<LicenseResult> {
  if (!key) return { ok: false, error: "Enter a license key." };
  const instance = await getInstance();
  if (instance && instance.key === key) {
    const valid = await validateLicense(key);
    return valid ? { ok: true } : { ok: false, error: "This license is no longer active on this device." };
  }
  return activateLicense(key);
}

/** Releases this device's activation slot so the key can be moved to another device. */
export async function deactivateLicense(): Promise<void> {
  const instance = await getInstance();
  if (instance) {
    try {
      await fetch(`${LS_API}/deactivate`, {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({ license_key: instance.key, instance_id: instance.instanceId }),
      });
    } catch {
      /* best-effort: still clear locally below */
    }
  }
  await chrome.storage.local.remove([INSTANCE_KEY, LICENSE_STATUS_KEY]);
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
