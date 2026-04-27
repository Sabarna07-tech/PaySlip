export interface Employee {
  name: string;
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
  tds: number;
  month: string;
  year: number;
}

export interface Deductions {
  pf: number;
  esi: number;
  tds: number;
  unpaidLeaveDeduction: number;
  total: number;
}

export interface Earnings {
  basic: number;
  hra: number;
  conveyance: number;
  medical: number;
  special: number;
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
