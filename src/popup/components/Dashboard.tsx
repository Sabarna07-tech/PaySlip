import { useEffect, useMemo, useState } from "react";
import type { Payslip } from "@/types";
import { getPayslips } from "@/utils/storage";
import { formatINR } from "@/utils/payroll";
import { computeDashboard } from "@/utils/analytics";
import { isExtensionRuntime, openExternal } from "@/utils/platform";
import { WEB_APP_URL } from "@/config";
import { usePro } from "../usePro";

interface Props {
  onNavigate: (tab: "calculator" | "team") => void;
}

export default function Dashboard({ onNavigate }: Props) {
  const { pro } = usePro();
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);
  const showWebAppCta = isExtensionRuntime();

  useEffect(() => {
    getPayslips()
      .then(setPayslips)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const d = useMemo(() => computeDashboard(payslips), [payslips]);
  const trendMax = Math.max(1, ...d.trend.map((t) => t.net));
  const deptMax = Math.max(1, ...d.deptSplit.map((s) => s.net));

  if (loading) {
    return <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>;
  }

  return (
    <div className="p-3 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <Kpi label="Employees" value={String(d.distinctEmployees)} />
        <Kpi label="Payslips" value={String(d.totalPayslips)} />
        <Kpi label="Total Disbursed" value={formatINR(d.totalNet)} accent="text-success" />
        <Kpi label={`${d.latestPeriodLabel} Net`} value={formatINR(d.latestPeriodNet)} accent="text-primary" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onNavigate("calculator")}
          className="py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all"
        >
          ➕ New Payslip
        </button>
        <button
          onClick={() => onNavigate("team")}
          className="py-2.5 bg-surface border border-border text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          👥 Run Payroll
        </button>
      </div>

      {showWebAppCta && (
        <button
          onClick={() => openExternal(WEB_APP_URL)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors text-left"
        >
          <span className="text-xs text-gray-700">
            <span className="font-bold text-primary">Open the full web workspace ↗</span>
            <br />
            {pro ? "Roomier layout for serious payroll runs." : "Included with PaySlip Pro."}
          </span>
          <span className="text-lg">🖥️</span>
        </button>
      )}

      {d.totalPayslips === 0 ? (
        <div className="text-center py-8">
          <div className="text-3xl mb-2">📊</div>
          <div className="text-sm text-gray-400">
            Your payroll dashboard appears here once you generate payslips.
          </div>
        </div>
      ) : (
        <>
          <Card title="Payroll Trend">
            <div className="flex items-end justify-between gap-1.5 h-24 pt-2">
              {d.trend.map((t) => (
                <div key={t.key} className="flex-1 flex flex-col items-center justify-end h-full">
                  <div className="w-full flex items-end justify-center h-full">
                    <div
                      className="w-full max-w-[24px] bg-primary/80 rounded-t"
                      style={{ height: `${Math.max(4, (t.net / trendMax) * 100)}%` }}
                      title={formatINR(t.net)}
                    />
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1 whitespace-nowrap">{t.label}</div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Cost by Department">
            <div className="space-y-2">
              {d.deptSplit.map((s) => (
                <div key={s.dept}>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-gray-700 font-medium truncate">{s.dept}</span>
                    <span className="text-gray-500">{formatINR(s.net)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/70 rounded-full"
                      style={{ width: `${(s.net / deptMax) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

function Kpi({ label, value, accent = "text-gray-900" }: { label: string; value: string; accent?: string }) {
  return (
    <div className="bg-surface border border-border rounded-lg p-2.5">
      <div className="text-[10px] uppercase font-bold tracking-wide text-gray-500 mb-1 truncate">{label}</div>
      <div className={`text-base font-bold ${accent} truncate`}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg p-3">
      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">{title}</h4>
      {children}
    </div>
  );
}
