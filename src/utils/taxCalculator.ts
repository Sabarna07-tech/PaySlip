/**
 * Calculates the estimated monthly TDS based on Indian Tax Slabs (2025/2026).
 * This provides a recommended TDS deduction.
 */
export function calculateEstimatedTDS(monthlyGross: number, regime: "old" | "new" = "new"): number {
  const annualGross = monthlyGross * 12;

  if (regime === "new") {
    // FY 2024-25 / AY 2025-26 New Tax Regime
    const standardDeduction = 75000;
    const taxableIncome = Math.max(0, annualGross - standardDeduction);

    // Section 87A Rebate: No tax if taxable income is up to ₹7,00,000
    if (taxableIncome <= 700000) {
      return 0;
    }

    let tax = 0;
    
    // Slab: 3,00,001 - 7,00,000 (5%)
    if (taxableIncome > 300000) {
      tax += Math.min(400000, taxableIncome - 300000) * 0.05;
    }
    // Slab: 7,00,001 - 10,00,000 (10%)
    if (taxableIncome > 700000) {
      tax += Math.min(300000, taxableIncome - 700000) * 0.10;
    }
    // Slab: 10,00,001 - 12,00,000 (15%)
    if (taxableIncome > 1000000) {
      tax += Math.min(200000, taxableIncome - 1000000) * 0.15;
    }
    // Slab: 12,00,001 - 15,00,000 (20%)
    if (taxableIncome > 1200000) {
      tax += Math.min(300000, taxableIncome - 1200000) * 0.20;
    }
    // Slab: Above 15,00,000 (30%)
    if (taxableIncome > 1500000) {
      tax += (taxableIncome - 1500000) * 0.30;
    }

    // Health and Education Cess (4% of total tax)
    const totalTax = tax + (tax * 0.04);
    return Math.round(totalTax / 12);
  } else {
    // Old Tax Regime
    const standardDeduction = 50000;
    // Note: Assuming no other Section 80C/80D deductions for a baseline estimate
    const taxableIncome = Math.max(0, annualGross - standardDeduction);

    // Section 87A Rebate: No tax if taxable income is up to ₹5,00,000
    if (taxableIncome <= 500000) {
      return 0;
    }

    let tax = 0;
    
    // Slab: 2,50,001 - 5,00,000 (5%)
    if (taxableIncome > 250000) {
      tax += Math.min(250000, taxableIncome - 250000) * 0.05;
    }
    // Slab: 5,00,001 - 10,00,000 (20%)
    if (taxableIncome > 500000) {
      tax += Math.min(500000, taxableIncome - 500000) * 0.20;
    }
    // Slab: Above 10,00,000 (30%)
    if (taxableIncome > 1000000) {
      tax += (taxableIncome - 1000000) * 0.30;
    }

    // Health and Education Cess (4% of total tax)
    const totalTax = tax + (tax * 0.04);
    return Math.round(totalTax / 12);
  }
}
