import type { ReactNode } from "react";
import { LS_STORE_URL } from "@/config";
import { openExternal } from "@/utils/platform";
import { Icon, type IconName } from "./components/icons";

interface TabDef {
  id: string;
  icon: IconName;
  label: string;
}

interface Props {
  tabs: TabDef[];
  activeId: string;
  onSelect: (id: string) => void;
  pro: boolean;
  onGetPro: () => void;
  children: ReactNode;
}

/**
 * Full-screen layout for the standalone web app: a branded sidebar (desktop) /
 * scrollable top nav (mobile), a section header with a Pro upsell, the centered
 * content column, and a footer. The extension keeps its own compact popup shell.
 */
export default function WebLayout({ tabs, activeId, onSelect, pro, onGetPro, children }: Props) {
  const active = tabs.find((t) => t.id === activeId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-gray-50 to-emerald-50 sm:py-6 sm:px-4">
      <div className="mx-auto w-full max-w-5xl bg-white sm:rounded-2xl shadow-xl ring-1 ring-black/5 overflow-hidden flex min-h-screen sm:min-h-[calc(100vh-3rem)]">
        {/* Sidebar (desktop) */}
        <aside className="hidden sm:flex w-56 shrink-0 border-r border-border flex-col bg-gradient-to-b from-white to-gray-50">
          <div className="p-5 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center text-xl font-bold shadow">
              ₹
            </div>
            <div>
              <div className="text-base font-extrabold text-gray-900 leading-tight">PaySlip</div>
              <span
                className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded ${
                  pro ? "bg-success/10 text-success" : "bg-gray-100 text-gray-400"
                }`}
              >
                {pro ? "Pro" : "Free"}
              </span>
            </div>
          </div>

          <nav className="flex-1 px-3 space-y-1" role="tablist" aria-label="Sections">
            {tabs.map((tab) => {
              const isActive = tab.id === activeId;
              return (
                <button
                  key={tab.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onSelect(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-left transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 ${
                    isActive
                      ? "bg-primary text-white shadow-sm shadow-primary/30"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon name={tab.icon} className="w-[18px] h-[18px]" />
                  {tab.label}
                </button>
              );
            })}
          </nav>

          {!pro && (
            <div className="m-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
              <div className="text-xs font-bold text-gray-900 mb-0.5">Unlock PaySlip Pro</div>
              <div className="text-[11px] text-gray-500 mb-2 leading-snug">
                Unlimited payslips, bulk export, reports & branding.
              </div>
              <button
                onClick={onGetPro}
                className="w-full py-1.5 bg-primary text-white rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
              >
                Upgrade
              </button>
            </div>
          )}

          <div className="px-5 py-3 border-t border-border text-[10px] text-gray-400 leading-relaxed">
            Local-first · runs in your browser
            <br />
            <a href="privacy.html" target="_blank" rel="noopener" className="underline hover:text-gray-600">
              Privacy
            </a>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 flex flex-col">
          {/* Mobile top bar */}
          <header className="sm:hidden sticky top-0 z-10 bg-white border-b border-border">
            <div className="flex items-center gap-2 px-4 py-3">
              <div className="w-7 h-7 bg-primary text-white rounded-lg flex items-center justify-center text-sm font-bold">₹</div>
              <span className="text-sm font-extrabold text-gray-900">PaySlip</span>
              <span className={`ml-auto text-[9px] font-bold uppercase ${pro ? "text-success" : "text-gray-400"}`}>
                {pro ? "Pro" : "Free"}
              </span>
            </div>
            <nav className="flex overflow-x-auto px-2 pb-2 gap-1" role="tablist" aria-label="Sections">
              {tabs.map((tab) => {
                const isActive = tab.id === activeId;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => onSelect(tab.id)}
                    className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ${
                      isActive ? "bg-primary text-white" : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    <Icon name={tab.icon} className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </header>

          {/* Section header (desktop) */}
          <div className="hidden sm:flex items-center justify-between px-6 py-4 border-b border-border">
            <h1 className="text-lg font-bold text-gray-900">{active?.label}</h1>
            {!pro && (
              <button
                onClick={onGetPro}
                className="text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 rounded-lg px-3 py-1.5 transition-colors"
              >
                ✨ Get Pro
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[520px] mx-auto w-full pb-12">{children}</div>
          </div>

          <footer className="border-t border-border px-6 py-3 text-[11px] text-gray-400 flex flex-wrap items-center justify-between gap-2">
            <span>PaySlip — Indian payroll & salary slips. Local-first.</span>
            <button onClick={() => openExternal(LS_STORE_URL)} className="underline hover:text-gray-600">
              Get a license key
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
}
