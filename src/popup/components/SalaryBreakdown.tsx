import type { Payslip } from "@/types";
import { formatINR } from "@/utils/payroll";

interface Props {
  payslip: Payslip;
  onDownload: () => void;
  onBack: () => void;
}

export default function SalaryBreakdown({ payslip, onDownload, onBack }: Props) {
  const earningsItems = ([
    ["Basic Salary", payslip.earnings.basic],
    ["HRA", payslip.earnings.hra],
    ["Conveyance", payslip.earnings.conveyance],
    ["Medical", payslip.earnings.medical],
    ["Special Allowance", payslip.earnings.special],
    ["Overtime Pay", payslip.earnings.overtimePay],
    ["Bonus", payslip.earnings.bonus],
  ] as [string, number][]).filter(([, v]) => v !== 0);

  const deductionItems = ([
    ["Provident Fund", payslip.deductions.pf],
    ["ESI", payslip.deductions.esi],
    ["TDS", payslip.deductions.tds],
    ["Unpaid Leave", payslip.deductions.unpaidLeaveDeduction],
  ] as [string, number][]).filter(([, v]) => v !== 0);

  return (
    <div className="p-3 space-y-3">
      <div className="text-center py-1">
        <div className="font-semibold text-sm text-gray-900">{payslip.employee.name}</div>
        <div className="text-xs text-gray-500">
          {payslip.employee.month} {payslip.employee.year}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-surface rounded-lg p-2.5 border border-border">
          <div className="text-[11px] font-bold text-primary uppercase tracking-wide mb-2">
            Earnings
          </div>
          <div className="space-y-1.5">
            {earningsItems.map(([label, amount]) => (
              <div key={label} className="flex justify-between text-xs">
                <span className="text-gray-600">{label}</span>
                <span className="font-medium text-gray-800">{formatINR(amount)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-xs font-bold text-gray-900">
            <span>Gross</span>
            <span>{formatINR(payslip.earnings.total)}</span>
          </div>
        </div>

        <div className="bg-surface rounded-lg p-2.5 border border-border">
          <div className="text-[11px] font-bold text-danger uppercase tracking-wide mb-2">
            Deductions
          </div>
          <div className="space-y-1.5">
            {deductionItems.length > 0 ? (
              deductionItems.map(([label, amount]) => (
                <div key={label} className="flex justify-between text-xs">
                  <span className="text-gray-600">{label}</span>
                  <span className="font-medium text-gray-800">{formatINR(amount)}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-gray-400 italic">None</div>
            )}
          </div>
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-xs font-bold text-gray-900">
            <span>Total</span>
            <span>{formatINR(payslip.deductions.total)}</span>
          </div>
        </div>
      </div>

      <div className="bg-success/10 rounded-lg px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-bold text-success">NET PAY</span>
        <span className="text-lg font-bold text-success">{formatINR(payslip.netPay)}</span>
      </div>

      <div className="flex gap-2">
        <div
          className="flex-1 text-center py-2.5 bg-primary text-white rounded-lg text-sm font-semibold
                     cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all select-none"
          onClick={onDownload}
        >
          📄 Download PDF
        </div>
        <div
          className="flex-1 text-center py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold
                     cursor-pointer hover:bg-gray-200 active:scale-[0.98] transition-all select-none"
          onClick={onBack}
        >
          ← Back
        </div>
      </div>
    </div>
  );
}
