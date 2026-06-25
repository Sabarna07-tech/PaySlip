import { useState } from "react";
import { activateOrValidate } from "@/utils/license";
import { getSettings, saveSettings } from "@/utils/settings";
import type { Payslip } from "@/types";
import { LS_CHECKOUT_URL, PRO_BENEFITS, PRO_PRICE_LABEL, FREE_MONTHLY_LIMIT } from "@/config";

interface Props {
  onClose: () => void;
  pendingPayslip: Payslip | null;
  onActivated: (payslip: Payslip) => void;
  reason?: string;
}

export default function UpgradeModal({ onClose, pendingPayslip, onActivated, reason }: Props) {
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleUpgrade = () => {
    chrome.tabs.create({ url: LS_CHECKOUT_URL });
  };

  const handleActivate = async () => {
    if (!key) return;
    setLoading(true);
    setError("");

    const result = await activateOrValidate(key.trim());

    if (result.ok) {
      const settings = await getSettings();
      settings.licenseKey = key.trim();
      await saveSettings(settings);

      onClose();
      if (pendingPayslip) {
        onActivated(pendingPayslip);
      }
    } else {
      setError(result.error || "Invalid license key");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-start p-6 text-center overflow-y-auto">
      <div className="w-full max-w-sm mx-auto flex flex-col items-center">
      <div className="w-16 h-16 bg-primary text-white rounded-2xl flex items-center justify-center text-4xl font-bold mb-5 mt-2">
        ₹
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-2">
        {reason || `You've used your ${FREE_MONTHLY_LIMIT} free payslips this month`}
      </h2>

      <p className="text-sm text-gray-600 mb-4">Unlock PaySlip Pro:</p>

      <ul className="w-full text-left space-y-1.5 mb-6">
        {PRO_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2 text-sm text-gray-700">
            <span className="text-success font-bold mt-0.5">✓</span>
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={handleUpgrade}
        className="btn-primary w-full py-3 text-base mb-6 shadow-md"
      >
        Upgrade — {PRO_PRICE_LABEL}
      </button>

      <div className="w-full text-left bg-surface p-4 rounded-xl border border-border">
        <label className="block text-xs font-bold text-gray-700 uppercase tracking-wide mb-2">
          Already have a key? Enter it
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

      <div className="mt-6 flex flex-col items-center gap-2">
        <p className="text-xs text-gray-400">Free tier resets on the 1st of each month.</p>
        <button onClick={onClose} className="btn-ghost">
          Close
        </button>
      </div>
      </div>
    </div>
  );
}
