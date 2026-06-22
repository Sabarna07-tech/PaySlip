import { useState, useEffect, useMemo } from "react";
import type { Payslip } from "@/types";
import { getPayslips } from "@/utils/storage";
import { formatINR } from "@/utils/payroll";
import SalaryBreakdown from "./SalaryBreakdown";
import AnnualReport from "./AnnualReport";
import { isPro } from "@/utils/license";
import { usePro } from "../usePro";
import { useUpgrade } from "../UpgradeContext";

export default function HistoryPanel() {
  const { pro } = usePro();
  const { promptUpgrade } = useUpgrade();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selected, setSelected] = useState<Payslip | null>(null);
  const [view, setView] = useState<"list" | "report">("list");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [exporting, setExporting] = useState(false);

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

  const handleExportZip = async () => {
    if (filteredPayslips.length === 0 || exporting) return;
    if (!(await isPro())) {
      promptUpgrade({ reason: "Bulk ZIP export is a PaySlip Pro feature" });
      return;
    }
    setExporting(true);
    try {
      const { generatePayslipsZip } = await import("@/utils/bulkExport");
      const tag = searchQuery ? searchQuery.replace(/[^a-z0-9]+/gi, "_").toLowerCase() : "all";
      await generatePayslipsZip(filteredPayslips, `payslips_${tag}.zip`);
    } finally {
      setExporting(false);
    }
  };

  const handleOpenReport = async () => {
    if (!(await isPro())) {
      promptUpgrade({ reason: "Annual salary reports are a PaySlip Pro feature" });
      return;
    }
    setView("report");
  };

  if (view === "report") {
    return <AnnualReport payslips={payslips} onBack={() => setView("list")} />;
  }

  if (selected) {
    return (
      <SalaryBreakdown
        payslip={selected}
        onDownload={async () => {
          const { generatePayslipPDF } = await import("@/utils/pdfGenerator");
          await generatePayslipPDF(selected);
        }}
        onBack={() => setSelected(null)}
      />
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>;
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
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleExportZip}
            disabled={exporting || filteredPayslips.length === 0}
            className="flex items-center justify-center gap-1 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {exporting ? "Zipping…" : "🗜 Export ZIP"}
            {!pro && <span className="text-[9px]">🔒</span>}
          </button>
          <button
            onClick={handleOpenReport}
            className="flex items-center justify-center gap-1 py-1.5 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-xs font-semibold transition-colors"
          >
            📊 Reports
            {!pro && <span className="text-[9px]">🔒</span>}
          </button>
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
