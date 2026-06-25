/**
 * Central product/monetization configuration.
 *
 * Everything that changes when you set up your own paid store lives here, so
 * you never have to hunt through components. Replace the Lemon Squeezy URLs
 * with your own store + checkout links before publishing.
 */

/**
 * Public Lemon Squeezy store landing page (shown on "Get a license key").
 *
 * ANTI-SHARING: license keys are bound to devices via Lemon Squeezy's activation
 * API. Set the per-key **activation limit** on your product in the Lemon Squeezy
 * dashboard (Products → your product → License keys → "Activation limit").
 * 2–3 is a good default — high enough to be forgiving of reinstalls, low enough
 * that a buyer can't share one key with the whole office. The app calls
 * /activate on first use and /validate thereafter; past the limit, new devices
 * are refused. Users can free a slot via Settings → "Deactivate this device".
 */
export const LS_STORE_URL = "https://payslip1.lemonsqueezy.com";

/**
 * Direct checkout URL for the Pro plan. If you have a specific product/variant
 * checkout link, paste it here; otherwise the store URL is used as a fallback.
 */
export const LS_CHECKOUT_URL = LS_STORE_URL;

/**
 * Public URL where the standalone web app + landing page (the `dist-web` build)
 * is hosted. The extension opens this on install (onboarding), and Pro users are
 * pointed here for a full-screen workspace. Replace with your deployed URL
 * (Netlify, Vercel, GitHub Pages, your domain, etc.).
 */
export const WEB_APP_URL = "https://app.payslip.example";

/**
 * Chrome Web Store listing URL — used by the landing page's "Add to Chrome"
 * button. Fill this in after the extension is published (the dashboard shows the
 * final item URL, e.g. https://chromewebstore.google.com/detail/<id>).
 */
export const CHROME_STORE_URL = "https://chromewebstore.google.com/detail/payslip";

/** Number of free payslips a user may generate per calendar month. */
export const FREE_MONTHLY_LIMIT = 3;

/** Human-readable price shown on the upgrade screen. */
export const PRO_PRICE_LABEL = "₹199/mo";

/** Short tagline used across the upgrade UI. */
export const PRO_TAGLINE =
  "Unlimited payslips, bulk export, annual reports, premium PDF themes & branding.";

/** The headline benefits listed on the paywall. Keep these in sync with what's gated. */
export const PRO_BENEFITS: string[] = [
  "Unlimited payslips every month",
  "Bulk export a whole month as a ZIP of PDFs",
  "Annual salary register & per-employee YTD reports",
  "Premium PDF themes + your company logo & branding",
];

export type PdfThemeId = "classic" | "monochrome" | "emerald";

export interface PdfThemeMeta {
  id: PdfThemeId;
  label: string;
  /** Whether this theme requires PaySlip Pro. */
  pro: boolean;
}

/** Selectable PDF payslip themes. The "classic" theme is always free. */
export const PDF_THEMES: PdfThemeMeta[] = [
  { id: "classic", label: "Classic (Indigo)", pro: false },
  { id: "monochrome", label: "Monochrome", pro: true },
  { id: "emerald", label: "Emerald", pro: true },
];
