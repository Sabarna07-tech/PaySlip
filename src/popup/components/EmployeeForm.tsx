import { useState, useEffect } from "react";
import type { Employee, Payslip } from "@/types";
import { calculatePayslip } from "@/utils/payroll";
import { getTemplates, saveTemplate, type EmployeeTemplate } from "@/utils/storage";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const now = new Date();

const defaultEmployee: Employee = {
  name: "",
  basicSalary: 0,
  hra: 0,
  conveyance: 0,
  medical: 0,
  special: 0,
  pfEmployer: false,
  esiApplicable: false,
  paidLeaves: 0,
  unpaidLeaves: 0,
  overtimeHours: 0,
  overtimeRate: 0,
  bonus: 0,
  tds: 0,
  month: MONTHS[now.getMonth()],
  year: now.getFullYear(),
};

interface Props {
  onGenerate: (payslip: Payslip) => void;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div
        className="flex items-center justify-between px-3 py-2 bg-surface cursor-pointer select-none"
        onClick={onToggle}
      >
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          {title}
        </span>
        <ChevronIcon open={open} />
      </div>
      {open && <div className="p-3 space-y-2">{children}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "number",
}: {
  label: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
}) {
  return (
    <div>
      <div className="text-[11px] text-gray-500 mb-0.5">{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white
                   focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary
                   transition-colors placeholder:text-gray-300"
        placeholder={type === "text" ? "Enter name" : "0"}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between py-1 cursor-pointer"
      onClick={() => onChange(!checked)}
    >
      <span className="text-sm text-gray-700">{label}</span>
      <div
        className={`w-9 h-5 rounded-full relative transition-colors duration-200 ${
          checked ? "bg-primary" : "bg-gray-300"
        }`}
      >
        <div
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${
            checked ? "translate-x-4" : "translate-x-0.5"
          }`}
        />
      </div>
    </div>
  );
}

export default function EmployeeForm({ onGenerate }: Props) {
  const [emp, setEmp] = useState<Employee>({ ...defaultEmployee });
  const [templates, setTemplates] = useState<EmployeeTemplate[]>([]);
  const [templateSaved, setTemplateSaved] = useState(false);
  const [sections, setSections] = useState({
    info: true,
    earnings: true,
    leaves: true,
    extras: true,
    toggles: true,
  });

  useEffect(() => {
    getTemplates().then(setTemplates);
  }, []);

  const update = <K extends keyof Employee>(key: K, value: Employee[K]) => {
    setEmp((prev) => ({ ...prev, [key]: value }));
  };

  const numChange = (key: keyof Employee) => (v: string) => {
    update(key, (parseFloat(v) || 0) as Employee[typeof key]);
  };

  const toggle = (section: keyof typeof sections) => {
    setSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCalculate = () => {
    const result = calculatePayslip(emp);
    onGenerate(result);
  };

  const handleLoadTemplate = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const tId = e.target.value;
    if (!tId) return;
    const t = templates.find(temp => temp.id === tId);
    if (t) {
      setEmp(prev => ({ ...t.employee, month: prev.month, year: prev.year }));
    }
  };

  const handleSaveTemplate = async () => {
    const newTemplate: EmployeeTemplate = {
      id: crypto.randomUUID(),
      name: emp.name || "Unnamed",
      employee: {
        name: emp.name,
        basicSalary: emp.basicSalary,
        hra: emp.hra,
        conveyance: emp.conveyance,
        medical: emp.medical,
        special: emp.special,
        pfEmployer: emp.pfEmployer,
        esiApplicable: emp.esiApplicable,
        paidLeaves: emp.paidLeaves,
        unpaidLeaves: emp.unpaidLeaves,
        overtimeHours: emp.overtimeHours,
        overtimeRate: emp.overtimeRate,
        bonus: emp.bonus,
        tds: emp.tds
      }
    };
    await saveTemplate(newTemplate);
    setTemplateSaved(true);
    getTemplates().then(setTemplates);
    setTimeout(() => setTemplateSaved(false), 1500);
  };

  return (
    <div className="p-3 space-y-2">
      {templates.length > 0 && (
        <div className="mb-2">
          <select 
            onChange={handleLoadTemplate} 
            className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            defaultValue=""
          >
            <option value="" disabled>Load template...</option>
            {templates.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      )}

      <Section title="Employee Info" open={sections.info} onToggle={() => toggle("info")}>
        <Field label="Full Name" value={emp.name} onChange={(v) => update("name", v)} type="text" />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[11px] text-gray-500 mb-0.5">Month</div>
            <select
              value={emp.month}
              onChange={(e) => update("month", e.target.value)}
              className="w-full px-2.5 py-1.5 text-sm border border-border rounded-md bg-white
                         focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-colors"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <Field label="Year" value={emp.year} onChange={(v) => update("year", parseInt(v) || now.getFullYear())} />
        </div>
      </Section>

      <Section title="Earnings" open={sections.earnings} onToggle={() => toggle("earnings")}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Basic Salary" value={emp.basicSalary} onChange={numChange("basicSalary")} />
          <Field label="HRA" value={emp.hra} onChange={numChange("hra")} />
          <Field label="Conveyance" value={emp.conveyance} onChange={numChange("conveyance")} />
          <Field label="Medical" value={emp.medical} onChange={numChange("medical")} />
        </div>
        <Field label="Special Allowance" value={emp.special} onChange={numChange("special")} />
      </Section>

      <Section title="Leaves & Overtime" open={sections.leaves} onToggle={() => toggle("leaves")}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Paid Leaves (info)" value={emp.paidLeaves} onChange={numChange("paidLeaves")} />
          <Field label="Unpaid Leaves" value={emp.unpaidLeaves} onChange={numChange("unpaidLeaves")} />
          <Field label="OT Hours" value={emp.overtimeHours} onChange={numChange("overtimeHours")} />
          <Field label="OT Rate (₹/hr)" value={emp.overtimeRate} onChange={numChange("overtimeRate")} />
        </div>
      </Section>

      <Section title="Extras" open={sections.extras} onToggle={() => toggle("extras")}>
        <div className="grid grid-cols-2 gap-2">
          <Field label="Bonus" value={emp.bonus} onChange={numChange("bonus")} />
          <Field label="TDS (manual)" value={emp.tds} onChange={numChange("tds")} />
        </div>
      </Section>

      <Section title="Statutory" open={sections.toggles} onToggle={() => toggle("toggles")}>
        <Toggle label="PF (12% of Basic)" checked={emp.pfEmployer} onChange={(v) => update("pfEmployer", v)} />
        <Toggle label="ESI (0.75% if ≤ ₹21k)" checked={emp.esiApplicable} onChange={(v) => update("esiApplicable", v)} />
      </Section>

      <div className="flex gap-2 items-center pt-1">
        <div
          className="flex-[2] text-center bg-primary text-white rounded-lg py-2.5 text-sm font-semibold
                     cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all select-none"
          onClick={handleCalculate}
        >
          Calculate Payslip
        </div>
        <div 
          className="flex-1 text-center bg-surface border border-border text-gray-700 rounded-lg py-2.5 text-sm font-semibold cursor-pointer hover:bg-gray-50 active:scale-[0.98] transition-all select-none"
          onClick={handleSaveTemplate}
        >
          {templateSaved ? <span className="text-success">Saved ✓</span> : "Save as template"}
        </div>
      </div>
    </div>
  );
}
