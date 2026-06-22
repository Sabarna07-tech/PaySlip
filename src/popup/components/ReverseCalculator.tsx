import { useState } from "react";
import type { Payslip } from "@/types";
import { getSettings } from "@/utils/settings";
import { formatINR } from "@/utils/payroll";
import {
  solveGrossForNet,
  DEFAULT_COMPOSITION,
  type ReverseResult,
  type SalaryComposition,
} from "@/utils/reverseCalc";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const now = new Date();

const COMPOSITION_FIELDS: { key: keyof SalaryComposition; label: string }[] = [
  { key: "basic", label: "Basic %" },
  { key: "hra", label: "HRA %" },
  { key: "conveyance", label: "Conveyance %" },
  { key: "medical", label: "Medical %" },
  { key: "special", label: "Special %" },
];

interface Props {
  onGenerate: (payslip: Payslip) => void;
}

export default function ReverseCalculator({ onGenerate }: Props) {
  const [targetNet, setTargetNet] = useState("");
  const [name, setName] = useState("");
  const [month, setMonth] = useState(MONTHS[now.getMonth()]);
  const [year, setYear] = useState(now.getFullYear());
  const [pfEmployer, setPfEmployer] = useState(true);
  const [esiApplicable, setEsiApplicable] = useState(false);
  const [tds, setTds] = useState("");
  const [showStructure, setShowStructure] = useState(false);
  const [comp, setComp] = useState<SalaryComposition>({ ...DEFAULT_COMPOSITION });
  const [result, setResult] = useState<ReverseResult | null>(null);

  const compPct = (key: keyof SalaryComposition) => Math.round(comp[key] * 100);
  const compSum = COMPOSITION_FIELDS.reduce((s, f) => s + compPct(f.key), 0);

  const handleSolve = async () => {
    const net = parseFloat(targetNet);
    if (Number.isNaN(net) || net <= 0) return;

    const settings = await getSettings();
    const r = solveGrossForNet(
      net,
      {
        composition: comp,
        pfEmployer,
        esiApplicable,
        tds: parseFloat(tds) || 0,
        meta: { name, month, year },
      },
      settings.payrollRules
    );
    setResult(r);
  };

  return (
    <div className="p-3 space-y-3">
      <p className="text-[11px] text-gray-500 leading-snug">
        Enter the take-home pay you want an employee to receive and we'll work backwards
        to the gross salary and full breakdown.
      </p>

      <div>
        <div className="text-[11px] text-gray-500 mb-0.5">Desired Net (take-home) Pay</div>
        <input
          type="number"
          min={0}
          value={targetNet}
          onChange={(e) => setTargetNet(e.target.value)}
          className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          placeholder="e.g. 50000"
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <div className="text-[11px] text-gray-500 mb-0.5">Employee Name</div>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="Optional"
          />
        </div>
        <div>
          <div className="text-[11px] text-gray-500 mb-0.5">Manual TDS</div>
          <input
            type="number"
            min={0}
            value={tds}
            onChange={(e) => setTds(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
            placeholder="0"
          />
        </div>
        <div>
          <div className="text-[11px] text-gray-500 mb-0.5">Month</div>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            {MONTHS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="text-[11px] text-gray-500 mb-0.5">Year</div>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value) || now.getFullYear())}
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={pfEmployer} onChange={(e) => setPfEmployer(e.target.checked)} />
          PF
        </label>
        <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={esiApplicable} onChange={(e) => setEsiApplicable(e.target.checked)} />
          ESI
        </label>
      </div>

      <div className="border border-border rounded-lg overflow-hidden">
        <div
          className="flex items-center justify-between px-3 py-2 bg-surface cursor-pointer select-none"
          onClick={() => setShowStructure((s) => !s)}
        >
          <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
            Salary Structure ({compSum}%)
          </span>
          <span className="text-xs text-gray-400">{showStructure ? "Hide" : "Edit"}</span>
        </div>
        {showStructure && (
          <div className="p-3 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              {COMPOSITION_FIELDS.map((f) => (
                <div key={f.key}>
                  <div className="text-[11px] text-gray-500 mb-0.5">{f.label}</div>
                  <input
                    type="number"
                    min={0}
                    value={compPct(f.key)}
                    onChange={(e) =>
                      setComp((c) => ({ ...c, [f.key]: Math.max(0, Number(e.target.value) || 0) / 100 }))
                    }
                    className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                  />
                </div>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">
              Percentages are normalised automatically, so they don't have to total exactly 100.
            </p>
          </div>
        )}
      </div>

      <button
        onClick={handleSolve}
        className="w-full text-center bg-primary text-white rounded-lg py-2.5 text-sm font-semibold cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all select-none"
      >
        Calculate Gross
      </button>

      {result && (
        <div className="bg-surface border border-border rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">Required Gross</span>
            <span className="text-lg font-bold text-primary">{formatINR(result.gross)}</span>
          </div>

          <div className="text-[11px] text-gray-600 space-y-1 border-t border-border pt-2">
            <Row label="Gross Earnings" value={result.payslip.earnings.total} />
            <Row label="Total Deductions" value={-result.payslip.deductions.total} />
            <div className="flex justify-between font-bold text-gray-900 pt-1 border-t border-border">
              <span>Net Pay</span>
              <span className="text-success">{formatINR(result.achievedNet)}</span>
            </div>
          </div>

          {!result.exact && (
            <p className="text-[10px] text-danger">
              Closest achievable net is {formatINR(result.achievedNet)} (statutory rounding/steps
              prevent an exact match).
            </p>
          )}

          <button
            onClick={() => onGenerate(result.payslip)}
            className="w-full text-center bg-gray-800 text-white rounded-lg py-2 text-sm font-semibold cursor-pointer hover:bg-gray-900 active:scale-[0.98] transition-all select-none"
          >
            Use as Payslip →
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-medium">{formatINR(value)}</span>
    </div>
  );
}
