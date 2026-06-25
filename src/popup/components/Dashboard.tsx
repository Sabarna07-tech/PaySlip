import { useEffect, useMemo, useState } from "react";
import type { Payslip } from "@/types";
import { getPayslips } from "@/utils/storage";
import { formatINR } from "@/utils/payroll";
import { computeDashboard } from "@/utils/analytics";
import { isExtensionRuntime, openExternal } from "@/utils/platform";
import { WEB_APP_URL } from "@/config";
import { usePro } from "../usePro";
import { Icon, type IconName } from "./icons";

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
      <div className="grid grid-cols-2 gap-2.5">
        <Kpi label="Employees" value={String(d.distinctEmployees)} icon="users" tint="indigo" />
        <Kpi label="Payslips" value={String(d.totalPayslips)} icon="history" tint="slate" />
        <Kpi label="Total Disbursed" value={formatINR(d.totalNet)} icon="chart" tint="emerald" />
        <Kpi label={`${d.latestPeriodLabel} Net`} value={formatINR(d.latestPeriodNet)} icon="sparkles" tint="indigo" />
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onNavigate("calculator")}
          className="flex items-center justify-center gap-2 py-2.5 bg-primary text-white rounded-xl text-sm font-semibold shadow-sm shadow-primary/30 hover:opacity-90 active:scale-[0.98] transition-all"
        >
          <Icon name="plus" className="w-4 h-4" /> New Payslip
        </button>
        <button
          onClick={() => onNavigate("team")}
          className="flex items-center justify-center gap-2 py-2.5 bg-white border border-border text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 active:scale-[0.98] transition-all"
        >
          <Icon name="play" className="w-4 h-4" /> Run Payroll
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
        <div className="bg-white border border-dashed border-border rounded-xl py-10 px-4 text-center">
          <span className="inline-flex w-12 h-12 rounded-2xl bg-primary/10 text-primary items-center justify-center mb-3">
            <Icon name="chart" className="w-6 h-6" />
          </span>
          <div className="text-sm font-semibold text-gray-700 mb-1">No payroll data yet</div>
          <div className="text-xs text-gray-400 max-w-[260px] mx-auto">
            Generate a payslip or run payroll for your team, and your trends and cost breakdown will appear here.
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

const TINTS: Record<string, { chip: string; value: string }> = {
  indigo: { chip: "bg-primary/10 text-primary", value: "text-gray-900" },
  emerald: { chip: "bg-success/10 text-success", value: "text-success" },
  slate: { chip: "bg-gray-100 text-gray-500", value: "text-gray-900" },
};

function Kpi({ label, value, icon, tint = "slate" }: { label: string; value: string; icon: IconName; tint?: keyof typeof TINTS }) {
  const t = TINTS[tint] ?? TINTS.slate;
  return (
    <div className="bg-white border border-border rounded-xl p-3 shadow-sm">
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-6 h-6 rounded-lg flex items-center justify-center ${t.chip}`}>
          <Icon name={icon} className="w-3.5 h-3.5" />
        </span>
        <span className="text-[10px] uppercase font-bold tracking-wide text-gray-400 truncate">{label}</span>
      </div>
      <div className={`text-lg font-extrabold ${t.value} truncate`}>{value}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-border rounded-xl p-3.5 shadow-sm">
      <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">{title}</h4>
      {children}
    </div>
  );
}
