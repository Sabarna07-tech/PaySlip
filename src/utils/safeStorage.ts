/**
 * Wraps chrome.storage.local writes so quota overflows (e.g. an oversized logo
 * plus a long history) surface as a clear, actionable error instead of failing
 * silently and losing the user's data.
 */
export async function safeSet(items: Record<string, unknown>): Promise<void> {
  try {
    await chrome.storage.local.set(items);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (/quota|exceeded|QUOTA_BYTES/i.test(msg)) {
      throw new Error(
        "Local storage is full. Remove the company logo or clear older payslip history, then try again."
      );
    }
    throw new Error("Could not save data locally. Please try again.");
  }
}
