import { QueryGroup, QueryNode, QueryRule, ValidationError, ValidationResult } from "@/types/query";
import { getOperatorDefinition, getOperatorsForType } from "@/lib/operators";
import { FieldSchema } from "@/types/query";

function validateRule(rule: QueryRule, fields: FieldSchema[]): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!rule.field) {
    errors.push({ nodeId: rule.id, message: "Field is required" });
    return errors;
  }

  const fieldSchema = fields.find((f) => f.name === rule.field);
  if (!fieldSchema) {
    errors.push({ nodeId: rule.id, message: `Unknown field: ${rule.field}` });
    return errors;
  }

  const allowedOperators = getOperatorsForType(fieldSchema.type);
  const isOperatorAllowed = allowedOperators.some((op) => op.value === rule.operator);
  if (!isOperatorAllowed) {
    errors.push({ nodeId: rule.id, message: `Operator "${rule.operator}" is not valid for field type "${fieldSchema.type}"` });
    return errors;
  }

  const opDef = getOperatorDefinition(rule.operator);
  if (!opDef) return errors;

  if (opDef.valueCount === 0) return errors;

  if (opDef.valueCount === 1) {
    if (rule.value === null || rule.value === "" || (Array.isArray(rule.value) && rule.value.length === 0)) {
      errors.push({ nodeId: rule.id, message: "Value is required" });
    }
  }

  if (opDef.valueCount === 2) {
    if (!Array.isArray(rule.value) || rule.value.length < 2) {
      errors.push({ nodeId: rule.id, message: "Two values are required for 'between'" });
    } else if (!rule.value[0] || !rule.value[1]) {
      errors.push({ nodeId: rule.id, message: "Both values are required for 'between'" });
    }
  }

  return errors;
}

function validateNode(node: QueryNode, fields: FieldSchema[]): ValidationError[] {
  if (node.type === "rule") return validateRule(node, fields);

  const errors: ValidationError[] = [];

  if (node.children.length === 0) {
    errors.push({ nodeId: node.id, message: "Group must have at least one condition" });
    return errors;
  }

  for (const child of node.children) {
    errors.push(...validateNode(child, fields));
  }

  return errors;
}

export function validateQuery(rootGroup: QueryGroup, fields: FieldSchema[]): ValidationResult {
  const errors = validateNode(rootGroup, fields);
  return { valid: errors.length === 0, errors };
}
