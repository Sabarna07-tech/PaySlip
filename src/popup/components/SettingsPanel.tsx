import { useState, useEffect } from "react";
import { getSettings, saveSettings, type AppSettings } from "@/utils/settings";
import { validateLicense } from "@/utils/license";

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
