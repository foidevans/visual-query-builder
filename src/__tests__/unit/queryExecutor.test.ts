import { describe, it, expect } from "vitest";
import { executeQuery } from "@/lib/queryExecutor";
import { QueryGroup } from "@/types/query";

const dataset = [
  { id: 1, name: "Ada", age: 28, status: "active", country: "Nigeria" },
  { id: 2, name: "Chidi", age: 17, status: "inactive", country: "Nigeria" },
  { id: 3, name: "Fatima", age: 34, status: "active", country: "Senegal" },
  { id: 4, name: "Kwame", age: 15, status: "banned", country: "Ghana" },
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

describe("executeQuery", () => {
  it("returns all rows when no conditions", () => {
    const { results } = executeQuery(dataset, makeGroup());
    expect(results).toHaveLength(4);
  });

  it("filters by equals", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "status", operator: "equals", value: "active" }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results).toHaveLength(2);
    expect(results.every((r) => r.status === "active")).toBe(true);
  });

  it("filters by greater_than", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results.every((r) => Number(r.age) > 18)).toBe(true);
  });

  it("filters by less_than", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "less_than", value: "18" }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results.every((r) => Number(r.age) < 18)).toBe(true);
  });

  it("filters by contains", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "name", operator: "contains", value: "ada" }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Ada");
  });

  it("filters by between", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "age", operator: "between", value: ["18", "30"] }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results.every((r) => Number(r.age) >= 18 && Number(r.age) <= 30)).toBe(true);
  });

  it("applies AND logic correctly", () => {
    const group = makeGroup({
      logicalOperator: "AND",
      children: [
        { id: "r1", type: "rule", field: "status", operator: "equals", value: "active" },
        { id: "r2", type: "rule", field: "country", operator: "equals", value: "Nigeria" },
      ],
    });
    const { results } = executeQuery(dataset, group);
    expect(results).toHaveLength(1);
    expect(results[0].name).toBe("Ada");
  });

  it("applies OR logic correctly", () => {
    const group = makeGroup({
      logicalOperator: "OR",
      children: [
        { id: "r1", type: "rule", field: "country", operator: "equals", value: "Ghana" },
        { id: "r2", type: "rule", field: "country", operator: "equals", value: "Senegal" },
      ],
    });
    const { results } = executeQuery(dataset, group);
    expect(results).toHaveLength(2);
  });

  it("returns empty array when nothing matches", () => {
    const group = makeGroup({
      children: [{ id: "r1", type: "rule", field: "status", operator: "equals", value: "vip" }],
    });
    const { results } = executeQuery(dataset, group);
    expect(results).toHaveLength(0);
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
            { id: "r2", type: "rule", field: "country", operator: "equals", value: "Nigeria" },
            { id: "r3", type: "rule", field: "country", operator: "equals", value: "Senegal" },
          ],
        },
      ],
    });
    const { results } = executeQuery(dataset, group);
    expect(results.every((r) => Number(r.age) > 18)).toBe(true);
  });

  it("returns execution time", () => {
    const { executionTimeMs } = executeQuery(dataset, makeGroup());
    expect(typeof executionTimeMs).toBe("number");
    expect(executionTimeMs).toBeGreaterThanOrEqual(0);
  });
});
