import { useEffect, useState } from "react";
import { isPro } from "@/utils/license";

/**
 * Reactively reports whether the user has an active PaySlip Pro license.
 * Used to render lock badges and gate premium actions in the UI.
 */
export function usePro(): { pro: boolean; loading: boolean; refresh: () => void } {
  const [pro, setPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    isPro()
      .then((value) => {
        if (!cancelled) setPro(value);
      })
      .catch(() => {
        if (!cancelled) setPro(false);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [nonce]);

  return { pro, loading, refresh: () => setNonce((n) => n + 1) };
}
