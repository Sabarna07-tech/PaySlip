import { useState, useEffect } from "react";
import type { Payslip } from "@/types";
import { getPayslips } from "@/utils/storage";
import { formatINR } from "@/utils/payroll";
import { generatePayslipPDF } from "@/utils/pdfGenerator";
import SalaryBreakdown from "./SalaryBreakdown";

export default function HistoryPanel() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPayslips()
      .then(setPayslips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (selected) {
    return (
      <SalaryBreakdown
        payslip={selected}
        onDownload={() => generatePayslipPDF(selected)}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
    );
  }

  if (payslips.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-3xl mb-2">📭</div>
        <div className="text-sm text-gray-400">
          No payslips yet. Calculate one to see history here.
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 space-y-2">
      {payslips.map((p) => (
        <div
          key={p.id}
          className="p-3 bg-surface rounded-lg cursor-pointer border border-border
                     hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
          onClick={() => setSelected(p)}
        >
          <div className="flex items-center justify-between">
            <div className="font-medium text-sm text-gray-900">{p.employee.name}</div>
            <div className="text-xs font-semibold text-success">{formatINR(p.netPay)}</div>
          </div>
          <div className="text-[11px] text-gray-400 mt-0.5">
            {p.employee.month} {p.employee.year}
          </div>
        </div>
      ))}
    </div>
  );
}
