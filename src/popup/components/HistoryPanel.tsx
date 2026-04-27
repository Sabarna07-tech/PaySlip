import { useState, useEffect, useMemo } from "react";
import type { Payslip } from "@/types";
import { getPayslips } from "@/utils/storage";
import { formatINR } from "@/utils/payroll";
import { generatePayslipPDF } from "@/utils/pdfGenerator";
import SalaryBreakdown from "./SalaryBreakdown";

export default function HistoryPanel() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getPayslips()
      .then(setPayslips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredPayslips = useMemo(() => {
    const query = searchQuery.toLowerCase();
    if (!query) return payslips;

    return payslips.filter((p) => {
      const e = p.employee;
      return (
        e.name.toLowerCase().includes(query) ||
        e.month.toLowerCase().includes(query) ||
        (e.department && e.department.toLowerCase().includes(query))
      );
    });
  }, [payslips, searchQuery]);

  const totalNetPay = useMemo(
    () => filteredPayslips.reduce((sum, p) => sum + p.netPay, 0),
    [filteredPayslips]
  );

  const groupedPayslips = useMemo(() => {
    const groups: Record<string, Payslip[]> = {};
    for (const p of filteredPayslips) {
      const key = `${p.employee.month} ${p.employee.year}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(p);
    }
    return groups;
  }, [filteredPayslips]);

  if (selected) {
    return (
      <SalaryBreakdown
        payslip={selected}
        onDownload={async () => await generatePayslipPDF(selected)}
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
          No payslips yet. Calculate or import one to see history here.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative">
      <div className="sticky top-0 z-[5] bg-white border-b border-border p-3 space-y-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by name, department, or month..."
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-surface 
                     focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                     transition-colors placeholder:text-gray-400"
        />
        <div className="flex justify-between items-center bg-surface border border-border rounded-lg p-2.5">
          <div className="text-center w-1/2">
            <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500 mb-0.5">Payslips</div>
            <div className="text-sm font-semibold text-gray-800">{filteredPayslips.length}</div>
          </div>
          <div className="w-px h-8 bg-border"></div>
          <div className="text-center w-1/2">
            <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500 mb-0.5">Total Disbursed</div>
            <div className="text-sm font-bold text-success">{formatINR(totalNetPay)}</div>
          </div>
        </div>
      </div>

      <div className="p-3 space-y-4">
        {Object.entries(groupedPayslips).map(([groupKey, groupItems]) => (
          <div key={groupKey}>
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 px-1">
              {groupKey}
            </h4>
            <div className="space-y-2">
              {groupItems.map((p) => (
                <div
                  key={p.id}
                  className="p-3 bg-surface rounded-lg cursor-pointer border border-border
                             hover:shadow-md hover:border-primary/30 transition-all active:scale-[0.99]"
                  onClick={() => setSelected(p)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-sm text-gray-900">{p.employee.name}</div>
                    <div className="text-xs font-bold text-success">{formatINR(p.netPay)}</div>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-500">
                    <div>{p.employee.department || "No Department"}</div>
                    <div className="bg-gray-100 px-1.5 py-0.5 rounded text-gray-600 font-medium border border-border">
                      Gross: {formatINR(p.earnings.total)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {filteredPayslips.length === 0 && (
          <div className="text-center py-6 text-sm text-gray-400">
            No results found for "{searchQuery}"
          </div>
        )}
      </div>
    </div>
  );
}
