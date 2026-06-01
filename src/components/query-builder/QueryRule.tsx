"use client";

import React, { memo } from "react";
import { X, GripVertical, AlertCircle } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useQueryStore } from "@/store/queryStore";
import { getOperatorsForType, getOperatorDefinition } from "@/lib/operators";
import { FieldSchema, QueryRule as QueryRuleType } from "@/types/query";
import { useValidation } from "@/hooks/useValidation";
import { cn } from "@/lib/utils";

interface QueryRuleProps {
  rule: QueryRuleType;
  fields: FieldSchema[];
  groupId: string;
  isOnly: boolean;
}

function ValueInput({
  rule, field, onTouch,
}: {
  rule: QueryRuleType;
  field: FieldSchema | undefined;
  onTouch: () => void;
}) {
  const updateRule = useQueryStore((s) => s.updateRule);
  const opDef = getOperatorDefinition(rule.operator);

  if (!opDef || opDef.valueCount === 0 || !field) return null;

  if (field.type === "enum" && field.enumValues) {
    return (
      <Select
        value={typeof rule.value === "string" ? rule.value : ""}
        onValueChange={(val) => { onTouch(); updateRule(rule.id, { value: val }); }}
      >
        <SelectTrigger className="h-7 text-xs" style={{ minWidth: 100, flex: 1 }}>
          <SelectValue placeholder="Select value" />
        </SelectTrigger>
        <SelectContent>
          {field.enumValues.map((v) => (
            <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "boolean") {
    return (
      <Select
        value={typeof rule.value === "string" ? rule.value : ""}
        onValueChange={(val) => { onTouch(); updateRule(rule.id, { value: val }); }}
      >
        <SelectTrigger className="h-7 text-xs" style={{ minWidth: 100, flex: 1 }}>
          <SelectValue placeholder="Select" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="true" className="text-xs">True</SelectItem>
          <SelectItem value="false" className="text-xs">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (opDef.valueCount === 2) {
    const vals = Array.isArray(rule.value) ? rule.value as [string, string] : ["", ""];
    return (
      <div className="flex items-center gap-1 flex-1">
        <Input className="h-7 text-xs flex-1 min-w-0"
          type={field.type === "date" ? "date" : "number"}
          value={vals[0]}
          onChange={(e) => { onTouch(); updateRule(rule.id, { value: [e.target.value, vals[1]] }); }}
          placeholder="From" />
        <span style={{ fontSize: 11, color: "var(--muted-foreground)", flexShrink: 0 }}>–</span>
        <Input className="h-7 text-xs flex-1 min-w-0"
          type={field.type === "date" ? "date" : "number"}
          value={vals[1]}
          onChange={(e) => { onTouch(); updateRule(rule.id, { value: [vals[0], e.target.value] }); }}
          placeholder="To" />
      </div>
    );
  }

  if (rule.operator === "in_array" || rule.operator === "not_in_array") {
    return (
      <Input className="h-7 text-xs flex-1 min-w-0"
        value={Array.isArray(rule.value) ? (rule.value as string[]).join(", ") : (rule.value as string) ?? ""}
        onChange={(e) => {
          onTouch();
          updateRule(rule.id, { value: e.target.value.split(",").map((v) => v.trim()).filter(Boolean) });
        }}
        placeholder="val1, val2, val3" />
    );
  }

  return (
    <Input className="h-7 text-xs flex-1 min-w-0"
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(e) => { onTouch(); updateRule(rule.id, { value: e.target.value }); }}
      placeholder="Value..." />
  );
}

export const QueryRule = memo(function QueryRule({ rule, fields, groupId: _groupId, isOnly }: QueryRuleProps) {
  const updateRule = useQueryStore((s) => s.updateRule);
  const removeNode = useQueryStore((s) => s.removeNode);
  const { getErrorForNode, touchNode } = useValidation();
  const error = getErrorForNode(rule.id);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: rule.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const selectedField = fields.find((f) => f.name === rule.field);
  const availableOperators = selectedField ? getOperatorsForType(selectedField.type) : [];

  function handleFieldChange(fieldName: string) {
    const newField = fields.find((f) => f.name === fieldName);
    if (!newField) return;
    const ops = getOperatorsForType(newField.type);
    touchNode(rule.id);
    updateRule(rule.id, { field: fieldName, operator: ops[0]?.value ?? "equals", value: "" });
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div
        className={cn("flex flex-wrap items-center gap-1.5 p-2 rounded group transition-colors")}
        style={{
          background: "var(--surface)",
          border: `1px solid ${error ? "var(--error)" : "var(--border)"}`,
          backgroundColor: error ? "color-mix(in srgb, var(--error) 5%, var(--surface))" : "var(--surface)",
        }}
      >

        <button {...attributes} {...listeners}
          className="cursor-grab opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          style={{ color: "var(--muted-foreground)", background: "transparent", border: "none" }}
          aria-label="Drag to reorder">
          <GripVertical size={13} />
        </button>

        <Select value={rule.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="h-7 text-xs" style={{ width: 120, flexShrink: 0 }}>
            <SelectValue placeholder="Field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem key={f.name} value={f.name} className="text-xs">{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={rule.operator}
          onValueChange={(val) => { touchNode(rule.id); updateRule(rule.id, { operator: val as QueryRuleType["operator"], value: "" }); }}
          disabled={!selectedField}
        >
          <SelectTrigger className="h-7 text-xs" style={{ width: 130, flexShrink: 0 }}>
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map((op) => (
              <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex-1 min-w-[80px]">
          <ValueInput rule={rule} field={selectedField} onTouch={() => touchNode(rule.id)} />
        </div>

        <Button variant="ghost" size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => removeNode(rule.id)}
          disabled={isOnly}
          aria-label="Remove rule">
          <X size={12} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-2" style={{ color: "var(--error)" }}>
          <AlertCircle size={11} />
          <span style={{ fontSize: 11 }}>{error}</span>
        </div>
      )}
    </div>
  );
});
