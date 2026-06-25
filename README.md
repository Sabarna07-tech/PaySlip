# PaySlip — Indian Payroll & Salary Slip Calculator

Instant salary calculator with professional PDF payslips, built for Indian small businesses, HR teams, accountants, and freelancers. A lightweight, **local-first** Chrome Extension built with React 18, TypeScript, Tailwind CSS, and Vite (Manifest V3).

> Ready to ship to the Chrome Web Store. See **[STORE_LISTING.md](STORE_LISTING.md)** for the complete listing copy, privacy disclosures, screenshot plan, and monetization setup.

## ✨ Features

### Payroll Engine
- **Comprehensive Payroll Math**: Calculates Gross Earnings and Net Pay from Basic Salary, HRA, Conveyance, Medical, Special Allowance, LTA, Custom Allowances, Overtime, and Bonuses.
- **Configurable Payroll Rules**: Working days, PF ceiling & rate, ESI threshold & rate, PT threshold & amount, and Tax Year label are all user-editable from the Settings panel.
- **Statutory Deductions**: PF (default 12% of Basic, capped at configurable ceiling), ESI (default 0.75% if Gross ≤ configurable threshold), Professional Tax (configurable flat amount if Gross > threshold), TDS, and pro-rata unpaid leave deductions.
- **Auto-Calculate TDS**: One-click TDS estimation engine aligned with the 2025/2026 Indian tax slabs for both Old and New Tax Regimes, including Section 87A rebates and 4% Health & Education Cess.
- **Net → Gross Reverse Calculator**: Enter the take-home (net) pay you want an employee to receive and PaySlip works backwards to the required gross salary and full component breakdown — using a bounded binary search over the live payroll engine, with an editable salary structure.
- **Strict Input Validation**: No leading zeros, no negative values — all numeric fields are sanitized at entry.

### Payroll Suite
- **Dashboard (Home)**: At-a-glance KPIs — distinct employees, total payslips, total disbursed, latest-period net — plus a 6-period payroll trend chart and a cost-by-department breakdown, all computed from local history.
- **Team Directory**: A first-class employee roster with add / edit / delete, format-validated identity fields (PAN, UAN), a live monthly-net estimate, and custom allowances per employee.
- **Pay Run (batch payroll)**: Pick a month, select employees, and generate every payslip in one click. Saves to history, shows a run summary (gross / deductions / net payout), and offers a one-click ZIP of all PDFs (Pro). Respects the free monthly quota; Pro unlocks unlimited runs.

### Employee Data
- **Enterprise Data Model**: Supports PAN, UAN, Department, Designation, Bank Account, LTA, and Tax Regime fields per employee.
- **Custom Allowances**: Add, edit, and remove any number of custom allowance line items right in the calculator and the Team editor — rendered on the in-app breakdown and the PDF.
- **Field Validation**: Non-blocking format hints for PAN (`ABCDE1234F`), UAN (12 digits), and IFSC keep payroll data clean without getting in the way.
- **Employee Templates**: Save and load complete employee configurations with a single click (the same store powers the Team directory).

### Output & Sharing
- **Professional PDF Generation**: Clean A4 portrait PDF payslips with a two-column employee metadata grid (Name, Designation, Department, Bank A/C, Period, PAN, UAN).
- **Multiple PDF Themes (Pro)**: Choose Classic (Indigo), Monochrome, or Emerald payslip themes. The free Classic theme is always available; premium themes unlock with Pro.
- **Company Branding (Pro)**: Upload a company logo (PNG/JPEG/WebP, ≤ 300 KB, ≤ 1024×1024 px) and set Company Name & Address — all rendered on the PDF header.
- **Bulk ZIP Export (Pro)**: Render every payslip in the current view (respects the history search filter) to PDFs and download them as one ZIP archive, with collision-safe filenames.
- **Copy Summary**: One-click copy of a plain-text payslip summary to the clipboard for quick sharing in chat or email.
- **Dynamic Allowances in PDF**: Custom allowances are automatically listed as individual rows in the Earnings column.
- **Lazy-loaded PDF**: `jspdf` is dynamically imported only when the user downloads, keeping the popup bundle lean.

