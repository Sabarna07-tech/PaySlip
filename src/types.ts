export interface CustomAllowance {
  name: string;
  amount: number;
}

export interface Employee {
  name: string;
  pan?: string;
  uan?: string;
  department?: string;
  designation?: string;
  bankAccount?: string;
  lta?: number;
  customAllowances?: CustomAllowance[];
  basicSalary: number;
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
  pfEmployer: boolean;
  esiApplicable: boolean;
  paidLeaves: number;
  unpaidLeaves: number;
  overtimeHours: number;
  overtimeRate: number;
  bonus: number;
  taxRegime?: "old" | "new";
  tds: number;
  month: string;
  year: number;
}

export interface Deductions {
  pf: number;
  esi: number;
  tds: number;
  pt: number;
  unpaidLeaveDeduction: number;
  total: number;
}

export interface Earnings {
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
  lta: number;
  customAllowancesTotal: number;
  overtimePay: number;
  bonus: number;
  total: number;
}

export interface Payslip {
  id: string;
  employee: Employee;
  earnings: Earnings;
  deductions: Deductions;
  netPay: number;
  generatedAt: string;
}

export interface PayrollRules {
  workingDays: number;
  pfBasicCeiling: number;
  pfRate: number;
  esiGrossThreshold: number;
  esiRate: number;
  professionalTaxThreshold: number;
  professionalTaxAmount: number;
  taxYear: string;
}
