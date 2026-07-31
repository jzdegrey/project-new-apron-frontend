import { formatQuantity, parseQuantityInput } from "./fraction";

describe("formatQuantity", () => {
  it("formats whole numbers without a fraction", () => {
    expect(formatQuantity(2)).toBe("2");
  });

  it("formats a simple fraction", () => {
    expect(formatQuantity(0.5)).toBe("1/2");
  });

  it("formats a mixed number", () => {
    expect(formatQuantity(1.5)).toBe("1 1/2");
  });

  it("formats thirds", () => {
    expect(formatQuantity(0.3333)).toBe("1/3");
  });

  it("formats two-thirds", () => {
    expect(formatQuantity(0.6667)).toBe("2/3");
  });

  it("falls back to a decimal when no common fraction matches closely enough", () => {
    expect(formatQuantity(1.234)).toBe("1.234");
  });
});

describe("parseQuantityInput", () => {
  it("parses a whole number", () => {
    expect(parseQuantityInput("2")).toBe(2);
  });

  it("parses a decimal", () => {
    expect(parseQuantityInput("2.5")).toBe(2.5);
  });

  it("parses a simple fraction", () => {
    expect(parseQuantityInput("1/2")).toBe(0.5);
  });

  it("parses a mixed number", () => {
    expect(parseQuantityInput("1 1/2")).toBe(1.5);
  });

  it("returns null for empty input", () => {
    expect(parseQuantityInput("")).toBeNull();
    expect(parseQuantityInput("   ")).toBeNull();
  });

  it("returns null for unparseable input", () => {
    expect(parseQuantityInput("a lot")).toBeNull();
  });

  it("returns null for a fraction with a zero denominator", () => {
    expect(parseQuantityInput("1/0")).toBeNull();
  });
});
