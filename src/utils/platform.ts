/**
 * True when running as a real Chrome extension (popup), false in the standalone
 * web app. The dev/web storage polyfill never sets `chrome.runtime.id`, so this
 * reliably distinguishes the two targets regardless of build.
 */
export function isExtensionRuntime(): boolean {
  return (
    typeof chrome !== "undefined" &&
    !!(chrome as { runtime?: { id?: string } }).runtime &&
    !!(chrome as { runtime?: { id?: string } }).runtime!.id
  );
}

/** Opens a URL in a new tab, using the extension API when available. */
export function openExternal(url: string): void {
  if (isExtensionRuntime() && typeof chrome !== "undefined" && chrome.tabs?.create) {
    chrome.tabs.create({ url });
  } else {
    window.open(url, "_blank", "noopener");
  }
}
