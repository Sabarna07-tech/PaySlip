# Chrome Web Store — Listing Copy & Submission Pack

Everything you need to paste into the [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole). Build the upload package with `npm run preflight` (produces `payslip-v1.4.0.zip`).

---

## 1. Store listing fields

| Field | Value |
| ----- | ----- |
| **Item name** | PaySlip — Indian Payroll & Salary Slip Calculator |
| **Summary** (132 char max) | Indian salary & payslip calculator — PF, ESI, TDS, professional PDF payslips, bulk export & annual reports. Private & local-first. |
| **Category** | Productivity |
| **Language** | English |
| **Version** | 1.4.0 |

### Detailed description (paste into "Description")

```
PaySlip turns messy salary math into a clean, professional payslip in seconds — built specifically for Indian small businesses, HR teams, accountants, and freelancers.

Everything runs locally in your browser. Your payroll data never leaves your device.

━━━━━━━━━━━━━━━━━━━━━━
WHAT IT DOES
━━━━━━━━━━━━━━━━━━━━━━
• Calculate gross pay, statutory deductions, and net (take-home) pay instantly
• Generate a polished A4 PDF salary slip with your company name, logo & address
• Auto-estimate TDS for the FY 2024-25 / AY 2025-26 Old and New tax regimes
• Net → Gross: enter the take-home you want, get the gross salary and full breakdown
• Save reusable employee templates and a searchable payslip history

━━━━━━━━━━━━━━━━━━━━━━
A FULL PAYROLL WORKSPACE
━━━━━━━━━━━━━━━━━━━━━━
• Dashboard with headcount, total disbursed, a payroll trend chart, and cost by department
• Team directory — keep your whole roster with validated PAN/UAN and per-employee salary structures
• Pay Run — generate payslips for every employee for a month in one click, then export them all as a ZIP (Pro)

━━━━━━━━━━━━━━━━━━━━━━
INDIA-READY PAYROLL
━━━━━━━━━━━━━━━━━━━━━━
• Provident Fund (PF) — 12% of Basic, capped at a configurable ceiling
• Employee State Insurance (ESI) — applied below a configurable gross threshold
• Professional Tax (PT), TDS, and pro-rata unpaid-leave deductions
• Every compliance number (PF/ESI/PT rates & thresholds, working days, tax year)
  is editable in Settings — adapt it to your state and policies

━━━━━━━━━━━━━━━━━━━━━━
BUILT FOR REAL PAYROLL DAYS
━━━━━━━━━━━━━━━━━━━━━━
• Bulk CSV import with a preview-and-confirm safety step
• Bulk export an entire month of payslips as a single ZIP of PDFs (Pro)
• Annual salary register & per-employee year-to-date reports, export to CSV/PDF (Pro)
• JSON backup & restore so you never lose your data
• Premium PDF themes + company branding (Pro)

━━━━━━━━━━━━━━━━━━━━━━
PRIVACY FIRST
━━━━━━━━━━━━━━━━━━━━━━
• 100% local — salary data is stored only in your browser (chrome.storage.local)
• No accounts, no sign-in, no analytics, no tracking
• The only network request is optional license-key validation for Pro

━━━━━━━━━━━━━━━━━━━━━━
FREE vs PRO
━━━━━━━━━━━━━━━━━━━━━━
Free: 3 payslips per month, full calculator, single PDF download, CSV import,
      history, templates, Net → Gross calculator.
Pro:  Unlimited payslips, bulk ZIP export, annual reports, premium PDF themes,
      and company logo branding.

Disclaimer: PaySlip provides estimates to assist payroll preparation and is not a
substitute for professional tax or legal advice. Verify statutory figures against
current government rules before disbursing salaries.
```

---

## 2. Privacy & data-use disclosures (Dashboard › Privacy tab)

- **Single purpose:** "PaySlip is a salary and payslip calculator that computes pay and statutory deductions and generates downloadable PDF payslips, entirely within the user's browser."
- **Privacy policy URL:** host `public/privacy.html` at a public URL (GitHub Pages, Netlify, or your domain) and paste it here. **Required even though no data is collected.**
- **Data collection:** Select **"This item does not collect user data"** (the only network call is license validation, which sends just the license key the user typed — no personal/payroll data).

### Permission justifications

| Permission | Justification to paste |
| ---------- | ---------------------- |
| `storage` | Persist payslip history, employee templates, company settings, the PDF theme choice, monthly free-tier usage, and license status locally in the user's browser. |
| `host_permissions` → `https://api.lemonsqueezy.com/*` | Validate an optional PaySlip Pro license key with the Lemon Squeezy licensing API. Only the license key is transmitted; no payroll or personal data is sent. |

> No `tabs`, `scripting`, `activeTab`, content scripts, or remote code. The popup is fully self-contained.

---

## 3. Graphic assets

| Asset | Size | Required | Notes |
| ----- | ---- | -------- | ----- |
| Store icon | 128×128 PNG | ✅ | `icons/icon-128.png` (already generated) |
| Screenshots | 1280×800 or 640×400 PNG/JPEG | ✅ (min 1, max 5) | See shot list below |
| Small promo tile | 440×280 PNG | Optional | Recommended for better placement |
| Marquee promo tile | 1400×560 PNG | Optional | Only for featured placement |

### Suggested screenshots (capture the popup, then place on an 1280×800 canvas)
1. **Calculator** with a filled-in salary → "Calculate any salary in seconds"
2. **Salary breakdown** result → "Clear earnings vs deductions, instant net pay"
3. **A PDF payslip** (open the generated PDF) → "Professional, branded PDF payslips"
4. **Net → Gross** result card → "Work backwards from take-home pay"
5. **Reports / Salary register** → "Year-end reports & bulk export"

> Tip: the popup is 380px wide. Capture it at 2× zoom and center it on a soft-gradient 1280×800 background with a one-line caption for a clean store look.

---

## 4. Monetization setup (Lemon Squeezy)

Chrome dropped its own paid-extension payments, so Pro is sold through **Lemon Squeezy** (handles global payments, GST/VAT invoicing, and license keys).

1. Create a Lemon Squeezy store and a **"PaySlip Pro"** product that issues **license keys**.
2. **Set the activation limit** on the product (License keys → "Activation limit") to **2–3**. This is the anti-sharing control: each key only works on that many devices. The app activates a key per device and refuses extra ones.
3. Copy your store URL and (optionally) the product checkout URL into [`src/config.ts`](src/config.ts):
   - `LS_STORE_URL`, `LS_CHECKOUT_URL`
4. Adjust the price label (`PRO_PRICE_LABEL`) and the free monthly limit (`FREE_MONTHLY_LIMIT`) in the same file if needed.
5. Rebuild (`npm run build`) so the new URLs ship in the bundle.

Users buy a key on Lemon Squeezy, paste it into the upgrade screen or Settings, and the
extension **activates** it against `api.lemonsqueezy.com` for that device (cached for 24h).
A user can release a device via **Settings → "Deactivate this device"** to move their key.

---

## 5. Pre-submission checklist

- [ ] `npm run preflight` is green (audit + tests + build + zip).
- [ ] `manifest.json` version matches the dashboard submission version.
- [ ] `src/config.ts` points at YOUR Lemon Squeezy store/checkout (not the placeholder).
- [ ] Privacy policy is live at a public URL and entered on the dashboard.
- [ ] At least one 1280×800 screenshot uploaded.
- [ ] Single-purpose + permission justifications filled in.
- [ ] Manual smoke test from an unpacked `dist/` install on the latest Chrome.
