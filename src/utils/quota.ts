import { validateLicense, isPro } from "./license";
import { FREE_MONTHLY_LIMIT } from "@/config";

export interface QuotaStore {
  count: number;
  resetMonth: string;
}

const QUOTA_KEY = "quota";
export const FREE_LIMIT = FREE_MONTHLY_LIMIT;

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
  await incrementQuotaBy(1);
}

/** Adds `n` to the monthly usage counter (resetting first if the month rolled over). */
export async function incrementQuotaBy(n: number): Promise<void> {
  const quota = await getQuota();
  const currentMonth = getCurrentMonth();

  if (quota.resetMonth !== currentMonth) {
    quota.count = 0;
    quota.resetMonth = currentMonth;
  }

  quota.count += Math.max(0, n);
  await chrome.storage.local.set({ [QUOTA_KEY]: quota });
}

/** Free payslips still available this month (FREE_LIMIT when the month has rolled over). */
export async function getRemainingFree(): Promise<number> {
  const quota = await getQuota();
  const currentMonth = getCurrentMonth();
  if (quota.resetMonth !== currentMonth) return FREE_LIMIT;
  return Math.max(0, FREE_LIMIT - quota.count);
}

export interface QuotaDecision {
  allowed: boolean;
  pro: boolean;
  /** Free payslips remaining after this operation (Infinity for Pro). */
  remaining: number;
}

/**
 * Single gate for "may the user create `count` payslip(s) right now?". Pro users
 * are always allowed and never metered. For free users it checks the monthly
 * allowance and, when allowed, consumes it. Used by single calc, CSV import, and
 * batch pay runs so no path can silently bypass the freemium limit.
 *
 * Always re-checks the live license (not cached UI state) to avoid false paywalls.
 */
export async function consumeQuota(count: number): Promise<QuotaDecision> {
  if (await isPro()) {
    return { allowed: true, pro: true, remaining: Infinity };
  }

  const remaining = await getRemainingFree();
  if (count > remaining) {
    return { allowed: false, pro: false, remaining };
  }

  await incrementQuotaBy(count);
  return { allowed: true, pro: false, remaining: remaining - count };
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
