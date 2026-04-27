import { useState } from "react";
import { processCSV } from "@/utils/csvParser";

export default function BulkImport() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setMessage("");
    setError("");

    try {
      const count = await processCSV(file);
      setMessage(`Successfully imported and processed ${count} records.`);
    } catch (err: any) {
      setError(err.message || "Failed to parse CSV");
    } finally {
      setLoading(false);
      if (e.target) {
        e.target.value = ""; // reset file input
      }
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="bg-surface rounded-xl border border-border p-4 text-center">
        <div className="text-3xl mb-3">📥</div>
        <h3 className="text-sm font-bold text-gray-800 mb-2">Bulk CSV Import</h3>
        <p className="text-xs text-gray-500 mb-4 leading-relaxed">
          Upload a CSV file to automatically generate payslips in bulk. <br/>
          <span className="font-semibold">Required headers:</span> Name, Basic, HRA, Conveyance, PAN, Department.
        </p>
        
        <label className="cursor-pointer block relative">
          <span className={`w-full inline-block py-2 text-white border border-transparent rounded-lg text-sm font-semibold transition-colors ${loading ? 'bg-gray-400' : 'bg-primary hover:bg-primary/90'}`}>
            {loading ? "Processing CSV..." : "Select .CSV File"}
          </span>
          <input 
            type="file" 
            accept=".csv" 
            className="hidden" 
            onChange={handleFileChange}
            disabled={loading}
          />
        </label>
        
        {message && <div className="mt-3 text-xs font-bold text-success bg-success/10 py-1.5 rounded-md">{message}</div>}
        {error && <div className="mt-3 text-xs font-bold text-danger bg-danger/10 py-1.5 rounded-md">{error}</div>}
      </div>
    </div>
  );
}
