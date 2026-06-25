import { describe, expect, it, vi } from "vitest";
import { activateLicense, validateLicense, activateOrValidate } from "./license";

describe("license activation (anti-sharing)", () => {
  it("activates a key on this device and then serves the cached result", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ activated: true, instance: { id: "inst_1" } }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateLicense("LIC-123");
    expect(result.ok).toBe(true);

    // validateLicense reads the 24h cache set during activation → no extra fetch.
    await expect(validateLicense("LIC-123")).resolves.toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(1);

    vi.unstubAllGlobals();
  });

  it("surfaces the activation-limit error when a key is over-shared", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: false,
      json: async () => ({ activated: false, error: "license key has reached the activation limit" }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateLicense("LIC-OVERSHARED");
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/activation limit/i);

    vi.unstubAllGlobals();
  });

  it("treats a key never activated on this device as invalid (no network call)", async () => {
    const fetchMock = vi.fn() as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    await expect(validateLicense("LIC-NEW")).resolves.toBe(false);
    expect(fetchMock).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it("activateOrValidate activates the first time a key is seen", async () => {
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({ activated: true, instance: { id: "inst_2" } }),
    })) as unknown as typeof fetch;
    vi.stubGlobal("fetch", fetchMock);

    const result = await activateOrValidate("LIC-FIRST");
    expect(result.ok).toBe(true);
    expect(fetchMock).toHaveBeenCalledWith(expect.stringContaining("/activate"), expect.anything());

    vi.unstubAllGlobals();
  });
});
