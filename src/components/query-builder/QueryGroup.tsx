"use client";

import React, { memo } from "react";
import { ChevronDown, ChevronRight, Plus, Trash2, FolderPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QueryRule } from "./QueryRule";
import { SortableGroup } from "./SortableGroup";
import { useQueryStore } from "@/store/queryStore";
import { QueryGroup as QueryGroupType, QueryNode, FieldSchema } from "@/types/query";
import { cn } from "@/lib/utils";

interface QueryGroupProps {
  group: QueryGroupType;
  fields: FieldSchema[];
  depth?: number;
  isRoot?: boolean;
  parentHasOneChild?: boolean;
}

export const QueryGroup = memo(function QueryGroup({
  group,
  fields,
  depth = 0,
  isRoot = false,
  parentHasOneChild = false,
}: QueryGroupProps) {
  const {
    addRule,
    addGroup,
    removeNode,
    toggleLogicalOperator,
    toggleGroupCollapsed,
  } = useQueryStore();

  const depthColors = [
    "border-blue-500/40 bg-blue-500/5",
    "border-violet-500/40 bg-violet-500/5",
    "border-emerald-500/40 bg-emerald-500/5",
    "border-amber-500/40 bg-amber-500/5",
    "border-rose-500/40 bg-rose-500/5",
  ];

  const logicalBadgeColors = {
    AND: "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/30",
    OR: "bg-violet-500/20 text-violet-400 hover:bg-violet-500/30 border-violet-500/30",
  };

  const connectorColors = {
    AND: "text-blue-400 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20",
    OR: "text-violet-400 bg-violet-500/10 border border-violet-500/30 hover:bg-violet-500/20",
  };

  const borderColor = depthColors[depth % depthColors.length];
  const childIds = group.children.map((c) => c.id);
  const isOnly = group.children.length === 1;

  return (
    <div className={cn("rounded-lg border-2 p-3 space-y-2 transition-all duration-200", borderColor)}>
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => toggleGroupCollapsed(group.id)}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label={group.collapsed ? "Expand group" : "Collapse group"}
        >
          {group.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <Badge
          variant="outline"
          className={cn(
            "cursor-pointer select-none text-xs font-bold px-2 py-0.5 transition-colors gap-1",
            logicalBadgeColors[group.logicalOperator]
          )}
          onClick={() => toggleLogicalOperator(group.id)}
          title="Click to toggle between AND / OR"
        >
          {group.logicalOperator}
          <span style={{ fontSize: 8, opacity: 0.7 }}>▼</span>
        </Badge>

        {depth > 0 && (
          <span className="text-xs text-muted-foreground">Nested group · depth {depth}</span>
        )}

        {isRoot && (
          <span className="text-xs text-muted-foreground ml-1">
            {group.children.length} condition{group.children.length !== 1 ? "s" : ""}
          </span>
        )}

        <div className="flex-1" />

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => addRule(group.id)}
          >
            <Plus size={12} />
            Add Rule
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
            onClick={() => addGroup(group.id)}
          >
            <FolderPlus size={12} />
            Add Group
          </Button>

          {!isRoot && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => removeNode(group.id)}
              disabled={parentHasOneChild}
              aria-label="Remove group"
            >
              <Trash2 size={13} />
            </Button>
          )}
        </div>
      </div>

      {!group.collapsed && (
        <SortableGroup groupId={group.id} childIds={childIds}>
          {group.children.map((child: QueryNode, index: number) => (
            <div key={child.id} className="relative">
              {index > 0 && (
                <div className="flex items-center gap-2 my-1 pl-1">
                  <div className="h-px flex-1 bg-border" />
                  <button
                    onClick={() => toggleLogicalOperator(group.id)}
                    title="Click to toggle between AND / OR"
                    className={cn(
                      "text-xs font-semibold px-2 py-0.5 rounded cursor-pointer transition-colors",
                      connectorColors[group.logicalOperator]
                    )}
                  >
                    {group.logicalOperator}
                  </button>
                  <div className="h-px flex-1 bg-border" />
                </div>
              )}

              {child.type === "rule" ? (
                <QueryRule
                  rule={child}
                  fields={fields}
                  groupId={group.id}
                  isOnly={isOnly}
                />
              ) : (
                <QueryGroup
                  group={child}
                  fields={fields}
                  depth={depth + 1}
                  parentHasOneChild={isOnly}
                />
              )}
            </div>
          ))}
        </SortableGroup>
      )}
    </div>
  );
});
