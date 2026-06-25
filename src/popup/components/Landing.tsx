import { CHROME_STORE_URL, LS_STORE_URL, PRO_PRICE_LABEL } from "@/config";
import { openExternal } from "@/utils/platform";
import { Icon, type IconName } from "./icons";

interface Props {
  onLaunch: () => void;
}

const FEATURES: { icon: IconName; title: string; body: string }[] = [
  { icon: "calculator", title: "Instant payslips", body: "Gross, PF, ESI, TDS, PT and net pay computed as you type — Indian statutory rules built in." },
  { icon: "history", title: "Professional PDFs", body: "Clean A4 salary slips with your company name, logo and address. Bulk-export a whole month as a ZIP." },
  { icon: "users", title: "Team pay runs", body: "Keep your roster and generate everyone's payslips for a month in a single click." },
  { icon: "chart", title: "Reports & dashboard", body: "Payroll trends, cost by department, and an annual salary register you can export to CSV or PDF." },
  { icon: "shield", title: "Private by design", body: "Everything runs in your browser. No sign-up, no servers, no tracking — your salary data never leaves your device." },
  { icon: "sparkles", title: "Net → Gross", body: "Enter the take-home you want; PaySlip works backwards to the gross and full breakdown." },
];

const FREE = ["3 payslips / month", "Full calculator + Net→Gross", "Single PDF download", "CSV import, history, templates"];
const PRO = ["Unlimited payslips", "Bulk ZIP export", "Annual reports (CSV/PDF)", "Premium PDF themes + branding"];

export default function Landing({ onLaunch }: Props) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 text-gray-900">
      {/* Top bar */}
      <header className="sticky top-0 z-10 backdrop-blur bg-white/70 border-b border-border">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary text-white rounded-xl flex items-center justify-center text-lg font-bold shadow">₹</div>
            <span className="text-lg font-extrabold">PaySlip</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openExternal(CHROME_STORE_URL)}
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-lg border border-border bg-white text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <Icon name="chrome" className="w-4 h-4" /> Add to Chrome
            </button>
            <button
              onClick={onLaunch}
              className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-semibold shadow-sm shadow-primary/30 hover:opacity-90 transition-opacity"
            >
              Launch app
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-5 pt-14 pb-10 text-center">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/10 rounded-full px-3 py-1 mb-5">
          <Icon name="shield" className="w-3.5 h-3.5" /> Local-first · No sign-up · Made for India
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Payroll & salary slips,<br />
          <span className="text-primary">done in seconds.</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          A complete payroll workspace for Indian small businesses, HR teams and accountants —
          PF, ESI, TDS, professional PDF payslips, team pay runs and reports. Right in your browser.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onLaunch}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-primary text-white text-base font-semibold shadow-md shadow-primary/30 hover:opacity-90 transition-opacity"
          >
            Start free in your browser →
          </button>
          <button
            onClick={() => openExternal(CHROME_STORE_URL)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-base font-semibold hover:bg-gray-50 transition-colors"
          >
            <Icon name="chrome" className="w-5 h-5" /> Add to Chrome
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-4">Free tier included. No account, no card required.</p>

        {/* Faux app preview */}
        <div className="mt-12 mx-auto max-w-3xl rounded-2xl border border-border bg-white shadow-xl overflow-hidden">
          <div className="h-9 bg-gray-50 border-b border-border flex items-center gap-1.5 px-4">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300" />
          </div>
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {[
              { l: "Employees", v: "24", t: "indigo" as const, i: "users" as IconName },
              { l: "Payslips", v: "312", t: "slate" as const, i: "history" as IconName },
              { l: "Disbursed", v: "₹18.4L", t: "emerald" as const, i: "chart" as IconName },
              { l: "Net (Jun)", v: "₹6.1L", t: "indigo" as const, i: "sparkles" as IconName },
            ].map((k) => (
              <div key={k.l} className="bg-white border border-border rounded-xl p-3 shadow-sm">
                <span className={`w-6 h-6 rounded-lg flex items-center justify-center mb-2 ${k.t === "emerald" ? "bg-success/10 text-success" : k.t === "indigo" ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"}`}>
                  <Icon name={k.i} className="w-3.5 h-3.5" />
                </span>
                <div className="text-[10px] uppercase font-bold text-gray-400">{k.l}</div>
                <div className="text-lg font-extrabold">{k.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-5 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="bg-white border border-border rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <span className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Icon name={f.icon} className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold mb-1">{f.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="max-w-3xl mx-auto px-5 py-8">
        <h2 className="text-2xl font-extrabold text-center mb-6">Simple pricing</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-1">Free</div>
            <div className="text-3xl font-extrabold mb-4">₹0</div>
            <ul className="space-y-2">
              {FREE.map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm text-gray-600">
                  <Icon name="check" className="w-4 h-4 text-success mt-0.5 shrink-0" /> {x}
                </li>
              ))}
            </ul>
            <button onClick={onLaunch} className="w-full mt-5 py-2.5 rounded-xl border border-border font-semibold text-sm hover:bg-gray-50 transition-colors">
              Start free
            </button>
          </div>
          <div className="bg-white border-2 border-primary rounded-2xl p-6 relative shadow-lg shadow-primary/10">
            <span className="absolute -top-3 left-6 text-[10px] font-bold uppercase tracking-wide bg-primary text-white px-2 py-1 rounded-full">Pro</span>
            <div className="text-sm font-bold text-primary uppercase tracking-wide mb-1">Pro</div>
            <div className="text-3xl font-extrabold mb-4">{PRO_PRICE_LABEL}</div>
            <ul className="space-y-2">
              {PRO.map((x) => (
                <li key={x} className="flex items-start gap-2 text-sm text-gray-700">
                  <Icon name="check" className="w-4 h-4 text-success mt-0.5 shrink-0" /> {x}
                </li>
              ))}
            </ul>
            <button onClick={() => openExternal(LS_STORE_URL)} className="w-full mt-5 py-2.5 rounded-xl bg-primary text-white font-semibold text-sm hover:opacity-90 transition-opacity">
              Get PaySlip Pro
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-8">
        <div className="max-w-5xl mx-auto px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-400">
          <span>PaySlip — Indian payroll & salary slips. Runs locally in your browser.</span>
          <div className="flex items-center gap-4">
            <a href="privacy.html" target="_blank" rel="noopener" className="hover:text-gray-600 underline">Privacy</a>
            <button onClick={onLaunch} className="hover:text-gray-600 underline">Launch app</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
