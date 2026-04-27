import { useState, useEffect } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/utils/settings";
import { validateLicense } from "@/utils/license";
import { getPayslips, getTemplates } from "@/utils/storage";

const LS_URL = "https://payslip1.lemonsqueezy.com";

export default function SettingsPanel() {
  const [settings, setSettings] = useState<AppSettings>({
    companyName: "",
    companyAddress: "",
    licenseKey: "",
  });
  const [saved, setSaved] = useState(false);
  const [licenseStatus, setLicenseStatus] = useState<"idle" | "verifying" | "valid" | "invalid">("idle");

  useEffect(() => {
    getSettings().then(setSettings);
  }, []);

  const update = (field: keyof AppSettings, value: string) => {
    setSettings(s => ({ ...s, [field]: value }));
    setSaved(false);
    if (field === "licenseKey") {
      setLicenseStatus("idle");
    }
  };

  const handleSave = async () => {
    await saveSettings(settings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleVerify = async () => {
    setLicenseStatus("verifying");
    const isValid = await validateLicense(settings.licenseKey);
    setLicenseStatus(isValid ? "valid" : "invalid");
  };

  const handleExportData = async () => {
    const payslips = await getPayslips();
    const templates = await getTemplates();
    const data = { payslips, templates };
    
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        update("companyLogoBase64", reader.result as string);
      };
      reader.readAsDataURL(file);
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

      <div className="pt-4 border-t border-border">
        <h3 className="text-sm font-bold text-gray-800 mb-2">Data Management</h3>
        <p className="text-xs text-gray-500 mb-3">
          Export your entire local history and saved templates as a JSON backup.
        </p>
        <button 
          onClick={handleExportData}
          className="w-full py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 border border-border rounded-lg text-sm font-semibold transition-colors"
        >
          ⬇ Export All Data (JSON)
        </button>
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
