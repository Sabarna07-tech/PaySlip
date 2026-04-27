import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";

// Dev-mode polyfill: chrome.storage.local backed by localStorage
if (typeof chrome === "undefined" || !chrome.storage) {
  const store: Record<string, unknown> = {};
  try {
    const saved = localStorage.getItem("__payslip_dev__");
    if (saved) Object.assign(store, JSON.parse(saved));
  } catch {}

  const persist = () => {
    try { localStorage.setItem("__payslip_dev__", JSON.stringify(store)); } catch {}
  };

  (window as any).chrome = {
    ...(window as any).chrome,
    storage: {
      local: {
        get: (keys: string | string[]) => {
          const result: Record<string, unknown> = {};
          const keyArr = typeof keys === "string" ? [keys] : keys;
          for (const k of keyArr) {
            if (k in store) result[k] = store[k];
          }
          return Promise.resolve(result);
        },
        set: (items: Record<string, unknown>) => {
          Object.assign(store, items);
          persist();
          return Promise.resolve();
        },
      },
    },
    tabs: {
      create: (opts: { url: string }) => { window.open(opts.url, "_blank"); },
    },
  };
}

ReactDOM.createRoot(document.getElementById("root")!).render(<App />);
