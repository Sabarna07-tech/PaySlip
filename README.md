# PaySlip — Mini Payroll Calculator

Instant salary calculator with PDF payslips for small businesses. A lightweight Chrome Extension built with React 18, TypeScript, Tailwind CSS, and Vite (Manifest V3).

## ✨ Features

### Payroll Engine
- **Comprehensive Payroll Math**: Calculates Gross Earnings and Net Pay from Basic Salary, HRA, Conveyance, Medical, Special Allowance, LTA, Custom Allowances, Overtime, and Bonuses.
- **Statutory Deductions**: PF (12% of Basic, capped at ₹15,000 ceiling), ESI (0.75% employee share if Gross ≤ ₹21k), Professional Tax (₹200 flat if Gross > ₹15k), TDS, and pro-rata unpaid leave deductions.
- **Auto-Calculate TDS**: One-click TDS estimation engine using the 2025/2026 Indian tax slabs for both Old and New Tax Regimes, including Section 87A rebates and 4% Health & Education Cess.
- **Strict Input Validation**: No leading zeros, no negative values — all numeric fields are sanitized at entry.

### Employee Data
- **Enterprise Data Model**: Supports PAN, UAN, Department, Designation, Bank Account, and LTA fields per employee.
- **Custom Allowances**: Define any number of custom allowance line items per employee.
- **Employee Templates**: Save and load complete employee configurations with a single click.

### Output & Sharing
- **Professional PDF Generation**: Clean A4 portrait PDF payslips with a two-column employee metadata grid (Name, Designation, Department, Bank A/C, Period, PAN, UAN).
- **Company Branding (Pro)**: Upload a company logo and set Company Name & Address — all rendered on the PDF header.
- **Dynamic Allowances in PDF**: Custom allowances are automatically listed as individual rows in the Earnings column.

### Data Management
- **History Panel**: Searchable, grouped by month/year, with a mini-dashboard showing Total Payslips and Total Net Pay Disbursed.
- **Bulk CSV Import**: Upload a `.csv` file (columns: Name, Basic, HRA, Conveyance, PAN, Department) to generate payslips in bulk.
- **JSON Data Export**: One-click backup of all payslips and templates as a timestamped JSON file.

### Monetization
- **Freemium Quota**: 2 free payslips per month, auto-resets monthly.
- **PaySlip Pro**: Lemon Squeezy license key integration for unlimited payslips and PDF branding. 24-hour validation caching.
- **Local-first Privacy**: All payroll data stays in your browser. The only external request is license key verification.

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

Then load the generated dev output folder as an unpacked extension. Changes will auto-rebuild.

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

| Permission  | Justification                                        |
| ----------- | ---------------------------------------------------- |
| `storage`   | Persist recent payslip history locally in the browser. |

### 6. Final checks

- [ ] `manifest.json` version matches submission version.
- [ ] All icon sizes (16, 48, 128) are present in `icons/`.
- [ ] Privacy policy URL is live and accessible.
- [ ] At least one 1280×800 screenshot is uploaded.
- [ ] Extension tested on Chrome stable (latest).
- [ ] No unused permissions in manifest.

---

## License

MIT
