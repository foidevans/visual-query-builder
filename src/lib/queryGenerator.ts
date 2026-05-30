import { QueryGroup, QueryNode, QueryRule } from "@/types/query";

function formatValue(value: QueryRule["value"]): string {
  if (value === null) return "NULL";
  if (Array.isArray(value)) {
    if (value.length === 2 && !Array.isArray(value[0])) {
      return `${value[0]} AND ${value[1]}`;
    }
    return `(${(value as string[]).map((v) => `'${v}'`).join(", ")})`;
  }
  return `'${value}'`;
}

function ruleToSQL(rule: QueryRule): string {
  const field = rule.field || "?";
  const op = rule.operator;

  switch (op) {
    case "equals": return `${field} = ${formatValue(rule.value)}`;
    case "not_equals": return `${field} != ${formatValue(rule.value)}`;
    case "contains": return `${field} LIKE '%${rule.value}%'`;
    case "not_contains": return `${field} NOT LIKE '%${rule.value}%'`;
    case "starts_with": return `${field} LIKE '${rule.value}%'`;
    case "ends_with": return `${field} LIKE '%${rule.value}'`;
    case "greater_than": return `${field} > ${rule.value}`;
    case "less_than": return `${field} < ${rule.value}`;
    case "greater_than_or_equal": return `${field} >= ${rule.value}`;
    case "less_than_or_equal": return `${field} <= ${rule.value}`;
    case "between": return `${field} BETWEEN ${formatValue(rule.value)}`;
    case "in_array": return `${field} IN ${formatValue(rule.value)}`;
    case "not_in_array": return `${field} NOT IN ${formatValue(rule.value)}`;
    case "is_null": return `${field} IS NULL`;
    case "is_not_null": return `${field} IS NOT NULL`;
    case "regex": return `${field} REGEXP '${rule.value}'`;
    default: return `${field} ? ${formatValue(rule.value)}`;
  }
}

function nodeToSQL(node: QueryNode, depth: number = 0): string {
  const indent = "  ".repeat(depth);

  if (node.type === "rule") {
    return `${indent}${ruleToSQL(node)}`;
  }

  if (node.children.length === 0) return "";

  const parts = node.children
    .map((child) => nodeToSQL(child, depth + 1))
    .filter(Boolean);

  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];

  const joined = parts.join(`\n${indent}${node.logicalOperator} `);
  return depth > 0 ? `(\n${joined}\n${indent})` : joined;
}

export function generateSQL(rootGroup: QueryGroup): string {
  const where = nodeToSQL(rootGroup, 0);
  if (!where) return "SELECT * FROM table";
  return `SELECT *\nFROM table\nWHERE ${where}`;
}

function ruleToMongo(rule: QueryRule): Record<string, unknown> {
  const field = rule.field || "?";
  const val = rule.value;

  switch (rule.operator) {
    case "equals": return { [field]: val };
    case "not_equals": return { [field]: { $ne: val } };
    case "contains": return { [field]: { $regex: val, $options: "i" } };
    case "not_contains": return { [field]: { $not: { $regex: val, $options: "i" } } };
    case "starts_with": return { [field]: { $regex: `^${val}` } };
    case "ends_with": return { [field]: { $regex: `${val}$` } };
    case "greater_than": return { [field]: { $gt: val } };
    case "less_than": return { [field]: { $lt: val } };
    case "greater_than_or_equal": return { [field]: { $gte: val } };
    case "less_than_or_equal": return { [field]: { $lte: val } };
    case "between": return { [field]: { $gte: Array.isArray(val) ? val[0] : val, $lte: Array.isArray(val) ? val[1] : val } };
    case "in_array": return { [field]: { $in: Array.isArray(val) ? val : [val] } };
    case "not_in_array": return { [field]: { $nin: Array.isArray(val) ? val : [val] } };
    case "is_null": return { [field]: null };
    case "is_not_null": return { [field]: { $ne: null } };
    case "regex": return { [field]: { $regex: val } };
    default: return {};
  }
}

function nodeToMongo(node: QueryNode): Record<string, unknown> {
  if (node.type === "rule") return ruleToMongo(node);

  const parts = node.children.map(nodeToMongo).filter((p) => Object.keys(p).length > 0);
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];

  return node.logicalOperator === "AND" ? { $and: parts } : { $or: parts };
}

export function generateMongo(rootGroup: QueryGroup): string {
  const query = nodeToMongo(rootGroup);
  return JSON.stringify(query, null, 2);
}
