import { useState } from "react";
import type { Employee } from "@/types";
import { saveTemplate, type EmployeeTemplate } from "@/utils/storage";
import { calculatePayslip, formatINR } from "@/utils/payroll";
import { DEFAULT_PAYROLL_RULES } from "@/utils/settings";
import { fieldHint, clampText } from "@/utils/validation";
import type { RosterEmployee } from "@/utils/payRun";

const defaultRoster: RosterEmployee = {
  name: "", pan: "", uan: "", department: "", designation: "", bankAccount: "",
  lta: 0, customAllowances: [], basicSalary: 0, hra: 0, conveyance: 0, medical: 0,
  special: 0, pfEmployer: false, esiApplicable: false, paidLeaves: 0, unpaidLeaves: 0,
  overtimeHours: 0, overtimeRate: 0, bonus: 0, tds: 0, taxRegime: "new",
};

interface Props {
  initial?: EmployeeTemplate;
  onSaved: () => void;
  onCancel: () => void;
}

const cls =
  "w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

export default function EmployeeEditor({ initial, onSaved, onCancel }: Props) {
  const [emp, setEmp] = useState<RosterEmployee>({ ...defaultRoster, ...(initial?.employee ?? {}) });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof RosterEmployee>(key: K, value: RosterEmployee[K]) =>
    setEmp((p) => ({ ...p, [key]: value }));
  const num = (key: keyof RosterEmployee) => (v: string) =>
    set(key, (Math.max(0, parseFloat(v) || 0)) as RosterEmployee[typeof key]);

  const allowances = emp.customAllowances || [];
  const updateAllowance = (i: number, field: "name" | "amount", value: string | number) =>
    set("customAllowances", allowances.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));

  const preview = calculatePayslip({ ...emp, month: "—", year: 0 } as Employee, DEFAULT_PAYROLL_RULES);
  const panHint = fieldHint("pan", emp.pan);
  const uanHint = fieldHint("uan", emp.uan);

  const handleSave = async () => {
    if (!emp.name.trim()) {
      setError("Employee name is required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const template: EmployeeTemplate = {
        id: initial?.id ?? crypto.randomUUID(),
        name: clampText(emp.name.trim(), 80),
        employee: emp,
      };
      await saveTemplate(template);
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save employee.");
      setSaving(false);
    }
  };

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-800">{initial ? "Edit Employee" : "Add Employee"}</h3>
        <button onClick={onCancel} className="text-xs text-gray-500 hover:text-gray-800">
          ← Back
        </button>
      </div>

      <Labeled label="Full Name">
        <input className={cls} value={emp.name} onChange={(e) => set("name", clampText(e.target.value, 80))} placeholder="e.g. Asha Verma" />
      </Labeled>

      <div className="grid grid-cols-2 gap-2">
        <Labeled label="Designation">
          <input className={cls} value={emp.designation || ""} onChange={(e) => set("designation", clampText(e.target.value))} />
        </Labeled>
        <Labeled label="Department">
          <input className={cls} value={emp.department || ""} onChange={(e) => set("department", clampText(e.target.value))} />
        </Labeled>
        <Labeled label="PAN" hint={panHint}>
          <input className={cls} value={emp.pan || ""} onChange={(e) => set("pan", e.target.value.toUpperCase())} placeholder="ABCDE1234F" />
        </Labeled>
        <Labeled label="UAN" hint={uanHint}>
          <input className={cls} value={emp.uan || ""} onChange={(e) => set("uan", e.target.value)} placeholder="12 digits" />
        </Labeled>
      </div>

      <Labeled label="Bank Account">
        <input className={cls} value={emp.bankAccount || ""} onChange={(e) => set("bankAccount", clampText(e.target.value, 40))} />
      </Labeled>

      <div className="border-t border-border pt-2">
        <div className="text-[11px] font-bold text-gray-500 uppercase tracking-wide mb-2">Monthly Earnings</div>
        <div className="grid grid-cols-2 gap-2">
          <NumField label="Basic" value={emp.basicSalary} onChange={num("basicSalary")} />
          <NumField label="HRA" value={emp.hra} onChange={num("hra")} />
          <NumField label="Conveyance" value={emp.conveyance} onChange={num("conveyance")} />
          <NumField label="Medical" value={emp.medical} onChange={num("medical")} />
          <NumField label="Special" value={emp.special} onChange={num("special")} />
          <NumField label="LTA" value={emp.lta || 0} onChange={num("lta")} />
          <NumField label="Bonus" value={emp.bonus} onChange={num("bonus")} />
          <NumField label="Default TDS" value={emp.tds} onChange={num("tds")} />
        </div>
      </div>

      {allowances.length > 0 && (
        <div className="space-y-2">
          {allowances.map((a, i) => (
            <div key={i} className="flex gap-2 items-center">
              <input className={`${cls} flex-[2]`} value={a.name} onChange={(e) => updateAllowance(i, "name", e.target.value)} placeholder="Allowance name" />
              <input type="number" min={0} className={`${cls} flex-1`} value={a.amount || ""} onChange={(e) => updateAllowance(i, "amount", Math.max(0, Number(e.target.value) || 0))} placeholder="0" />
              <button onClick={() => set("customAllowances", allowances.filter((_, idx) => idx !== i))} aria-label="Remove allowance" className="px-2 text-danger hover:bg-danger/10 rounded">✕</button>
            </div>
          ))}
        </div>
      )}
      <button
        onClick={() => set("customAllowances", [...allowances, { name: "", amount: 0 }])}
        className="w-full py-1.5 text-[11px] font-bold text-primary bg-primary/10 rounded border border-primary/20 hover:bg-primary/20"
      >
        + Add custom allowance
      </button>

      <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
        <Check label="New Regime" checked={emp.taxRegime === "new"} onChange={(v) => set("taxRegime", v ? "new" : "old")} />
        <Check label="PF" checked={emp.pfEmployer} onChange={(v) => set("pfEmployer", v)} />
        <Check label="ESI" checked={emp.esiApplicable} onChange={(v) => set("esiApplicable", v)} />
      </div>

      <div className="bg-surface border border-border rounded-lg px-3 py-2 flex justify-between text-sm">
        <span className="text-gray-600">Est. Net / month</span>
        <span className="font-bold text-success">{formatINR(preview.netPay)}</span>
      </div>

      {error && <div className="text-xs text-danger bg-danger/10 rounded p-2 font-medium">{error}</div>}

      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50">
          {saving ? "Saving…" : "Save Employee"}
        </button>
        <button onClick={onCancel} className="flex-1 py-2.5 bg-gray-100 text-gray-600 rounded-lg text-sm font-semibold hover:bg-gray-200 active:scale-[0.98] transition-all">
          Cancel
        </button>
      </div>
    </div>
  );
}

function Labeled({ label, hint, children }: { label: string; hint?: string | null; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      {children}
      {hint && <div className="text-[10px] text-danger mt-0.5">{hint}</div>}
    </div>
  );
}

function NumField({ label, value, onChange }: { label: string; value: number; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <input type="number" min={0} className={cls} value={value === 0 ? "" : value} onChange={(e) => onChange(e.target.value)} placeholder="0" />
    </div>
  );
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-1.5 text-sm text-gray-700 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}
