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
  rule,
  field,
  onTouch,
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
        <SelectTrigger className="h-8 w-36 text-xs">
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
        <SelectTrigger className="h-8 w-36 text-xs">
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
      <div className="flex items-center gap-1">
        <Input
          className="h-8 w-24 text-xs"
          type={field.type === "date" ? "date" : "number"}
          value={vals[0]}
          onChange={(e) => { onTouch(); updateRule(rule.id, { value: [e.target.value, vals[1]] }); }}
          placeholder="From"
        />
        <span className="text-xs text-muted-foreground">and</span>
        <Input
          className="h-8 w-24 text-xs"
          type={field.type === "date" ? "date" : "number"}
          value={vals[1]}
          onChange={(e) => { onTouch(); updateRule(rule.id, { value: [vals[0], e.target.value] }); }}
          placeholder="To"
        />
      </div>
    );
  }

  if (rule.operator === "in_array" || rule.operator === "not_in_array") {
    return (
      <Input
        className="h-8 w-48 text-xs"
        value={Array.isArray(rule.value) ? (rule.value as string[]).join(", ") : (rule.value as string) ?? ""}
        onChange={(e) => {
          onTouch();
          updateRule(rule.id, {
            value: e.target.value.split(",").map((v) => v.trim()).filter(Boolean),
          });
        }}
        placeholder="val1, val2, val3"
      />
    );
  }

  return (
    <Input
      className="h-8 w-40 text-xs"
      type={field.type === "number" ? "number" : field.type === "date" ? "date" : "text"}
      value={typeof rule.value === "string" ? rule.value : ""}
      onChange={(e) => { onTouch(); updateRule(rule.id, { value: e.target.value }); }}
      placeholder="Enter value..."
    />
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
    updateRule(rule.id, {
      field: fieldName,
      operator: ops[0]?.value ?? "equals",
      value: "",
    });
  }

  return (
    <div ref={setNodeRef} style={style} className="space-y-1">
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-md bg-background border group transition-colors",
          error ? "border-rose-500/60 bg-rose-500/5" : "border-border"
        )}
      >
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
        >
          <GripVertical size={14} />
        </button>

        <Select value={rule.field} onValueChange={handleFieldChange}>
          <SelectTrigger className="h-8 w-36 text-xs">
            <SelectValue placeholder="Select field" />
          </SelectTrigger>
          <SelectContent>
            {fields.map((f) => (
              <SelectItem key={f.name} value={f.name} className="text-xs">{f.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={rule.operator}
          onValueChange={(val) => {
            touchNode(rule.id);
            updateRule(rule.id, { operator: val as QueryRuleType["operator"], value: "" });
          }}
          disabled={!selectedField}
        >
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Operator" />
          </SelectTrigger>
          <SelectContent>
            {availableOperators.map((op) => (
              <SelectItem key={op.value} value={op.value} className="text-xs">{op.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <ValueInput rule={rule} field={selectedField} onTouch={() => touchNode(rule.id)} />

        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
          onClick={() => removeNode(rule.id)}
          disabled={isOnly}
          aria-label="Remove rule"
        >
          <X size={13} />
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-1.5 px-2 text-rose-400 text-xs">
          <AlertCircle size={11} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
});
