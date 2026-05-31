import { describe, it, expect } from "vitest";
import { getOperatorsForType, getOperatorDefinition } from "@/lib/operators";

describe("getOperatorsForType", () => {
  it("returns string operators", () => {
    const ops = getOperatorsForType("string");
    const values = ops.map((o) => o.value);
    expect(values).toContain("contains");
    expect(values).toContain("starts_with");
    expect(values).toContain("regex");
  });

  it("does not return contains for number", () => {
    const ops = getOperatorsForType("number");
    expect(ops.map((o) => o.value)).not.toContain("contains");
  });

  it("returns between for number", () => {
    const ops = getOperatorsForType("number");
    expect(ops.map((o) => o.value)).toContain("between");
  });

  it("returns between for date", () => {
    const ops = getOperatorsForType("date");
    expect(ops.map((o) => o.value)).toContain("between");
  });

  it("does not return between for string", () => {
    const ops = getOperatorsForType("string");
    expect(ops.map((o) => o.value)).not.toContain("between");
  });

  it("returns is_null for all types", () => {
    const types = ["string", "number", "boolean", "date", "enum"] as const;
    types.forEach((type) => {
      const ops = getOperatorsForType(type);
      expect(ops.map((o) => o.value)).toContain("is_null");
    });
  });
});

describe("getOperatorDefinition", () => {
  it("returns definition for valid operator", () => {
    const def = getOperatorDefinition("equals");
    expect(def).toBeDefined();
    expect(def?.label).toBe("Equals");
    expect(def?.valueCount).toBe(1);
  });

  it("returns valueCount 0 for is_null", () => {
    const def = getOperatorDefinition("is_null");
    expect(def?.valueCount).toBe(0);
  });

  it("returns valueCount 2 for between", () => {
    const def = getOperatorDefinition("between");
    expect(def?.valueCount).toBe(2);
  });

  it("returns undefined for unknown operator", () => {
    const def = getOperatorDefinition("unknown" as never);
    expect(def).toBeUndefined();
  });
});