### Reports
- **Annual Salary Register (Pro)**: Aggregates all payslips by Indian financial year (April–March) into a per-employee register — months paid, gross, PF, ESI, TDS, PT, total deductions, and net.
- **Year-to-Date Per Employee**: Employees are grouped by PAN (falling back to name) so records roll up correctly across the Jan–Mar year boundary.
- **Export to CSV & PDF**: Download the register as RFC-4180 CSV (for accountants/Excel) or as a clean landscape A4 PDF.

### Data Management
- **History Panel**: Searchable by name, department, or month. Grouped by month/year with a mini-dashboard showing Total Payslips and Total Net Pay Disbursed.
- **Configurable History Limit**: Set the maximum number of payslips stored locally (default: 50). Oldest entries are trimmed automatically.
- **Bulk CSV Import**: Upload a `.csv` (required columns: Name, Basic, HRA, Conveyance, PAN, Department; optional: Medical, Special, LTA, PF, ESI, Bonus, TDS, Month, Year, TaxRegime). Features a **preview → confirm** workflow with row-level validation and error reporting. Powered by PapaParse for robust RFC 4180 compliance.
- **JSON Data Export & Restore**: Export all payslips and templates as a timestamped JSON backup, or restore from a previously exported JSON file.
- **Clear Data**: One-click buttons to clear payslip history or templates independently.

### Monetization
- **Freemium Quota**: 3 free payslips per month, auto-resets monthly (configurable in [`src/config.ts`](src/config.ts)).
- **PaySlip Pro**: Lemon Squeezy license key integration. Pro unlocks unlimited payslips, bulk ZIP export, annual reports, premium PDF themes, and company branding. 24-hour validation caching via a single `isPro()` gate.
- **Centralized Config**: Pricing labels, free-tier limit, Lemon Squeezy store/checkout URLs, and Pro benefit copy all live in [`src/config.ts`](src/config.ts) — no hunting through components.
- **Local-first Privacy**: All payroll data stays in your browser. Every PDF/ZIP/CSV/JSON export is generated on-device. The only external request is license key verification.

### Security
- **Strict MV3 Content Security Policy**: `script-src 'self'; object-src 'self'; base-uri 'self'` — no remote code, no inline scripts.
- **Minimal permissions**: only `storage` plus a single host permission for license validation. No `tabs` content access, no content scripts, no `scripting`.
- **Safe storage writes**: storage-quota overflows (e.g. an oversized logo) surface a clear, actionable error instead of silently dropping data.
- **Input hygiene**: free-text fields are length-capped before persistence; numeric fields reject negatives and leading zeros.

---

## Architecture

