import { useMemo, useState } from "react";
import type { Payslip } from "@/types";
import { formatINR } from "@/utils/payroll";
import {
  buildAnnualRegister,
  fyLabel,
  listFinancialYears,
  registerToCSV,
} from "@/utils/reports";
import { downloadText } from "@/utils/download";
import { getSettings } from "@/utils/settings";

interface Props {
  payslips: Payslip[];
  onBack: () => void;
}

export default function AnnualReport({ payslips, onBack }: Props) {
  const years = useMemo(() => listFinancialYears(payslips), [payslips]);
  const [fyStart, setFyStart] = useState<number>(years[0] ?? new Date().getFullYear());

  const register = useMemo(() => buildAnnualRegister(payslips, fyStart), [payslips, fyStart]);

  const handleExportCSV = () => {
    const csv = registerToCSV(register);
    downloadText(csv, `salary_register_${register.label.replace(/\s+/g, "_")}.csv`, "text/csv;charset=utf-8");
  };

  const handleExportPDF = async () => {
    const settings = await getSettings();
    const { buildRegisterDoc } = await import("@/utils/registerPdf");
    const doc = buildRegisterDoc(register, settings);
    doc.save(`salary_register_${register.label.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Salary Register</h3>
        <button onClick={onBack} className="text-xs text-gray-500 hover:text-gray-800">
          ← Back
        </button>
      </div>

      {years.length === 0 ? (
        <div className="text-center py-8 text-sm text-gray-400">No payslips to report on yet.</div>
      ) : (
        <>
          <select
            value={fyStart}
            onChange={(e) => setFyStart(Number(e.target.value))}
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {years.map((y) => (
              <option key={y} value={y}>{fyLabel(y)}</option>
            ))}
          </select>

          <div className="grid grid-cols-3 gap-2 text-center">
            <Stat label="Employees" value={String(register.totals.employees)} />
            <Stat label="Gross" value={formatINR(register.totals.gross)} accent="text-gray-800" />
            <Stat label="Net Paid" value={formatINR(register.totals.net)} accent="text-success" />
          </div>

          <div className="border border-border rounded-lg divide-y divide-border max-h-64 overflow-y-auto">
            {register.rows.map((r) => (
              <div key={r.name + r.pan} className="p-2.5">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-semibold text-gray-900">{r.name}</span>
                  <span className="text-xs font-bold text-success">{formatINR(r.net)}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-gray-500">
                  <span>{r.months} mo · Gross {formatINR(r.gross)}</span>
                  <span>TDS {formatINR(r.tds)}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCSV}
              className="py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-xs font-semibold transition-colors"
            >
              ⬇ Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="py-2 bg-primary text-white hover:opacity-90 rounded-lg text-xs font-semibold transition-colors"
            >
              📄 Export PDF
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function Stat({ label, value, accent = "text-gray-800" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-2">
      <div className="text-[9px] uppercase font-bold tracking-wide text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xs font-bold ${accent}`}>{value}</div>
    </div>
  );
}
