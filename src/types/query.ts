// ─── Field Types ────────────────────────────────────────────────────────────

export type FieldType = "string" | "number" | "boolean" | "date" | "enum";

export interface FieldSchema {
  name: string;
  label: string;
  type: FieldType;
  enumValues?: string[]; // only for enum fields
}

export interface DataSchema {
  name: string;
  label: string;
  fields: FieldSchema[];
}

// ─── Operators ───────────────────────────────────────────────────────────────

export type Operator =
  | "equals"
  | "not_equals"
  | "contains"
  | "not_contains"
  | "starts_with"
  | "ends_with"
  | "greater_than"
  | "less_than"
  | "greater_than_or_equal"
  | "less_than_or_equal"
  | "between"
  | "in_array"
  | "not_in_array"
  | "is_null"
  | "is_not_null"
  | "regex";

export interface OperatorDefinition {
  value: Operator;
  label: string;
  valueCount: 0 | 1 | 2; // 0 = no value (null checks), 2 = between
  allowedTypes: FieldType[];
}

// ─── Query Tree ───────────────────────────────────────────────────────────────

export type LogicalOperator = "AND" | "OR";

export type QueryNodeType = "rule" | "group";

export interface QueryRule {
  id: string;
  type: "rule";
  field: string;       // field name from schema
  operator: Operator;
  value: string | string[] | [string, string] | null;
}

export interface QueryGroup {
  id: string;
  type: "group";
  logicalOperator: LogicalOperator;
  children: QueryNode[];
  collapsed?: boolean;
}

export type QueryNode = QueryRule | QueryGroup;

// ─── Query State ─────────────────────────────────────────────────────────────

export interface QueryState {
  rootGroup: QueryGroup;
  selectedSchema: string;
}

// ─── Validation ───────────────────────────────────────────────────────────────

export interface ValidationError {
  nodeId: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

// ─── Query History & Presets ─────────────────────────────────────────────────

export interface QueryPreset {
  id: string;
  name: string;
  query: QueryGroup;
  schemaName: string;
  createdAt: string;
}

export interface QueryHistoryEntry {
  id: string;
  query: QueryGroup;
  schemaName: string;
  executedAt: string;
  resultCount: number;
}

// ─── Results ─────────────────────────────────────────────────────────────────

export interface QueryResult {
  data: Record<string, unknown>[];
  totalCount: number;
  executionTimeMs: number;
}
