import { useState } from "react";
import { commitCSVPreview, previewCSV, type CsvImportPreview } from "@/utils/csvParser";
import { getSettings } from "@/utils/settings";
import { consumeQuota } from "@/utils/quota";
import { useUpgrade } from "../UpgradeContext";

export default function BulkImport() {
  const { promptUpgrade } = useUpgrade();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<CsvImportPreview | null>(null);
  const [historyLimit, setHistoryLimit] = useState(50);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setError("");
    setPreview(null);

    try {
      const settings = await getSettings();
      const result = await previewCSV(file, settings.payrollRules);
      setHistoryLimit(settings.historyLimit);
      setPreview(result);
      if (result.errors.length > 0) {
        setError(`Found ${result.errors.length} issue${result.errors.length === 1 ? "" : "s"}. Fix the CSV and upload again.`);
      } else {
        setMessage(`Preview ready: ${result.rows.length} valid record${result.rows.length === 1 ? "" : "s"}.`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse CSV");
    } finally {
      setLoading(false);
      if (e.target) {
        e.target.value = "";
      }
    }
  };

  const handleCommit = async () => {
    if (!preview || preview.errors.length > 0 || preview.rows.length === 0) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Importing N payslips consumes N from the monthly allowance (Pro = unlimited).
      const decision = await consumeQuota(preview.rows.length);
      if (!decision.allowed) {
        promptUpgrade({
          reason: `Importing ${preview.rows.length} payslips exceeds your ${decision.remaining} remaining this month.`,
        });
        return;
      }

      const imported = await commitCSVPreview(preview, historyLimit);
      setMessage(`Imported ${imported} payslip${imported === 1 ? "" : "s"}. History keeps the latest ${historyLimit}.`);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to import CSV");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-surface rounded-xl border border-border p-4 text-center">
        <div className="text-3xl mb-3">📥</div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Bulk CSV Import</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Upload a CSV file to preview payslips before importing. <br/>
          <span className="font-semibold">Required headers:</span> Name, Basic, HRA, Conveyance, PAN, Department.
        </p>
        
        <label className="cursor-pointer block relative">
          <span className={`w-full inline-block py-2 text-white border border-transparent rounded-lg text-sm font-semibold transition-colors ${loading ? "bg-gray-400" : "bg-primary hover:bg-primary/90"}`}>
            {loading ? "Processing CSV..." : "Select .CSV File"}
          </span>
          <input 
            type="file" 
            accept=".csv,text/csv" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
        
        {message && <div className="mt-3 text-xs font-bold text-success bg-success/10 py-1.5 rounded-md">{message}</div>}
        {error && <div className="mt-3 text-xs font-bold text-danger bg-danger/10 py-1.5 rounded-md whitespace-pre-wrap">{error}</div>}
      </div>

      {preview && (
        <div className="bg-white border border-border rounded-lg p-3 space-y-3">
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700">Rows scanned</span>
            <span>{preview.totalRows}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700">Valid payslips</span>
            <span className="text-success font-bold">{preview.rows.length}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="font-semibold text-gray-700">Errors</span>
            <span className={preview.errors.length ? "text-danger font-bold" : "text-success font-bold"}>{preview.errors.length}</span>
          </div>

          {preview.errors.length > 0 && (
            <div className="max-h-32 overflow-y-auto rounded border border-danger/20 bg-danger/5 p-2 text-left">
              {preview.errors.slice(0, 20).map((item, index) => (
                <div key={`${item.rowNumber}-${index}`} className="text-[11px] text-danger mb-1">
                  Row {item.rowNumber}: {item.message}
                </div>
              ))}
            </div>
          )}

          {preview.errors.length === 0 && (
            <button
              onClick={handleCommit}
              disabled={loading || preview.rows.length === 0}
              className="btn-primary w-full disabled:opacity-50"
            >
              Import Previewed Payslips
            </button>
          )}
        </div>
      )}
    </div>
  );
}
