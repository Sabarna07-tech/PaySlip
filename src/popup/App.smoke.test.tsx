import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import App from "./App";

// jsdom has no chrome.runtime.id, so App renders the standalone WEB shell here.
// This catches render-time crashes (bad hooks, undefined imports, JSX errors)
// across the whole component tree without needing a browser.
describe("App render smoke", () => {
  it("renders the web shell and navigation without throwing", () => {
    const html = renderToStaticMarkup(<App />);
    expect(html).toContain("PaySlip");
    expect(html).toContain("Calculator");
    expect(html).toContain("Team");
    expect(html).toContain("History");
    expect(html).toContain("Settings");
  });
});
