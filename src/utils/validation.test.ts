import { describe, expect, it } from "vitest";
import { isValidPAN, isValidIFSC, isValidUAN, isValidEmail, fieldHint, clampText } from "./validation";

describe("validation", () => {
  it("validates PAN format (case-insensitive)", () => {
    expect(isValidPAN("ABCDE1234F")).toBe(true);
    expect(isValidPAN("abcde1234f")).toBe(true);
    expect(isValidPAN("ABCDE1234")).toBe(false);
    expect(isValidPAN("12345ABCDF")).toBe(false);
  });

  it("validates IFSC format", () => {
    expect(isValidIFSC("HDFC0001234")).toBe(true);
    expect(isValidIFSC("HDFC1001234")).toBe(false); // 5th char must be 0
    expect(isValidIFSC("HD0C0001234")).toBe(false);
  });

  it("validates 12-digit UAN", () => {
    expect(isValidUAN("100200300400")).toBe(true);
    expect(isValidUAN("12345")).toBe(false);
    expect(isValidUAN("10020030040A")).toBe(false);
  });

  it("validates email", () => {
    expect(isValidEmail("a@b.com")).toBe(true);
    expect(isValidEmail("not-an-email")).toBe(false);
  });

  it("fieldHint returns null for empty (optional) values", () => {
    expect(fieldHint("pan", "")).toBeNull();
    expect(fieldHint("pan", undefined)).toBeNull();
  });

  it("fieldHint returns a message only for invalid non-empty values", () => {
    expect(fieldHint("pan", "ABCDE1234F")).toBeNull();
    expect(fieldHint("pan", "bad")).toMatch(/PAN/);
    expect(fieldHint("ifsc", "HDFC0001234")).toBeNull();
    expect(fieldHint("uan", "123")).toMatch(/12 digits/);
  });

  it("clampText caps length", () => {
    expect(clampText("hello", 10)).toBe("hello");
    expect(clampText("abcdef", 3)).toBe("abc");
  });
});
