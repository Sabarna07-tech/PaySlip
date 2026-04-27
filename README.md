# PaySlip — Mini Payroll Calculator

Instant salary calculator with PDF payslips for small businesses. A lightweight Chrome Extension built with React 18, TypeScript, Tailwind CSS, and Vite (Manifest V3).

## ✨ Features

### Payroll Engine
- **Comprehensive Payroll Math**: Calculates Gross Earnings and Net Pay from Basic Salary, HRA, Conveyance, Medical, Special Allowance, LTA, Custom Allowances, Overtime, and Bonuses.
- **Configurable Payroll Rules**: Working days, PF ceiling & rate, ESI threshold & rate, PT threshold & amount, and Tax Year label are all user-editable from the Settings panel.
- **Statutory Deductions**: PF (default 12% of Basic, capped at configurable ceiling), ESI (default 0.75% if Gross ≤ configurable threshold), Professional Tax (configurable flat amount if Gross > threshold), TDS, and pro-rata unpaid leave deductions.
- **Auto-Calculate TDS**: One-click TDS estimation engine aligned with the 2025/2026 Indian tax slabs for both Old and New Tax Regimes, including Section 87A rebates and 4% Health & Education Cess.
- **Strict Input Validation**: No leading zeros, no negative values — all numeric fields are sanitized at entry.

### Employee Data
- **Enterprise Data Model**: Supports PAN, UAN, Department, Designation, Bank Account, LTA, and Tax Regime fields per employee.
- **Custom Allowances**: Define any number of custom allowance line items per employee.
- **Employee Templates**: Save and load complete employee configurations with a single click.

### Output & Sharing
- **Professional PDF Generation**: Clean A4 portrait PDF payslips with a two-column employee metadata grid (Name, Designation, Department, Bank A/C, Period, PAN, UAN).
- **Company Branding (Pro)**: Upload a company logo (PNG/JPEG/WebP, ≤ 300 KB, ≤ 1024×1024 px) and set Company Name & Address — all rendered on the PDF header.
- **Dynamic Allowances in PDF**: Custom allowances are automatically listed as individual rows in the Earnings column.
- **Lazy-loaded PDF**: `jspdf` is dynamically imported only when the user downloads, keeping the popup bundle lean.

### Data Management
- **History Panel**: Searchable by name, department, or month. Grouped by month/year with a mini-dashboard showing Total Payslips and Total Net Pay Disbursed.
- **Configurable History Limit**: Set the maximum number of payslips stored locally (default: 50). Oldest entries are trimmed automatically.
- **Bulk CSV Import**: Upload a `.csv` (required columns: Name, Basic, HRA, Conveyance, PAN, Department; optional: Medical, Special, LTA, PF, ESI, Bonus, TDS, Month, Year, TaxRegime). Features a **preview → confirm** workflow with row-level validation and error reporting. Powered by PapaParse for robust RFC 4180 compliance.
- **JSON Data Export & Restore**: Export all payslips and templates as a timestamped JSON backup, or restore from a previously exported JSON file.
- **Clear Data**: One-click buttons to clear payslip history or templates independently.

### Monetization
- **Freemium Quota**: 2 free payslips per month, auto-resets monthly.
- **PaySlip Pro**: Lemon Squeezy license key integration for unlimited payslips and PDF branding. 24-hour validation caching.
- **Local-first Privacy**: All payroll data stays in your browser. The only external request is license key verification.

---

## Architecture

```
src/
├── types.ts                    # Employee, Payslip, Earnings, Deductions, PayrollRules
├── popup/
│   ├── main.tsx                # Entry point + chrome.storage.local dev polyfill
│   ├── App.tsx                 # Tab router (Calc, Hist, Import, Sett)
│   └── components/
│       ├── EmployeeForm.tsx    # Data entry with collapsible sections
│       ├── SalaryBreakdown.tsx # Payslip result view
│       ├── HistoryPanel.tsx    # Searchable, grouped history + dashboard
│       ├── BulkImport.tsx      # CSV preview → commit UI
│       ├── SettingsPanel.tsx   # Branding, license, payroll rules, data mgmt
│       └── UpgradeModal.tsx    # Freemium paywall
└── utils/
    ├── payroll.ts              # Pure payroll calculation engine
    ├── taxCalculator.ts        # TDS estimation (Old + New regime)
    ├── pdfGenerator.ts         # jsPDF payslip generation (lazy-loaded)
    ├── csvParser.ts            # PapaParse-based CSV parser with preview
    ├── storage.ts              # chrome.storage.local CRUD + backup/restore
    ├── settings.ts             # AppSettings + PayrollRules with defaults
    ├── license.ts              # Lemon Squeezy license validation
    └── quota.ts                # Monthly usage tracking
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

## Chrome Web Store Submission Checklist

### 1. Prepare the package

```bash
# Build production bundle
npm run build

# Zip the dist folder
cd dist && zip -r ../payslip-v1.0.0.zip . && cd ..
```

Upload `payslip-v1.0.0.zip` on the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole).

### 2. Required fields

| Field               | Value                                                                 |
| ------------------- | --------------------------------------------------------------------- |
| **Name**            | PaySlip — Mini Payroll Calculator                                     |
| **Summary**         | Instant salary calculator with PDF payslips for small businesses.     |
| **Description**     | Full feature description (earnings, deductions, PDF export, history). |
| **Category**        | Productivity                                                          |
| **Language**        | English                                                               |
| **Version**         | 1.0.0                                                                 |

### 3. Privacy policy

- Host `public/privacy.html` at a public URL (e.g. GitHub Pages, Netlify, or your domain).
- Enter that URL in the **Privacy policy** field on the Developer Dashboard.
- Required by Chrome Web Store even for extensions with zero data collection.

### 4. Screenshots & assets

| Asset               | Size           | Notes                                          |
| -------------------- | -------------- | ---------------------------------------------- |
| **Screenshots**      | 1280 × 800 px | Minimum 1, maximum 5. Show the calculator and breakdown views. |
| **Small promo tile** | 440 × 280 px  | Optional but recommended.                      |
| **Icon**             | 128 × 128 px  | Already generated at `icons/icon-128.png`.     |

### 5. Permissions justification

| Permission        | Justification                                                              |
| ----------------- | -------------------------------------------------------------------------- |
| `storage`         | Persist payslip history, templates, settings, and quota locally.           |
| `host_permissions` | Validate PaySlip Pro license keys via `https://api.lemonsqueezy.com/*`. |

### 6. Final checks

- [ ] `manifest.json` version matches submission version.
- [ ] All icon sizes (16, 48, 128) are present in `icons/`.
- [ ] Privacy policy URL is live and accessible.
- [ ] At least one 1280×800 screenshot is uploaded.
- [ ] Extension tested on Chrome stable (latest).
- [ ] No unused permissions in manifest.

---

## Changelog

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

