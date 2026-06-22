import { describe, expect, it, vi } from "vitest";
import { FREE_LIMIT, incrementQuota, isOverLimit, consumeQuota, getRemainingFree } from "./quota";

describe("quota", () => {
  it("resets monthly quota when the month changes", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-15T00:00:00.000Z"));

    for (let i = 0; i < FREE_LIMIT; i++) {
      await incrementQuota();
    }
    expect(await isOverLimit("")).toBe(true);

    vi.setSystemTime(new Date("2026-05-01T00:00:00.000Z"));
    expect(await isOverLimit("")).toBe(false);

    vi.useRealTimers();
  });

  it("consumeQuota meters free usage and consumes the allowance", async () => {
    expect(await getRemainingFree()).toBe(FREE_LIMIT);

    const first = await consumeQuota(1);
    expect(first.allowed).toBe(true);
    expect(first.pro).toBe(false);
    expect(await getRemainingFree()).toBe(FREE_LIMIT - 1);
  });

  it("consumeQuota rejects a batch larger than the remaining allowance without consuming it", async () => {
    const decision = await consumeQuota(FREE_LIMIT + 1);
    expect(decision.allowed).toBe(false);
    // Nothing was consumed when rejected.
    expect(await getRemainingFree()).toBe(FREE_LIMIT);
  });

  it("consumeQuota blocks once the monthly allowance is exhausted", async () => {
    const ok = await consumeQuota(FREE_LIMIT);
    expect(ok.allowed).toBe(true);
    expect(ok.remaining).toBe(0);

    const blocked = await consumeQuota(1);
    expect(blocked.allowed).toBe(false);
  });
});
