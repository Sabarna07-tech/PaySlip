import { WEB_APP_URL } from "@/config";

/**
 * Extension service worker. On first install, open the hosted landing page so
 * new users get onboarding + a pointer to the full web workspace. We only do
 * this on "install" (not on every update) to avoid being noisy.
 */
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    chrome.tabs.create({ url: WEB_APP_URL }).catch(() => {
      /* ignore — opening the welcome tab is best-effort */
    });
  }
});
