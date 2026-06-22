/**
 * Central product/monetization configuration.
 *
 * Everything that changes when you set up your own paid store lives here, so
 * you never have to hunt through components. Replace the Lemon Squeezy URLs
 * with your own store + checkout links before publishing.
 */

/** Public Lemon Squeezy store landing page (shown on "Get a license key"). */
export const LS_STORE_URL = "https://payslip1.lemonsqueezy.com";

/**
 * Direct checkout URL for the Pro plan. If you have a specific product/variant
 * checkout link, paste it here; otherwise the store URL is used as a fallback.
 */
export const LS_CHECKOUT_URL = LS_STORE_URL;

/**
 * Public URL where the standalone web app (the `dist-web` build) is hosted.
 * Pro subscribers are pointed here for a full-screen workspace. Replace with
 * your deployed URL (Netlify, Vercel, GitHub Pages, your domain, etc.).
 */
export const WEB_APP_URL = "https://app.payslip.example";

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
