import { FieldType, Operator, OperatorDefinition } from "@/types/query";

export const OPERATOR_DEFINITIONS: OperatorDefinition[] = [
  { value: "equals", label: "Equals", valueCount: 1, allowedTypes: ["string", "number", "boolean", "date", "enum"] },
  { value: "not_equals", label: "Not Equals", valueCount: 1, allowedTypes: ["string", "number", "boolean", "date", "enum"] },
  { value: "contains", label: "Contains", valueCount: 1, allowedTypes: ["string"] },
  { value: "not_contains", label: "Not Contains", valueCount: 1, allowedTypes: ["string"] },
  { value: "starts_with", label: "Starts With", valueCount: 1, allowedTypes: ["string"] },
  { value: "ends_with", label: "Ends With", valueCount: 1, allowedTypes: ["string"] },
  { value: "greater_than", label: "Greater Than", valueCount: 1, allowedTypes: ["number", "date"] },
  { value: "less_than", label: "Less Than", valueCount: 1, allowedTypes: ["number", "date"] },
  { value: "greater_than_or_equal", label: "≥ Greater or Equal", valueCount: 1, allowedTypes: ["number", "date"] },
  { value: "less_than_or_equal", label: "≤ Less or Equal", valueCount: 1, allowedTypes: ["number", "date"] },
  { value: "between", label: "Between", valueCount: 2, allowedTypes: ["number", "date"] },
  { value: "in_array", label: "In Array", valueCount: 1, allowedTypes: ["string", "number", "enum"] },
  { value: "not_in_array", label: "Not In Array", valueCount: 1, allowedTypes: ["string", "number", "enum"] },
  { value: "is_null", label: "Is Null", valueCount: 0, allowedTypes: ["string", "number", "boolean", "date", "enum"] },
  { value: "is_not_null", label: "Is Not Null", valueCount: 0, allowedTypes: ["string", "number", "boolean", "date", "enum"] },
  { value: "regex", label: "Regex", valueCount: 1, allowedTypes: ["string"] },
];

export function getOperatorsForType(type: FieldType): OperatorDefinition[] {
  return OPERATOR_DEFINITIONS.filter((op) => op.allowedTypes.includes(type));
}

export function getOperatorDefinition(operator: Operator): OperatorDefinition | undefined {
  return OPERATOR_DEFINITIONS.find((op) => op.value === operator);
}
