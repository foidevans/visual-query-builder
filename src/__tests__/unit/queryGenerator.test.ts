import { describe, it, expect } from "vitest";
import { generateSQL, generateMongo } from "@/lib/queryGenerator";
import { QueryGroup } from "@/types/query";

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return {
    id: "root",
    type: "group",
    logicalOperator: "AND",
    children: [],
    ...overrides,
  };
}

describe("generateSQL", () => {
  it("returns base query when no conditions", () => {
    const result = generateSQL(makeGroup());
    expect(result).toBe("SELECT * FROM table");
  });

  it("generates simple equals rule", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "equals", value: "18" }],
    });
    expect(generateSQL(group)).toContain("age = '18'");
  });

  it("generates greater than rule", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" }],
    });
    expect(generateSQL(group)).toContain("age > 18");
  });

  it("generates LIKE for contains", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "name", operator: "contains", value: "ada" }],
    });
    expect(generateSQL(group)).toContain("LIKE '%ada%'");
  });

  it("generates IS NULL correctly", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "email", operator: "is_null", value: null }],
    });
    expect(generateSQL(group)).toContain("IS NULL");
  });

  it("generates BETWEEN with two values", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "between", value: ["18", "30"] }],
    });
    expect(generateSQL(group)).toContain("BETWEEN 18 AND 30");
  });

  it("joins multiple rules with AND", () => {
    const group = makeGroup({
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
        { id: "r2", type: "rule", field: "status", operator: "equals", value: "active" },
      ],
    });
    const sql = generateSQL(group);
    expect(sql).toContain("AND");
    expect(sql).toContain("age > 18");
    expect(sql).toContain("status = 'active'");
  });

  it("joins multiple rules with OR", () => {
    const group = makeGroup({
      logicalOperator: "OR",
      children: [
        { id: "r1", type: "rule", field: "age", operator: "less_than", value: "18" },
        { id: "r2", type: "rule", field: "status", operator: "equals", value: "banned" },
      ],
    });
    expect(generateSQL(group)).toContain("OR");
  });

  it("handles nested groups", () => {
    const group = makeGroup({
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
        {
          id: "g1",
          type: "group",
          logicalOperator: "OR",
          children: [
            { id: "r2", type: "rule", field: "status", operator: "equals", value: "active" },
            { id: "r3", type: "rule", field: "purchases", operator: "greater_than", value: "10" },
          ],
        },
      ],
    });
    const sql = generateSQL(group);
    expect(sql).toContain("age > 18");
    expect(sql).toContain("status = 'active'");
    expect(sql).toContain("purchases > 10");
  });
});

describe("generateMongo", () => {
  it("returns empty object for empty group", () => {
    const result = JSON.parse(generateMongo(makeGroup()));
    expect(result).toEqual({});
  });

  it("generates equals filter", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "status", operator: "equals", value: "active" }],
    });
    const result = JSON.parse(generateMongo(group));
    expect(result).toEqual({ status: "active" });
  });

  it("generates $gt for greater_than", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" }],
    });
    const result = JSON.parse(generateMongo(group));
    expect(result.age).toEqual({ $gt: "18" });
  });

  it("generates $and for AND group", () => {
    const group = makeGroup({
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
        { id: "r2", type: "rule", field: "status", operator: "equals", value: "active" },
      ],
    });
    const result = JSON.parse(generateMongo(group));
    expect(result.$and).toBeDefined();
    expect(result.$and).toHaveLength(2);
  });

  it("generates $or for OR group", () => {
    const group = makeGroup({
      logicalOperator: "OR",
      children: [
        { id: "r1", type: "rule", field: "age", operator: "less_than", value: "18" },
        { id: "r2", type: "rule", field: "status", operator: "equals", value: "banned" },
      ],
    });
    const result = JSON.parse(generateMongo(group));
    expect(result.$or).toBeDefined();
  });

  it("generates $regex for contains", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "name", operator: "contains", value: "ada" }],
    });
    const result = JSON.parse(generateMongo(group));
    expect(result.name.$regex).toBe("ada");
  });
});
