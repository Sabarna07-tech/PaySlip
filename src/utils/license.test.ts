import { describe, expect, it, vi } from "vitest";
import { validateLicense } from "./license";

describe("validateLicense", () => {
  it("caches successful validation for the same key", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ valid: true }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateLicense("LIC-123")).resolves.toBe(true);
    await expect(validateLicense("LIC-123")).resolves.toBe(true);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
