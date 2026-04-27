import { useState } from "react";
import { validateLicense } from "@/utils/license";
import { getSettings, saveSettings } from "@/utils/settings";
import type { Payslip } from "@/types";

interface Props {
  onClose: () => void;
  pendingPayslip: Payslip | null;
  onActivated: (payslip: Payslip) => void;
}

const LS_URL = "https://payslip1.lemonsqueezy.com";

export default function UpgradeModal({ onClose, pendingPayslip, onActivated }: Props) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = () => {
    chrome.tabs.create({ url: LS_URL });
  };

  const handleActivate = async () => {
    if (!key) return;
    setLoading(true);
    setError("");

    const isValid = await validateLicense(key);
    
    if (isValid) {
      const settings = await getSettings();
      settings.licenseKey = key;
      await saveSettings(settings);
      await chrome.storage.local.remove("licenseStatus");
      
      onClose();
      if (pendingPayslip) {
        onActivated(pendingPayslip);
      }
    } else {
      setError("Invalid license key");
    }
    setLoading(false);
  };

  return (
    <div className="absolute inset-0 bg-white z-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-4xl font-bold mb-6">
        ₹
      </div>
      
      <h2 className="text-lg font-bold text-gray-900 mb-2">
        You've used your 2 free payslips this month
      </h2>
      
      <p className="text-sm text-gray-600 mb-8">
        Upgrade to PaySlip Pro for unlimited payslips, company branding, and employee templates.
      </p>
      
      <button 
        onClick={handleUpgrade}
        className="btn-primary w-full py-3 text-base mb-8 shadow-md"
      >
        Upgrade — ₹199/mo
      </button>

      <div className="w-full text-left bg-surface p-4 rounded-xl border border-border">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          Enter License Key
        </label>
        <input
          type="text"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          className="input-field mb-2"
          placeholder="XXXX-XXXX-XXXX-XXXX"
        />
        {error && <div className="text-xs text-danger mb-2 font-medium">{error}</div>}
        <button 
          onClick={handleActivate}
          disabled={loading || !key}
          className="w-full py-2 bg-gray-800 text-white rounded-lg text-sm font-medium hover:bg-gray-900 transition-colors disabled:opacity-50"
        >
          {loading ? "Activating..." : "Activate"}
        </button>
      </div>

      <div className="mt-8 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-400">
          Free tier resets on the 1st of each month.
        </p>
        <button onClick={onClose} className="btn-ghost">
          Close
        </button>
      </div>
    </div>
  );
}