```
src/
├── config.ts                   # Pricing, free limit, store URLs, Pro benefits, PDF themes
├── types.ts                    # Employee, Payslip, Earnings, Deductions, PayrollRules
├── popup/
│   ├── main.tsx                # Entry point + chrome.storage.local dev polyfill
│   ├── App.tsx                 # Tab router + Standard/Net→Gross mode toggle
│   ├── UpgradeContext.tsx      # App-wide paywall provider (useUpgrade)
│   ├── usePro.ts               # Reactive Pro-status hook
│   └── components/
│       ├── Dashboard.tsx         # Home: KPIs, payroll trend, dept cost split
│       ├── EmployeeForm.tsx      # Data entry + custom-allowance editor
│       ├── ReverseCalculator.tsx # Net → Gross solver UI
│       ├── SalaryBreakdown.tsx   # Payslip result view + copy summary
│       ├── TeamPanel.tsx         # Employee directory + batch Pay Run
│       ├── EmployeeEditor.tsx    # Roster employee add/edit with validation
│       ├── HistoryPanel.tsx      # Searchable history + bulk ZIP + reports entry
│       ├── AnnualReport.tsx      # Salary register view + CSV/PDF export
│       ├── BulkImport.tsx        # CSV preview → commit UI
│       ├── SettingsPanel.tsx     # Branding, PDF theme, license, rules, data mgmt
│       └── UpgradeModal.tsx      # Freemium paywall
└── utils/
    ├── payroll.ts              # Pure payroll calculation engine
    ├── reverseCalc.ts          # Net → Gross binary-search solver (pure)
    ├── payRun.ts               # Batch payroll engine + run summary (pure)
    ├── analytics.ts            # Dashboard KPIs / trend / dept split (pure)
    ├── reports.ts              # Annual salary register + CSV (pure)
    ├── validation.ts           # PAN / IFSC / UAN / email validators (pure)
    ├── taxCalculator.ts        # TDS estimation (Old + New regime)
    ├── pdfGenerator.ts         # jsPDF payslip generation, themes, Pro gating
    ├── registerPdf.ts          # Landscape salary-register PDF
    ├── bulkExport.ts           # Multi-payslip → ZIP of PDFs (jszip)
    ├── download.ts             # Shared blob/text download helpers
    ├── safeStorage.ts          # Quota-aware chrome.storage.local writes
    ├── csvParser.ts            # PapaParse-based CSV parser with preview
    ├── storage.ts              # chrome.storage.local CRUD + backup/restore
    ├── settings.ts             # AppSettings + PayrollRules + PDF theme
    ├── license.ts              # Lemon Squeezy validation + isPro() gate
    └── quota.ts                # Monthly usage tracking + batch helpers
```

---

## Local Development Setup

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9

### 1. Install dependencies

```bash
npm install
```

### 2. Generate extension icons

```bash
node generate-icons.cjs
```

This creates `icons/icon-16.png`, `icons/icon-48.png`, and `icons/icon-128.png` from the inline SVG.

### 3. Build the extension

```bash
npm run build
```

The production bundle is output to the `dist/` directory.

### 4. Load in Chrome

1. Open `chrome://extensions` in your browser.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** and select the `dist/` folder.
4. The PaySlip icon (₹) should appear in your toolbar.

### Development mode

For hot-reload during development:

```bash
npm run dev
```

Then load the generated dev output folder as an unpacked extension. Changes will auto-rebuild. A `chrome.storage.local` polyfill in `main.tsx` allows testing in a regular browser tab at `http://localhost:5173/popup.html`.

---

## Standalone Web App

PaySlip ships in **two flavours from one codebase**: the Chrome extension and a standalone web app. The app detects at runtime whether it's running inside the extension; if not, it renders a **landing page** first and then a full-screen sidebar layout (instead of the compact popup).

**Flow:**
- Visiting the hosted URL shows the **landing page** → "Launch app" enters the workspace (remembered in `localStorage`); "Add to Chrome" → your store listing (`CHROME_STORE_URL`).
- **Installing the extension** opens the landing page automatically (onboarding) via the background service worker.
- Pro users also get an "Open the full web workspace" card on the extension's Home tab (→ `WEB_APP_URL`).

Set `WEB_APP_URL` and `CHROME_STORE_URL` in [`src/config.ts`](src/config.ts) to your deployed web URL and Chrome Web Store listing.

```bash
npm run dev:web        # web app dev server (http://localhost:5174)
npm run build:web      # production web build → dist-web/
npm run preview:web    # preview the production web build
npm run build:all      # build BOTH the extension (dist/) and the web app (dist-web/)
```

Deploy `dist-web/` to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, your own server) and set `WEB_APP_URL` to that address before building the extension.

> **Data note:** the extension stores data in `chrome.storage.local`; the web app uses the browser's `localStorage`. They are independent — use **Settings → Export/Restore JSON** to move data between them.

---

## Chrome Web Store Submission

