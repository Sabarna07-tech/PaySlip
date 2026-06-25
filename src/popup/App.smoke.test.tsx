import { describe, expect, it, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

// jsdom has no chrome.runtime.id, so App renders the standalone WEB experience.
// These render the whole tree to static markup to catch render-time crashes
// (bad hooks, undefined imports, JSX errors) without needing a browser.
beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* ignore */
  }
});

describe("App render smoke", () => {
  it("renders the landing page by default", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PaySlip");
    expect(html).toContain("Add to Chrome");
    expect(html).toMatch(/Launch app|Start free/);
  });

  it("renders the full app shell + navigation once launched", () => {
    localStorage.setItem("payslip_launched", "1");
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("Calculator");
    expect(html).toContain("Team");
    expect(html).toContain("History");
    expect(html).toContain("Settings");
  });
});
