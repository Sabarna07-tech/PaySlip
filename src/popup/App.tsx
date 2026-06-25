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
import WebLayout from "./WebLayout";
import Landing from "./components/Landing";
import { Icon, type IconName } from "./components/icons";

type Tab = "home" | "calculator" | "team" | "history" | "import" | "settings";
type CalcMode = "standard" | "reverse";

const TABS: { id: Tab; icon: IconName; label: string }[] = [
  { id: "home", icon: "home", label: "Home" },
  { id: "calculator", icon: "calculator", label: "Calculator" },
  { id: "team", icon: "users", label: "Team" },
  { id: "history", icon: "history", label: "History" },
  { id: "import", icon: "import", label: "Import" },
  { id: "settings", icon: "settings", label: "Settings" },
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
      <WebLayout
        tabs={TABS}
        activeId={activeTab}
        onSelect={(id) => selectTab(id as Tab)}
        pro={pro}
        onGetPro={() => promptUpgrade({ reason: "Unlock PaySlip Pro" })}
      >
        {content}
      </WebLayout>
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
              className={`flex-1 flex flex-col items-center gap-1 py-2 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-inset ${
                active
                  ? "text-primary border-b-2 border-primary"
                  : "text-gray-400 hover:text-gray-600 border-b-2 border-transparent"
              }`}
              onClick={() => selectTab(tab.id)}
            >
              <Icon name={tab.icon} className="w-4 h-4" />
              <span className="text-[9px] font-semibold leading-none">{tab.label === "Calculator" ? "Calc" : tab.label}</span>
            </button>
          );
        })}
      </div>
      {content}
    </>
  );
}

/** Web root: shows the marketing landing page until the user launches the app. */
function WebRoot() {
  const [entered, setEntered] = useState(() => {
    try {
      return localStorage.getItem("payslip_launched") === "1" || window.location.hash === "#app";
    } catch {
      return false;
    }
  });

  if (!entered) {
    return (
      <Landing
        onLaunch={() => {
          try {
            localStorage.setItem("payslip_launched", "1");
          } catch {
            /* private mode / storage disabled — still enter the app */
          }
          setEntered(true);
        }}
      />
    );
  }

  return <AppShell web />;
}

export default function App() {
  const web = !isExtensionRuntime();

  if (web) {
    return (
      <UpgradeProvider>
        <WebRoot />
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