The complete, paste-ready listing copy, privacy disclosures, permission justifications, screenshot plan, and Lemon Squeezy monetization steps live in **[STORE_LISTING.md](STORE_LISTING.md)**.

### 1. Prepare the package

```bash
npm run preflight   # audit (prod) + tests + typecheck + build + zip
```

This produces `payslip-v1.2.0.zip` (the zip name tracks `package.json` version automatically). Upload it on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

> Before building, open [`src/config.ts`](src/config.ts) and replace the placeholder Lemon Squeezy `LS_STORE_URL` / `LS_CHECKOUT_URL` with your own store links.

### 2. Listing fields, privacy & assets

All store-listing fields (name, summary, full description), the single-purpose statement, privacy disclosures, permission justifications, and the screenshot/promo-tile plan are in **[STORE_LISTING.md](STORE_LISTING.md)**. Host `public/privacy.html` at a public URL and paste it into the dashboard's Privacy policy field (required even though no data is collected).

---

## Changelog

### v1.4.1 (2026-06-25)
- **Landing page + onboarding**: the web app root is now a marketing landing page ([Landing.tsx](src/popup/components/Landing.tsx)) — hero, feature grid, free-vs-pro, and "Add to Chrome" / "Launch app" CTAs. Clicking Launch enters the workspace (remembered via `localStorage`). A new **background service worker** ([background.ts](src/background.ts)) opens this landing page automatically when the extension is first installed. No new permissions (`chrome.tabs.create` with a URL needs none).
- **Anti-sharing licensing**: keys are now bound to devices via Lemon Squeezy's activation API (`activate`/`validate`/`deactivate`). A per-key **activation limit** (set on the product, 2–3 recommended) caps how many devices one key works on; Settings has a "Deactivate this device" control to move a key. ([license.ts](src/utils/license.ts))
- **Modern web UI**: replaced emoji nav icons with a clean inline SVG icon set ([icons.tsx](src/popup/components/icons.tsx)); redesigned the web app shell (branded sidebar, Pro upsell, responsive top-nav on mobile, footer); modernized the dashboard (icon KPI cards, refined trend/department cards, a proper empty state).
- **Tests**: 46 total (added activation-flow + landing/app render coverage).

### v1.4.0 (2026-06-22)
- **Standalone web app**: same codebase now builds a full-screen web app (`dist-web/`) with a sidebar layout, alongside the extension. Runtime platform detection ([`platform.ts`](src/utils/platform.ts)) switches layouts automatically. Pro users get an "Open the full web workspace" link in the extension.
- **Bug fix — freemium bypass**: CSV bulk import previously skipped the monthly quota entirely (free users could import unlimited payslips). All creation paths (single calc, CSV import, batch pay run) now flow through one `consumeQuota()` gate that re-checks the live license.
- **Bug fix — broken ₹ in PDFs**: jsPDF's built-in Helvetica has no rupee glyph, so every generated PDF rendered ₹ as a blank box. PDFs now use a `Rs.` prefix with Indian digit grouping (`formatINRPlain`); the on-screen UI keeps ₹.
- **Bug fix — Pro paywall race**: gated actions (bulk ZIP, reports, pay-run downloads) now check the live license at click time instead of cached UI state, preventing false paywalls.
- **Hardening**: Pro users are no longer metered against the free quota; dev storage polyfill now supports `remove()`.
- **Tests**: suite expanded to 42 (added quota-gate, PDF-currency, and a full-app render smoke test).

