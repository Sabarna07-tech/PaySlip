import { useState } from "react";
import type { Payslip } from "@/types";
import { savePayslip } from "@/utils/storage";
import { generatePayslipPDF } from "@/utils/pdfGenerator";
import EmployeeForm from "./components/EmployeeForm";
import SalaryBreakdown from "./components/SalaryBreakdown";
import HistoryPanel from "./components/HistoryPanel";

type Tab = "calculator" | "history";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("calculator");
  const [previewPayslip, setPreviewPayslip] = useState<Payslip | null>(null);

  const handlePayslipGenerated = (payslip: Payslip) => {
    savePayslip(payslip).catch(() => {});
    setPreviewPayslip(payslip);
  };

  const handleDownload = () => {
    if (previewPayslip) {
      generatePayslipPDF(previewPayslip);
    }
  };

  const handleBack = () => {
    setPreviewPayslip(null);
  };

  return (
    <div className="w-[380px] max-h-[580px] overflow-y-auto bg-white">
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
      </div>

      {previewPayslip ? (
        <SalaryBreakdown
          payslip={previewPayslip}
          onDownload={handleDownload}
          onBack={handleBack}
        />
      ) : activeTab === "calculator" ? (
        <EmployeeForm onGenerate={handlePayslipGenerated} />
      ) : (
        <HistoryPanel />
      )}
    </div>
  );
}
