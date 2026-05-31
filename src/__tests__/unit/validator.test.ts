import { describe, it, expect } from "vitest";
import { validateQuery } from "@/lib/validator";
import { QueryGroup, FieldSchema } from "@/types/query";

const fields: FieldSchema[] = [
  { name: "name", label: "Name", type: "string" },
  { name: "age", label: "Age", type: "number" },
  { name: "status", label: "Status", type: "enum", enumValues: ["active", "inactive"] },
  { name: "createdAt", label: "Created At", type: "date" },
];

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return {
    id: "root",
    type: "group",
    logicalOperator: "AND",
    children: [],
    ...overrides,
  };
}

describe("validateQuery", () => {
  it("is invalid when group has no children", () => {
    const result = validateQuery(makeGroup(), fields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("at least one condition");
  });

  it("is invalid when rule has no field", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "", operator: "equals", value: "" }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Field is required");
  });

  it("is invalid when rule has no value", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "name", operator: "equals", value: "" }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("Value is required");
  });

  it("is valid when is_null operator has no value", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "name", operator: "is_null", value: null }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(true);
  });

  it("is invalid when contains operator used on number field", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "contains", value: "5" }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain("not valid for field type");
  });

  it("is invalid when between has incomplete values", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "between", value: ["18", ""] }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(false);
  });

  it("is valid for a complete valid rule", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" }],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(true);
  });

  it("validates nested groups recursively", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
        {
          id: "g1",
          type: "group",
          logicalOperator: "OR",
          children: [
            { id: "r2", type: "rule", field: "name", operator: "equals", value: "" },
          ],
        },
      ],
    });
    const result = validateQuery(group, fields);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.nodeId === "r2")).toBe(true);
  });

  it("returns multiple errors for multiple invalid rules", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "", operator: "equals", value: "" },
        { id: "r2", type: "rule", field: "name", operator: "equals", value: "" },
      ],
    });
    const result = validateQuery(group, fields);
    expect(result.errors.length).toBeGreaterThan(1);
  });
});
