import { create } from "zustand";
import { devtools } from "zustand/middleware";

import {
  QueryGroup,
  QueryNode,
  QueryRule,
  LogicalOperator,
  Operator,
  QueryPreset,
  QueryHistoryEntry,
  QueryResult,
} from "@/types/query";


export function createRule(field: string = "", operator: Operator = "equals"): QueryRule {
  return {
    id: crypto.randomUUID(),
    type: "rule",
    field,
    operator,
    value: "",
  };
}

export function createGroup(logicalOperator: LogicalOperator = "AND"): QueryGroup {
  return {
    id: crypto.randomUUID(),
    type: "group",
    logicalOperator,
    children: [createRule()],
    collapsed: false,
  };
}


interface QueryStore {
  // Query tree
  rootGroup: QueryGroup;
  selectedSchema: string;

  // UI state
  isExecuting: boolean;
  result: QueryResult | null;

  // History & presets
  history: QueryHistoryEntry[];
  presets: QueryPreset[];

  // Schema actions
  setSelectedSchema: (schema: string) => void;

  // Rule actions
  addRule: (groupId: string) => void;
  updateRule: (ruleId: string, updates: Partial<Omit<QueryRule, "id" | "type">>) => void;
  removeNode: (nodeId: string) => void;

  // Group actions
  addGroup: (parentGroupId: string) => void;
  toggleLogicalOperator: (groupId: string) => void;
  toggleGroupCollapsed: (groupId: string) => void;

  // Reorder
  reorderChildren: (groupId: string, fromIndex: number, toIndex: number) => void;

  // Execution
  setResult: (result: QueryResult | null) => void;
  setIsExecuting: (val: boolean) => void;
  addToHistory: (entry: QueryHistoryEntry) => void;

  // Presets
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;

  // Import/export
  importQuery: (group: QueryGroup, schemaName: string) => void;
  resetQuery: () => void;
}


function updateNodeInTree(
  group: QueryGroup,
  nodeId: string,
  updater: (node: QueryNode) => QueryNode
): QueryGroup {
  return {
    ...group,
    children: group.children.map((child) => {
      if (child.id === nodeId) return updater(child);
      if (child.type === "group") return updateNodeInTree(child, nodeId, updater);
      return child;
    }),
  };
}

function removeNodeFromTree(group: QueryGroup, nodeId: string): QueryGroup {
  return {
    ...group,
    children: group.children
      .filter((child) => child.id !== nodeId)
      .map((child) =>
        child.type === "group" ? removeNodeFromTree(child, nodeId) : child
      ),
  };
}

function addToGroup(group: QueryGroup, targetGroupId: string, node: QueryNode): QueryGroup {
  if (group.id === targetGroupId) {
    return { ...group, children: [...group.children, node] };
  }
  return {
    ...group,
    children: group.children.map((child) =>
      child.type === "group" ? addToGroup(child, targetGroupId, node) : child
    ),
  };
}

function reorderInGroup(
  group: QueryGroup,
  targetGroupId: string,
  fromIndex: number,
  toIndex: number
): QueryGroup {
  if (group.id === targetGroupId) {
    const children = [...group.children];
    const [moved] = children.splice(fromIndex, 1);
    children.splice(toIndex, 0, moved);
    return { ...group, children };
  }
  return {
    ...group,
    children: group.children.map((child) =>
      child.type === "group"
        ? reorderInGroup(child, targetGroupId, fromIndex, toIndex)
        : child
    ),
  };
}


const initialRootGroup = createGroup("AND");


export const useQueryStore = create<QueryStore>()(
  devtools(
    (set, get) => ({
      rootGroup: initialRootGroup,
      selectedSchema: "users",
      isExecuting: false,
      result: null,
      history: [],
      presets: [],

      setSelectedSchema: (schema) =>
        set({ selectedSchema: schema, result: null }, false, "setSelectedSchema"),

      addRule: (groupId) =>
        set(
          (state) => ({
            rootGroup: addToGroup(state.rootGroup, groupId, createRule()),
          }),
          false,
          "addRule"
        ),

      updateRule: (ruleId, updates) =>
        set(
          (state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, ruleId, (node) => ({
              ...node,
              ...updates,
            })),
          }),
          false,
          "updateRule"
        ),

      removeNode: (nodeId) =>
        set(
          (state) => ({
            rootGroup: removeNodeFromTree(state.rootGroup, nodeId),
          }),
          false,
          "removeNode"
        ),

      addGroup: (parentGroupId) =>
        set(
          (state) => ({
            rootGroup: addToGroup(state.rootGroup, parentGroupId, createGroup()),
          }),
          false,
          "addGroup"
        ),

      toggleLogicalOperator: (groupId) =>
        set(
          (state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, groupId, (node) =>
              node.type === "group"
                ? {
                    ...node,
                    logicalOperator:
                      node.logicalOperator === "AND" ? "OR" : "AND",
                  }
                : node
            ),
          }),
          false,
          "toggleLogicalOperator"
        ),

      toggleGroupCollapsed: (groupId) =>
        set(
          (state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, groupId, (node) =>
              node.type === "group"
                ? { ...node, collapsed: !node.collapsed }
                : node
            ),
          }),
          false,
          "toggleGroupCollapsed"
        ),

      reorderChildren: (groupId, fromIndex, toIndex) =>
        set(
          (state) => ({
            rootGroup: reorderInGroup(
              state.rootGroup,
              groupId,
              fromIndex,
              toIndex
            ),
          }),
          false,
          "reorderChildren"
        ),

      setResult: (result) => set({ result }, false, "setResult"),

      setIsExecuting: (val) => set({ isExecuting: val }, false, "setIsExecuting"),

      addToHistory: (entry) =>
        set(
          (state) => ({
            history: [entry, ...state.history].slice(0, 20),
          }),
          false,
          "addToHistory"
        ),

      savePreset: (name) => {
        const { rootGroup, selectedSchema, presets } = get();
        const preset: QueryPreset = {
          id: crypto.randomUUID(),
          name,
          query: rootGroup,
          schemaName: selectedSchema,
          createdAt: new Date().toISOString(),
        };
        set({ presets: [preset, ...presets] }, false, "savePreset");
      },

      loadPreset: (presetId) => {
        const { presets } = get();
        const preset = presets.find((p) => p.id === presetId);
        if (preset) {
          set(
            { rootGroup: preset.query, selectedSchema: preset.schemaName, result: null },
            false,
            "loadPreset"
          );
        }
      },

      deletePreset: (presetId) =>
        set(
          (state) => ({
            presets: state.presets.filter((p) => p.id !== presetId),
          }),
          false,
          "deletePreset"
        ),

      importQuery: (group, schemaName) =>
        set(
          { rootGroup: group, selectedSchema: schemaName, result: null },
          false,
          "importQuery"
        ),

      resetQuery: () =>
        set(
          { rootGroup: createGroup("AND"), result: null },
          false,
          "resetQuery"
        ),
    }),
    { name: "QueryStore" }
  )
);
