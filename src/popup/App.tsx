import { useState, useEffect } from "react";
import type { Payslip } from "@/types";
import { savePayslip } from "@/utils/storage";
import { generatePayslipPDF } from "@/utils/pdfGenerator";
import EmployeeForm from "./components/EmployeeForm";
import SalaryBreakdown from "./components/SalaryBreakdown";
import HistoryPanel from "./components/HistoryPanel";
import SettingsPanel from "./components/SettingsPanel";
import UpgradeModal from "./components/UpgradeModal";
import { getSettings } from "@/utils/settings";
import { isOverLimit, incrementQuota } from "@/utils/quota";

type Tab = "calculator" | "history" | "settings";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [previewPayslip, setPreviewPayslip] = useState<Payslip | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [pendingPayslip, setPendingPayslip] = useState<Payslip | null>(null);

  // Load settings on mount just to cache them or ensure they are ready, 
  // though we fetch them freshly in handlePayslipGenerated.
  useEffect(() => {
    getSettings();
  }, []);

  const handlePayslipGenerated = async (payslip: Payslip) => {
    const settings = await getSettings();
    const overLimit = await isOverLimit(settings.licenseKey);
    
    if (overLimit) {
      setPendingPayslip(payslip);
      setShowUpgradeModal(true);
    } else {
      await incrementQuota();
      savePayslip(payslip).catch(() => {});
      setPreviewPayslip(payslip);
    }
  };

  const handleDownload = async () => {
    if (previewPayslip) {
      await generatePayslipPDF(previewPayslip);
    }
  };

  const handleBack = () => {
    setPreviewPayslip(null);
  };

  const handleModalActivated = (payslip: Payslip) => {
    savePayslip(payslip).catch(() => {});
    setPreviewPayslip(payslip);
  };

  return (
    <div className="w-[380px] max-h-[580px] overflow-y-auto bg-white relative">
      <div className="sticky top-0 z-10 bg-white border-b border-border flex">
        <div
          className={`flex-1 text-center py-3 text-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "calculator"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("calculator");
            setPreviewPayslip(null);
          }}
        >
          💰 Calculator
        </div>
        <div
          className={`flex-1 text-center py-3 text-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "history"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("history");
            setPreviewPayslip(null);
          }}
        >
          📋 History
        </div>
        <div
          className={`flex-1 text-center py-3 text-sm font-semibold cursor-pointer transition-colors ${
            activeTab === "settings"
              ? "text-primary border-b-2 border-primary"
              : "text-gray-400 hover:text-gray-600"
          }`}
          onClick={() => {
            setActiveTab("settings");
            setPreviewPayslip(null);
          }}
        >
          ⚙ Settings
        </div>
      </div>

      {showUpgradeModal && (
        <UpgradeModal 
          onClose={() => setShowUpgradeModal(false)}
          pendingPayslip={pendingPayslip}
          onActivated={handleModalActivated}
        />
      )}

      {previewPayslip ? (
        <SalaryBreakdown
          payslip={previewPayslip}
          onDownload={handleDownload}
          onBack={handleBack}
        />
      ) : activeTab === "calculator" ? (
        <EmployeeForm onGenerate={handlePayslipGenerated} />
      ) : activeTab === "history" ? (
        <HistoryPanel />
      ) : (
        <SettingsPanel />
      )}
    </div>
  );
}
