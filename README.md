# PaySlip — Mini Payroll Calculator

Instant salary calculator with PDF payslips for small businesses. Chrome Extension built with React 18, TypeScript, Tailwind CSS, and Vite (Manifest V3).

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
