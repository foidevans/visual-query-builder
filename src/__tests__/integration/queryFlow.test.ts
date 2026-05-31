import { describe, it, expect, beforeEach } from "vitest";
import { generateSQL, generateMongo } from "@/lib/queryGenerator";
import { executeQuery } from "@/lib/queryExecutor";
import { validateQuery } from "@/lib/validator";
import { SCHEMAS } from "@/data/schemas";
import { MOCK_DATA } from "@/data/mockData";
import { QueryGroup } from "@/types/query";

const usersSchema = SCHEMAS.find((s) => s.name === "users")!;
const usersData = MOCK_DATA["users"];

function makeGroup(overrides: Partial<QueryGroup> = {}): QueryGroup {
  return {
    id: "root",
    type: "group",
    logicalOperator: "AND",
    children: [],
    ...overrides,
  };
}

describe("Full query flow — validate → generate → execute", () => {
  it("valid query produces correct SQL and matching results", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
        { id: "r2", type: "rule", field: "status", operator: "equals", value: "active" },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const sql = generateSQL(group);
    expect(sql).toContain("age > 18");
    expect(sql).toContain("status = 'active'");
    expect(sql).toContain("AND");

    const { results } = executeQuery(usersData, group);
    expect(results.every((r) => Number(r.age) > 18 && r.status === "active")).toBe(true);
  });

  it("invalid query fails validation and should not be executed", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "", operator: "equals", value: "" },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });

  it("nested AND/OR group produces correct results", () => {
    const group = makeGroup({
      logicalOperator: "OR",
      children: [
        {
          id: "g1",
          type: "group",
          logicalOperator: "AND",
          children: [
            { id: "r1", type: "rule", field: "age", operator: "greater_than", value: "18" },
            { id: "r2", type: "rule", field: "country", operator: "equals", value: "Nigeria" },
          ],
        },
        {
          id: "g2",
          type: "group",
          logicalOperator: "AND",
          children: [
            { id: "r3", type: "rule", field: "status", operator: "equals", value: "active" },
            { id: "r4", type: "rule", field: "purchases", operator: "greater_than", value: "10" },
          ],
        },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const sql = generateSQL(group);
    expect(sql).toContain("OR");
    expect(sql).toContain("AND");

    const mongo = JSON.parse(generateMongo(group));
    expect(mongo.$or).toBeDefined();
    expect(mongo.$or).toHaveLength(2);

    const { results } = executeQuery(usersData, group);
    expect(results.length).toBeGreaterThan(0);
  });

  it("between operator validates, generates, and executes correctly", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "age", operator: "between", value: ["20", "35"] },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const sql = generateSQL(group);
    expect(sql).toContain("BETWEEN");

    const { results } = executeQuery(usersData, group);
    expect(results.every((r) => Number(r.age) >= 20 && Number(r.age) <= 35)).toBe(true);
  });

  it("is_null operator validates and executes without a value", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "name", operator: "is_null", value: null },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const sql = generateSQL(group);
    expect(sql).toContain("IS NULL");

    const { results } = executeQuery(usersData, group);
    expect(Array.isArray(results)).toBe(true);
  });

  it("in_array operator filters correctly against mock data", () => {
    const group = makeGroup({
      children: [
        { id: "r1", type: "rule", field: "status", operator: "in_array", value: ["active", "inactive"] },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const { results } = executeQuery(usersData, group);
    expect(results.every((r) => r.status === "active" || r.status === "inactive")).toBe(true);
  });

  it("empty group fails validation and returns no SQL WHERE clause", () => {
    const group = makeGroup({ children: [] });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(false);

    const sql = generateSQL(group);
    expect(sql).toBe("SELECT * FROM table");
  });

  it("deeply nested group validates and executes correctly", () => {
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
            {
              id: "g2",
              type: "group",
              logicalOperator: "AND",
              children: [
                { id: "r3", type: "rule", field: "country", operator: "equals", value: "Nigeria" },
                { id: "r4", type: "rule", field: "purchases", operator: "greater_than", value: "5" },
              ],
            },
          ],
        },
      ],
    });

    const validation = validateQuery(group, usersSchema.fields);
    expect(validation.valid).toBe(true);

    const { results } = executeQuery(usersData, group);
    expect(results.every((r) => Number(r.age) > 18)).toBe(true);
  });
});
