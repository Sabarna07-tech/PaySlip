import { useState, useEffect } from "react";
import type { Payslip } from "@/types";
import { savePayslip } from "@/utils/storage";
import Dashboard from "./components/Dashboard";
import EmployeeForm from "./components/EmployeeForm";
import ReverseCalculator from "./components/ReverseCalculator";
import SalaryBreakdown from "./components/SalaryBreakdown";
import HistoryPanel from "./components/HistoryPanel";
import TeamPanel from "./components/TeamPanel";
import SettingsPanel from "./components/SettingsPanel";
import BulkImport from "./components/BulkImport";
import { getSettings } from "@/utils/settings";
import { consumeQuota } from "@/utils/quota";
import { FREE_MONTHLY_LIMIT } from "@/config";
import { isExtensionRuntime } from "@/utils/platform";
import { UpgradeProvider, useUpgrade } from "./UpgradeContext";
import { usePro } from "./usePro";

type Tab = "home" | "calculator" | "team" | "history" | "import" | "settings";
type CalcMode = "standard" | "reverse";

const TABS: { id: Tab; icon: string; label: string }[] = [
  { id: "home", icon: "🏠", label: "Home" },
  { id: "calculator", icon: "💰", label: "Calculator" },
  { id: "team", icon: "👥", label: "Team" },
  { id: "history", icon: "📋", label: "History" },
  { id: "import", icon: "📥", label: "Import" },
  { id: "settings", icon: "⚙", label: "Settings" },
];

function AppShell({ web }: { web: boolean }) {
  const { promptUpgrade } = useUpgrade();
  const { pro } = usePro();
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [calcMode, setCalcMode] = useState<CalcMode>("standard");
  const [previewPayslip, setPreviewPayslip] = useState<Payslip | null>(null);

  useEffect(() => {
    getSettings();
  }, []);

  const persist = (payslip: Payslip) => {
    getSettings()
      .then((settings) => savePayslip(payslip, settings.historyLimit))
      .catch(() => {});
  };

  const handlePayslipGenerated = async (payslip: Payslip) => {
    const { allowed } = await consumeQuota(1);

    if (!allowed) {
      promptUpgrade({
        reason: `You've used your ${FREE_MONTHLY_LIMIT} free payslips this month`,
        pendingPayslip: payslip,
        onActivated: (p) => {
          persist(p);
          setPreviewPayslip(p);
        },
      });
    } else {
      persist(payslip);
      setPreviewPayslip(payslip);
    }
  };

  const handleDownload = async () => {
    if (previewPayslip) {
      const { generatePayslipPDF } = await import("@/utils/pdfGenerator");
      await generatePayslipPDF(previewPayslip);
    }
  };

  const selectTab = (tab: Tab) => {
    setActiveTab(tab);
    setPreviewPayslip(null);
  };

  const content = previewPayslip ? (
    <SalaryBreakdown payslip={previewPayslip} onDownload={handleDownload} onBack={() => setPreviewPayslip(null)} />
  ) : activeTab === "home" ? (
    <Dashboard onNavigate={selectTab} />
  ) : activeTab === "calculator" ? (
    <>
      <div className="px-3 pt-3">
        <div className="flex bg-surface border border-border rounded-lg p-0.5">
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              calcMode === "standard" ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
            onClick={() => setCalcMode("standard")}
          >
            Standard
          </button>
          <button
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              calcMode === "reverse" ? "bg-white text-primary shadow-sm" : "text-gray-500"
            }`}
            onClick={() => setCalcMode("reverse")}
          >
            Net → Gross
          </button>
        </div>
      </div>
      {calcMode === "standard" ? (
        <EmployeeForm onGenerate={handlePayslipGenerated} />
      ) : (
        <ReverseCalculator onGenerate={handlePayslipGenerated} />
      )}
    </>
  ) : activeTab === "team" ? (
    <TeamPanel />
  ) : activeTab === "history" ? (
    <HistoryPanel />
  ) : activeTab === "import" ? (
    <BulkImport />
  ) : (
    <SettingsPanel />
  );

  // ── Web: full-screen sidebar shell ───────────────────────
  if (web) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="mx-auto max-w-5xl min-h-screen flex bg-white shadow-sm">
          <aside className="w-52 shrink-0 border-r border-border flex flex-col sticky top-0 h-screen">
            <div className="p-4 border-b border-border flex items-center gap-2">
              <div className="w-8 h-8 bg-primary text-white rounded-lg flex items-center justify-center font-bold">₹</div>
              <div>
                <div className="text-sm font-bold text-gray-900 leading-tight">PaySlip</div>
                <span className={`text-[9px] font-bold uppercase tracking-wide ${pro ? "text-success" : "text-gray-400"}`}>
                  {pro ? "Pro" : "Free"}
                </span>
              </div>
            </div>
            <nav className="flex-1 p-2 space-y-1 overflow-y-auto" role="tablist" aria-label="PaySlip sections">
              {TABS.map((tab) => {
                const active = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={active}
                    onClick={() => selectTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                      active ? "bg-primary/10 text-primary" : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span aria-hidden="true">{tab.icon}</span>
                    {tab.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-3 border-t border-border text-[10px] text-gray-400">Local-first · runs in your browser</div>
          </aside>
          <main className="flex-1 min-w-0">
            <div className="max-w-[480px] mx-auto pb-10">{content}</div>
          </main>
        </div>
      </div>
    );
  }

  // ── Extension: compact popup with top tab bar ────────────
  return (
    <>
      <div className="sticky top-0 z-10 bg-white border-b border-border flex" role="tablist" aria-label="PaySlip sections">
        {TABS.map((tab) => {
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={active}
              aria-label={tab.label}
              className={`flex-1 flex flex-col items-center gap-0.5 py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset ${
                active
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
              }`}
              onClick={() => selectTab(tab.id)}
            >
              <span className="text-sm leading-none" aria-hidden="true">{tab.icon}</span>
              <span className="text-[9px] font-semibold leading-none">{tab.label === "Calculator" ? "Calc" : tab.label}</span>
            </button>
          );
        })}
      </div>
      {content}
    </>
  );
}

export default function App() {
  const web = !isExtensionRuntime();

  if (web) {
    return (
      <UpgradeProvider>
        <AppShell web />
      </UpgradeProvider>
    );
  }

  return (
    <div className="w-[380px] max-h-[580px] overflow-y-auto bg-white relative">
      <UpgradeProvider>
        <AppShell web={false} />
      </UpgradeProvider>
    </div>
  );
}
