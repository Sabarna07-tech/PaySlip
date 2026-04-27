import { describe, expect, it, vi } from "vitest";
import { FREE_LIMIT, incrementQuota, isOverLimit } from "./quota";

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
});
