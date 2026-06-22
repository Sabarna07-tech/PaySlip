import { useEffect, useMemo, useState } from "react";
import type { Employee } from "@/types";
import { getTemplates, deleteTemplate, savePayslipsBatch, type EmployeeTemplate } from "@/utils/storage";
import type { PayrollRules } from "@/types";
import { calculatePayslip, formatINR } from "@/utils/payroll";
import { DEFAULT_PAYROLL_RULES, getSettings } from "@/utils/settings";
import { runPayroll, summarizePayRun, type PayRunSummary, type RosterEmployee } from "@/utils/payRun";
import { consumeQuota } from "@/utils/quota";
import { isPro as checkPro } from "@/utils/license";
import EmployeeEditor from "./EmployeeEditor";
import { usePro } from "../usePro";
import { useUpgrade } from "../UpgradeContext";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const now = new Date();

type View = "directory" | "edit" | "run";

export default function TeamPanel() {
  const { pro } = usePro();
  const { promptUpgrade } = useUpgrade();
  const [employees, setEmployees] = useState<EmployeeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<View>("directory");
  const [editing, setEditing] = useState<EmployeeTemplate | undefined>(undefined);
  const [rules, setRules] = useState<PayrollRules>(DEFAULT_PAYROLL_RULES);

  // Pay-run state
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year, setYear] = useState(now.getFullYear());
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<{ summary: PayRunSummary; payslips: ReturnType<typeof runPayroll> } | null>(null);

  const reload = () =>
    getTemplates()
      .then((t) => {
        setEmployees(t);
        setSelected(new Set(t.map((e) => e.id)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));

  useEffect(() => {
    reload();
    getSettings().then((s) => setRules(s.payrollRules)).catch(() => {});
  }, []);

  const estNet = (e: EmployeeTemplate) =>
    calculatePayslip({ ...e.employee, month: "—", year: 0 } as Employee, rules).netPay;

  const selectedEmployees = useMemo(
    () => employees.filter((e) => selected.has(e.id)),
    [employees, selected]
  );

  const handleDelete = async (e: EmployeeTemplate) => {
    if (!confirm(`Remove ${e.name} from the team?`)) return;
    await deleteTemplate(e.id);
    reload();
  };

  const toggleSelect = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const handleRun = async () => {
    if (selectedEmployees.length === 0 || running) return;
    setRunning(true);
    try {
      const settings = await getSettings();
      const rosters: RosterEmployee[] = selectedEmployees.map((e) => e.employee);
      const payslips = runPayroll(rosters, month, year, settings.payrollRules);

      const decision = await consumeQuota(payslips.length);
      if (!decision.allowed) {
        promptUpgrade({
          reason: `This run needs ${payslips.length} payslips, but only ${decision.remaining} free remain this month.`,
        });
        return;
      }

      await savePayslipsBatch(payslips, settings.historyLimit);
      setResult({ summary: summarizePayRun(payslips), payslips });
    } finally {
      setRunning(false);
    }
  };

  const handleDownloadZip = async () => {
    if (!result) return;
    if (!(await checkPro())) {
      promptUpgrade({ reason: "Bulk ZIP export is a PaySlip Pro feature" });
      return;
    }
    const { generatePayslipsZip } = await import("@/utils/bulkExport");
    await generatePayslipsZip(result.payslips, `payrun_${month}_${year}.zip`.toLowerCase());
  };

  if (loading) return <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>;

  if (view === "edit") {
    return (
      <EmployeeEditor
        initial={editing}
        onSaved={() => {
          setView("directory");
          setEditing(undefined);
          reload();
        }}
        onCancel={() => {
          setView("directory");
          setEditing(undefined);
        }}
      />
    );
  }

  // ── Pay Run ──────────────────────────────────────────────
  if (view === "run") {
    if (result) {
      return (
        <div className="p-3 space-y-3">
          <div className="text-center py-2">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-sm font-bold text-gray-900">Payroll run complete</div>
            <div className="text-xs text-gray-500">{month} {year}</div>
          </div>
          <div className="bg-surface border border-border rounded-lg p-3 space-y-1.5 text-sm">
            <Row label="Payslips generated" value={String(result.summary.count)} />
            <Row label="Total gross" value={formatINR(result.summary.gross)} />
            <Row label="Total deductions" value={formatINR(result.summary.deductions)} />
            <div className="flex justify-between font-bold text-gray-900 border-t border-border pt-1.5">
              <span>Total net payout</span>
              <span className="text-success">{formatINR(result.summary.net)}</span>
            </div>
          </div>
          <button onClick={handleDownloadZip} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-1">
            🗜 Download all as ZIP {!pro && <span className="text-[10px]">🔒</span>}
          </button>
          <p className="text-[11px] text-gray-400 text-center">Saved to History. Open the History tab to view or export individually.</p>
          <button onClick={() => { setResult(null); setView("directory"); }} className="w-full py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200">
            Done
          </button>
        </div>
      );
    }

    return (
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-800">Run Payroll</h3>
          <button onClick={() => setView("directory")} className="text-xs text-gray-500 hover:text-gray-800">← Back</button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-gray-500 mb-0.5">Month</div>
            <select value={month} onChange={(e) => setMonth(e.target.value)} className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary">
              {MONTHS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <div className="text-[11px] text-gray-500 mb-0.5">Year</div>
            <input type="number" value={year} onChange={(e) => setYear(parseInt(e.target.value) || now.getFullYear())} className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-500 px-0.5">
          <span>{selected.size} of {employees.length} selected</span>
          <button
            onClick={() => setSelected(selected.size === employees.length ? new Set() : new Set(employees.map((e) => e.id)))}
            className="text-primary font-semibold hover:underline"
          >
            {selected.size === employees.length ? "Clear all" : "Select all"}
          </button>
        </div>

        <div className="border border-border rounded-lg divide-y divide-border max-h-56 overflow-y-auto">
          {employees.map((e) => (
            <label key={e.id} className="flex items-center gap-2 p-2.5 cursor-pointer">
              <input type="checkbox" checked={selected.has(e.id)} onChange={() => toggleSelect(e.id)} />
              <span className="flex-1 text-sm text-gray-800">{e.name}</span>
              <span className="text-xs text-success font-semibold">{formatINR(estNet(e))}</span>
            </label>
          ))}
        </div>

        <button onClick={handleRun} disabled={running || selectedEmployees.length === 0} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
          {running ? "Running…" : `Run Payroll for ${selectedEmployees.length} employee${selectedEmployees.length === 1 ? "" : "s"}`}
        </button>
        {!pro && (
          <p className="text-[11px] text-gray-400 text-center">
            Free plan covers a limited number of payslips per month. Pro unlocks unlimited runs.
          </p>
        )}
      </div>
    );
  }

  // ── Directory ────────────────────────────────────────────
  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">Team ({employees.length})</h3>
        {employees.length > 0 && (
          <button onClick={() => setView("run")} className="text-xs font-semibold text-primary hover:underline">
            ▶ Run Payroll
          </button>
        )}
      </div>

      {employees.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">👥</div>
          <div className="text-sm text-gray-400 mb-1">No employees yet.</div>
          <div className="text-[11px] text-gray-400">Add your team here to run payroll for everyone at once.</div>
        </div>
      ) : (
        <div className="space-y-2">
          {employees.map((e) => (
            <div key={e.id} className="p-2.5 bg-surface border border-border rounded-lg">
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{e.name}</div>
                  <div className="text-[11px] text-gray-500 truncate">
                    {[e.employee.designation, e.employee.department].filter(Boolean).join(" · ") || "No role set"}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-xs text-success font-semibold mr-1">{formatINR(estNet(e))}</span>
                  <button onClick={() => { setEditing(e); setView("edit"); }} aria-label={`Edit ${e.name}`} className="px-2 py-1 text-xs text-primary hover:bg-primary/10 rounded">Edit</button>
                  <button onClick={() => handleDelete(e)} aria-label={`Delete ${e.name}`} className="px-2 py-1 text-xs text-danger hover:bg-danger/10 rounded">✕</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => { setEditing(undefined); setView("edit"); }} className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all">
        + Add Employee
      </button>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-600">{label}</span>
      <span className="font-medium text-gray-800">{value}</span>
    </div>
  );
}
