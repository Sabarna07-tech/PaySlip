# Chrome Web Store Preflight — v1.4.0

Run `npm run preflight` to cover the first five items in one shot.

- [ ] `npm run audit` reports zero production vulnerabilities.
- [ ] `npm run test` passes (42 tests).
- [ ] `npm run typecheck` passes.
- [ ] `npm run build` completes without errors.
- [ ] `npm run zip` creates `payslip-v1.4.0.zip` (name tracks `package.json` version).
- [ ] `npm run build:web` builds the standalone web app to `dist-web/` (deploy separately; optional for the store submission).
- [ ] `src/config.ts` uses YOUR Lemon Squeezy `LS_STORE_URL` / `LS_CHECKOUT_URL`, not the placeholder.
- [ ] `manifest.json` version (1.2.0) matches the dashboard submission version.
- [ ] Privacy policy URL is public and matches extension behavior.
- [ ] Chrome Web Store privacy fields disclose local payroll storage and Lemon Squeezy license validation; "does not collect user data" selected.
- [ ] Permission justification covers `storage` and the Lemon Squeezy host access (see STORE_LISTING.md).
- [ ] Single-purpose description entered.
- [ ] Screenshots prepared at 1280×800 (calculator, breakdown, PDF, Net→Gross, reports).
- [ ] Manual smoke test from an unpacked `dist` install on latest Chrome:
  - [ ] Generate a payslip, download the PDF.
  - [ ] Net → Gross produces a sensible gross for a target net.
  - [ ] Add an employee in Team, then run a Pay Run for a month → payslips appear in History.
  - [ ] Dashboard shows KPIs, trend, and department split after generating payslips.
  - [ ] Pro-gated actions (bulk ZIP, reports, premium themes, large pay runs) prompt the paywall when unlicensed.
  - [ ] A valid license key unlocks Pro features; PDF theme + logo apply.
