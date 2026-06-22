import { createContext, useContext, useRef, useState, type ReactNode } from "react";
import type { Payslip } from "@/types";
import UpgradeModal from "./components/UpgradeModal";

interface PromptOptions {
  /** Headline shown on the paywall (e.g. why the user hit it). */
  reason?: string;
  pendingPayslip?: Payslip | null;
  onActivated?: (payslip: Payslip) => void;
}

interface UpgradeContextValue {
  promptUpgrade: (opts?: PromptOptions) => void;
}

const UpgradeContext = createContext<UpgradeContextValue>({ promptUpgrade: () => {} });

export const useUpgrade = () => useContext(UpgradeContext);

/**
 * Provides a single, app-wide paywall. Any component can call
 * `useUpgrade().promptUpgrade()` to surface the Pro upsell — whether triggered
 * by the monthly quota or by clicking a Pro-only feature.
 */
export function UpgradeProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Payslip | null>(null);
  const [reason, setReason] = useState<string | undefined>(undefined);
  const onActivatedRef = useRef<((payslip: Payslip) => void) | undefined>(undefined);

  const promptUpgrade = (opts?: PromptOptions) => {
    setPending(opts?.pendingPayslip ?? null);
    setReason(opts?.reason);
    onActivatedRef.current = opts?.onActivated;
    setOpen(true);
  };

  return (
    <UpgradeContext.Provider value={{ promptUpgrade }}>
      {children}
      {open && (
        <UpgradeModal
          reason={reason}
          pendingPayslip={pending}
          onClose={() => setOpen(false)}
          onActivated={(payslip) => onActivatedRef.current?.(payslip)}
        />
      )}
    </UpgradeContext.Provider>
  );
}
