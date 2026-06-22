import { useState, useEffect } from "react";
import {
  DEFAULT_HISTORY_LIMIT,
  DEFAULT_PAYROLL_RULES,
  getSettings,
  saveSettings,
  type AppSettings,
} from "@/utils/settings";
import { validateLicense } from "@/utils/license";
import {
  clearPayslips,
  clearTemplates,
  exportBackupData,
  restoreBackupData,
} from "@/utils/storage";
import type { PayrollRules } from "@/types";
import { LS_STORE_URL, PDF_THEMES } from "@/config";
import { usePro } from "../usePro";

const LS_URL = LS_STORE_URL;
const MAX_LOGO_BYTES = 300 * 1024;
const MAX_LOGO_DIMENSION = 1024;

export default function SettingsPanel() {
  const { pro, refresh: refreshPro } = usePro();
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "",
    companyAddress: "",
    licenseKey: "",
    companyLogoBase64: "",
    historyLimit: DEFAULT_HISTORY_LIMIT,
    payrollRules: DEFAULT_PAYROLL_RULES,
    pdfTheme: "classic",
  });
  const [saved, setSaved] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [licenseStatus, setLicenseStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = <K extends keyof AppSettings>(field: K, value: AppSettings[K]) => {
    setSettings(s => ({ ...s, [field]: value }));
    setSaved(false);
    setErrorMessage("");
    setStatusMessage("");
    if (field === "licenseKey") {
      setLicenseStatus("idle");
    }
  };

  const updatePayrollRule = <K extends keyof PayrollRules>(field: K, value: PayrollRules[K]) => {
    setSettings(s => ({
      ...s,
      payrollRules: {
        ...s.payrollRules,
        [field]: value,
      },
    }));
    setSaved(false);
  };

  const handleSave = async () => {
    try {
      await saveSettings(settings);
      setSaved(true);
      setStatusMessage("Settings saved.");
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to save settings.");
    }
  };

  const handleVerify = async () => {
    setLicenseStatus("verifying");
    const isValid = await validateLicense(settings.licenseKey);
    setLicenseStatus(isValid ? "valid" : "invalid");
    if (isValid) refreshPro();
  };

  const handleExportData = async () => {
    const data = await exportBackupData();
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `payslip_backup_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const validateLogoDimensions = (dataUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        if (image.width > MAX_LOGO_DIMENSION || image.height > MAX_LOGO_DIMENSION) {
          reject(new Error(`Logo must be ${MAX_LOGO_DIMENSION}x${MAX_LOGO_DIMENSION}px or smaller.`));
          return;
        }
        resolve();
      };
      image.onerror = () => reject(new Error("Logo file could not be read as an image."));
      image.src = dataUrl;
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setErrorMessage("");
      setStatusMessage("");

      if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
        setErrorMessage("Logo must be PNG, JPEG, or WebP.");
        e.target.value = "";
        return;
      }

      if (file.size > MAX_LOGO_BYTES) {
        setErrorMessage("Logo must be 300 KB or smaller.");
        e.target.value = "";
        return;
      }

      const reader = new FileReader();
      reader.onloadend = async () => {
        try {
          const dataUrl = reader.result as string;
          await validateLogoDimensions(dataUrl);
          update("companyLogoBase64", dataUrl);
        } catch (err) {
          setErrorMessage(err instanceof Error ? err.message : "Invalid logo file.");
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = "";
  };

  const handleClearPayslips = async () => {
    if (!confirm("Clear all saved payslip history?")) return;
    await clearPayslips();
    setStatusMessage("Payslip history cleared.");
  };

  const handleClearTemplates = async () => {
    if (!confirm("Clear all saved employee templates?")) return;
    await clearTemplates();
    setStatusMessage("Employee templates cleared.");
  };

  const handleRestoreData = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage("");
    setStatusMessage("");

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await restoreBackupData(data, settings.historyLimit);
      setStatusMessage("Backup restored.");
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : "Failed to restore backup.");
    } finally {
      e.target.value = "";
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Name</label>
        <input
          type="text"
          value={settings.companyName}
          onChange={(e) => update("companyName", e.target.value)}
          className="input-field"
          placeholder="e.g. Acme Corp"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Logo</label>
        <div className="flex items-center gap-3">
          {settings.companyLogoBase64 && (
            <img src={settings.companyLogoBase64} alt="Logo" className="h-8 w-8 object-contain rounded border border-border" />
          )}
          <input
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleLogoUpload}
            className="text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
          />
          {settings.companyLogoBase64 && (
            <button 
              onClick={() => update("companyLogoBase64", "")}
              className="text-xs text-danger hover:underline"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">Company Address</label>
        <input
          type="text"
          value={settings.companyAddress}
          onChange={(e) => update("companyAddress", e.target.value)}
          className="input-field"
          placeholder="e.g. 123 Business Rd"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-600 mb-1">
          PDF Theme
          {!pro && <span className="ml-1 text-[10px] text-primary font-bold">Pro themes 🔒</span>}
        </label>
        <select
          value={settings.pdfTheme}
          onChange={(e) => update("pdfTheme", e.target.value as AppSettings["pdfTheme"])}
          className="input-field"
        >
          {PDF_THEMES.map((t) => (
            <option key={t.id} value={t.id} disabled={t.pro && !pro}>
              {t.label}{t.pro ? " (Pro)" : ""}{t.pro && !pro ? " 🔒" : ""}
            </option>
          ))}
        </select>
        {!pro && settings.pdfTheme !== "classic" && (
          <p className="text-[10px] text-gray-400 mt-1">
            Premium themes and your logo apply once PaySlip Pro is active; PDFs use the Classic theme until then.
          </p>
        )}
      </div>

      <div className="pt-2 border-t border-border">
        <label className="block text-xs font-semibold text-gray-600 mb-1">License Key (PaySlip Pro)</label>
        <input
          type="text"
          value={settings.licenseKey}
          onChange={(e) => update("licenseKey", e.target.value)}
          className="input-field"
          placeholder="XXXX-XXXX-XXXX-XXXX"
        />
        {settings.licenseKey && (
          <div className="mt-2 flex items-center justify-between">
            <button
              onClick={handleVerify}
              disabled={licenseStatus === "verifying"}
              className="text-xs font-medium text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
            >
              {licenseStatus === "verifying" ? "Verifying..." : "Verify License"}
            </button>
            {licenseStatus === "valid" && <span className="text-xs font-bold text-success">✓ Active</span>}
            {licenseStatus === "invalid" && <span className="text-xs font-bold text-danger">✗ Invalid</span>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button onClick={handleSave} className="btn-primary flex-1">
          Save Settings
        </button>
        {saved && <span className="text-sm font-medium text-success w-16 text-center">Saved ✓</span>}
      </div>

      {(statusMessage || errorMessage) && (
        <div className={`text-xs font-semibold rounded-md p-2 ${errorMessage ? "text-danger bg-danger/10" : "text-success bg-success/10"}`}>
          {errorMessage || statusMessage}
        </div>
      )}

      <div className="pt-4 border-t border-border space-y-3">
        <h3 className="text-sm font-bold text-gray-800">Payroll Rules</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Working Days</label>
            <input type="number" min={1} value={settings.payrollRules.workingDays} onChange={(e) => updatePayrollRule("workingDays", Math.max(1, Number(e.target.value) || 1))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PF Ceiling</label>
            <input type="number" min={0} value={settings.payrollRules.pfBasicCeiling} onChange={(e) => updatePayrollRule("pfBasicCeiling", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PF Rate</label>
            <input type="number" min={0} step={0.001} value={settings.payrollRules.pfRate} onChange={(e) => updatePayrollRule("pfRate", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ESI Threshold</label>
            <input type="number" min={0} value={settings.payrollRules.esiGrossThreshold} onChange={(e) => updatePayrollRule("esiGrossThreshold", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">ESI Rate</label>
            <input type="number" min={0} step={0.0001} value={settings.payrollRules.esiRate} onChange={(e) => updatePayrollRule("esiRate", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PT Threshold</label>
            <input type="number" min={0} value={settings.payrollRules.professionalTaxThreshold} onChange={(e) => updatePayrollRule("professionalTaxThreshold", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">PT Amount</label>
            <input type="number" min={0} value={settings.payrollRules.professionalTaxAmount} onChange={(e) => updatePayrollRule("professionalTaxAmount", Math.max(0, Number(e.target.value) || 0))} className="input-field" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">History Limit</label>
            <input type="number" min={1} value={settings.historyLimit} onChange={(e) => update("historyLimit", Math.max(1, Number(e.target.value) || 1))} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-600 mb-1">Tax Year Label</label>
          <input type="text" value={settings.payrollRules.taxYear} onChange={(e) => updatePayrollRule("taxYear", e.target.value)} className="input-field" />
        </div>
      </div>

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Data Management</h3>
        <p className="text-xs text-gray-500 mb-3">
          Export, restore, or clear local payslip history and saved templates.
        </p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={handleExportData}
            className="py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-xs font-semibold transition-colors"
          >
            ⬇ Export JSON
          </button>
          <label className="py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-xs font-semibold transition-colors text-center cursor-pointer">
            ⬆ Restore JSON
            <input type="file" accept="application/json,.json" onChange={handleRestoreData} className="hidden" />
          </label>
          <button 
            onClick={handleClearPayslips}
            className="py-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-lg text-xs font-semibold transition-colors"
          >
            Clear History
          </button>
          <button 
            onClick={handleClearTemplates}
            className="py-2 bg-danger/10 text-danger hover:bg-danger/20 border border-danger/20 rounded-lg text-xs font-semibold transition-colors"
          >
            Clear Templates
          </button>
        </div>
      </div>

      <div className="text-center mt-6">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); chrome.tabs.create({ url: LS_URL }); }}
          className="text-xs text-primary hover:underline"
        >
          Get a license key →
        </a>
      </div>
    </div>
  );
}