### v1.3.0 (2026-06-22)
- **Dashboard (Home tab)**: KPI cards, a 6-period payroll trend chart, and a cost-by-department breakdown, computed by a new pure `analytics.ts`.
- **Team directory + Pay Run**: First-class employee roster (`TeamPanel`, `EmployeeEditor`) and one-click batch payroll for a whole month via a new pure `payRun.ts` engine, with a run summary and Pro ZIP export. Quota-aware (`incrementQuotaBy`, `getRemainingFree`).
- **Custom allowances editor**: The previously un-editable `customAllowances` field now has full add/edit/remove UI in the calculator and Team editor; LTA + custom allowances now also show on the in-app breakdown (display-bug fix).
- **Security hardening**: strict MV3 Content Security Policy; new `validation.ts` (PAN/IFSC/UAN/email) with non-blocking hints; quota-aware `safeStorage.ts` writes; length-capped text fields.
- **Accessibility/UI**: tab bar rebuilt as real `<button>`s with `role="tab"`, `aria-selected`, and focus-visible rings; stacked icon+label layout for six sections.
- **Tests**: suite expanded from 23 to 36 (validation, analytics, pay-run coverage).

### v1.2.0 (2026-06-22)
- **Net → Gross Reverse Calculator**: New calculator mode that solves for the gross salary (and full breakdown) needed to hit a desired take-home pay, using a bounded binary search over the payroll engine with an editable salary structure. Pure, unit-tested (`reverseCalc.ts`).
- **Bulk ZIP Export (Pro)**: Export every payslip in the current history view to PDFs bundled in a single ZIP (`bulkExport.ts`, powered by `jszip`), with collision-safe filenames.
- **Annual Salary Register & YTD Reports (Pro)**: Aggregate payslips by Indian financial year (April–March) per employee (grouped by PAN); export to RFC-4180 CSV or a landscape A4 PDF register. Pure, unit-tested (`reports.ts`, `registerPdf.ts`).
- **Multiple PDF Themes (Pro)**: Classic / Monochrome / Emerald payslip themes selectable in Settings; the PDF generator was refactored into a reusable `buildPayslipDoc()` with Pro-gated themes and logo branding.
- **Copy Summary**: One-click clipboard copy of a payslip text summary from the breakdown view.
- **Centralized Config & Pro Gating**: New `src/config.ts` (pricing, free-tier limit, store URLs, Pro benefits, themes) and a single `isPro()` gate; app-wide paywall via `UpgradeContext` + `usePro` hook. Free tier raised to 3 payslips/month.
- **Store readiness**: Versions aligned to 1.2.0; SEO-tuned manifest name/description + `minimum_chrome_version`; privacy policy updated; new `STORE_LISTING.md` submission pack; zip script now versions automatically.
- **Tests**: Suite expanded from 9 to 23 (added reverse-calc and reports coverage).

### v1.1.0 (2026-04-28)
- **Configurable Payroll Rules**: All compliance parameters (PF ceiling/rate, ESI threshold/rate, PT threshold/amount, working days, tax year) are now user-editable from the Settings panel, not hardcoded.
- **CSV Preview Workflow**: CSV import now uses PapaParse for robust parsing and adds a preview step with row-level error reporting before committing. Supports optional columns (Medical, Special, LTA, PF, ESI, Bonus, TDS, Month, Year, TaxRegime).
- **JSON Restore**: Added a "Restore JSON" button in Data Management to import a previously exported backup.
- **Clear Data Controls**: Separate "Clear History" and "Clear Templates" buttons with confirmation dialogs.
- **History Limit**: Configurable maximum payslip count (default 50). Oldest payslips are automatically trimmed on save.
- **Logo Validation**: Company logo uploads are now validated for file type (PNG/JPEG/WebP), file size (≤ 300 KB), and dimensions (≤ 1024×1024 px).
- **Lazy PDF Loading**: `jspdf` is dynamically imported only on download, reducing the popup initial bundle size.
- **Batch Payslip Save**: New `savePayslipsBatch()` and `replacePayslips()` storage utilities for efficient bulk operations.
- **PayrollRules type**: New `PayrollRules` interface in `types.ts` with centralized defaults in `settings.ts`.
- **Settings Normalization**: `normalizeSettings()` ensures safe defaults for missing or partial settings.

### v1.0.0 (2026-04-27)
- Initial release with payroll calculator, PDF generation, employee templates, history panel, freemium quota, and Lemon Squeezy license integration.

---

## License

MIT

