import { QueryGroup, QueryNode, QueryRule } from "@/types/query";

function matchRule(row: Record<string, unknown>, rule: QueryRule): boolean {
  const rawValue = row[rule.field];
  const val = rule.value;

  switch (rule.operator) {
    case "is_null": return rawValue === null || rawValue === undefined;
    case "is_not_null": return rawValue !== null && rawValue !== undefined;
    case "equals": return String(rawValue).toLowerCase() === String(val).toLowerCase();
    case "not_equals": return String(rawValue).toLowerCase() !== String(val).toLowerCase();
    case "contains": return String(rawValue).toLowerCase().includes(String(val).toLowerCase());
    case "not_contains": return !String(rawValue).toLowerCase().includes(String(val).toLowerCase());
    case "starts_with": return String(rawValue).toLowerCase().startsWith(String(val).toLowerCase());
    case "ends_with": return String(rawValue).toLowerCase().endsWith(String(val).toLowerCase());
    case "greater_than": return Number(rawValue) > Number(val);
    case "less_than": return Number(rawValue) < Number(val);
    case "greater_than_or_equal": return Number(rawValue) >= Number(val);
    case "less_than_or_equal": return Number(rawValue) <= Number(val);
    case "between": {
      if (!Array.isArray(val) || val.length < 2) return false;
      const num = Number(rawValue);
      return num >= Number(val[0]) && num <= Number(val[1]);
    }
    case "in_array": {
      const arr = Array.isArray(val) ? val : String(val).split(",").map((v) => v.trim());
      return arr.map((v) => v.toLowerCase()).includes(String(rawValue).toLowerCase());
    }
    case "not_in_array": {
      const arr = Array.isArray(val) ? val : String(val).split(",").map((v) => v.trim());
      return !arr.map((v) => v.toLowerCase()).includes(String(rawValue).toLowerCase());
    }
    case "regex": {
      try {
        return new RegExp(String(val), "i").test(String(rawValue));
      } catch {
        return false;
      }
    }
    default: return true;
  }
}

function matchNode(row: Record<string, unknown>, node: QueryNode): boolean {
  if (node.type === "rule") {
    if (!node.field) return true;
    return matchRule(row, node);
  }

  if (node.children.length === 0) return true;

  if (node.logicalOperator === "AND") {
    return node.children.every((child) => matchNode(row, child));
  } else {
    return node.children.some((child) => matchNode(row, child));
  }
}

export function executeQuery(
  data: Record<string, unknown>[],
  rootGroup: QueryGroup
): { results: Record<string, unknown>[]; executionTimeMs: number } {
  const start = performance.now();
  const results = data.filter((row) => matchNode(row, rootGroup));
  const executionTimeMs = Math.round(performance.now() - start);
  return { results, executionTimeMs };
}
