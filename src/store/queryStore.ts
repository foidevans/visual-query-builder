import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";
import {
  QueryGroup, QueryNode, QueryRule, LogicalOperator,
  Operator, QueryPreset, QueryHistoryEntry, QueryResult,
} from "@/types/query";

export function createRule(field: string = "", operator: Operator = "equals"): QueryRule {
  return { id: crypto.randomUUID(), type: "rule", field, operator, value: "" };
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
  rootGroup: QueryGroup;
  selectedSchema: string;
  isExecuting: boolean;
  result: QueryResult | null;
  history: QueryHistoryEntry[];
  presets: QueryPreset[];
  setSelectedSchema: (schema: string) => void;
  addRule: (groupId: string) => void;
  updateRule: (ruleId: string, updates: Partial<Omit<QueryRule, "id" | "type">>) => void;
  removeNode: (nodeId: string) => void;
  removeLastRule: () => void;
  addGroup: (parentGroupId: string) => void;
  toggleLogicalOperator: (groupId: string) => void;
  toggleGroupCollapsed: (groupId: string) => void;
  reorderChildren: (groupId: string, fromIndex: number, toIndex: number) => void;
  setResult: (result: QueryResult | null) => void;
  setIsExecuting: (val: boolean) => void;
  addToHistory: (entry: QueryHistoryEntry) => void;
  savePreset: (name: string) => void;
  loadPreset: (presetId: string) => void;
  deletePreset: (presetId: string) => void;
  importQuery: (group: QueryGroup, schemaName: string) => void;
  resetQuery: () => void;
}

function updateNodeInTree(group: QueryGroup, nodeId: string, updater: (node: QueryNode) => QueryNode): QueryGroup {
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
      .map((child) => child.type === "group" ? removeNodeFromTree(child, nodeId) : child),
  };
}

function addToGroup(group: QueryGroup, targetGroupId: string, node: QueryNode): QueryGroup {
  if (group.id === targetGroupId) return { ...group, children: [...group.children, node] };
  return {
    ...group,
    children: group.children.map((child) =>
      child.type === "group" ? addToGroup(child, targetGroupId, node) : child
    ),
  };
}

function reorderInGroup(group: QueryGroup, targetGroupId: string, fromIndex: number, toIndex: number): QueryGroup {
  if (group.id === targetGroupId) {
    const children = [...group.children];
    const [moved] = children.splice(fromIndex, 1);
    children.splice(toIndex, 0, moved);
    return { ...group, children };
  }
  return {
    ...group,
    children: group.children.map((child) =>
      child.type === "group" ? reorderInGroup(child, targetGroupId, fromIndex, toIndex) : child
    ),
  };
}

// Find the last rule node id in the root group (not nested)
function getLastRootRuleId(group: QueryGroup): string | null {
  const rules = group.children.filter((c) => c.type === "rule");
  if (rules.length <= 1) return null; // never remove the last remaining rule
  return rules[rules.length - 1].id;
}

const initialRootGroup = createGroup("AND");

export const useQueryStore = create<QueryStore>()(
  devtools(
    persist(
      (set, get) => ({
        rootGroup: initialRootGroup,
        selectedSchema: "users",
        isExecuting: false,
        result: null,
        history: [],
        presets: [],

        setSelectedSchema: (schema) => set({ selectedSchema: schema, result: null }),

        addRule: (groupId) =>
          set((state) => ({ rootGroup: addToGroup(state.rootGroup, groupId, createRule()) })),

        updateRule: (ruleId, updates) =>
          set((state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, ruleId, (node) => ({ ...node, ...updates })),
          })),

        removeNode: (nodeId) =>
          set((state) => ({ rootGroup: removeNodeFromTree(state.rootGroup, nodeId) })),

        removeLastRule: () => {
          const { rootGroup } = get();
          const lastRuleId = getLastRootRuleId(rootGroup);
          if (!lastRuleId) return;
          set((state) => ({ rootGroup: removeNodeFromTree(state.rootGroup, lastRuleId) }));
        },

        addGroup: (parentGroupId) =>
          set((state) => ({ rootGroup: addToGroup(state.rootGroup, parentGroupId, createGroup()) })),

        toggleLogicalOperator: (groupId) =>
          set((state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, groupId, (node) =>
              node.type === "group"
                ? { ...node, logicalOperator: node.logicalOperator === "AND" ? "OR" : "AND" }
                : node
            ),
          })),

        toggleGroupCollapsed: (groupId) =>
          set((state) => ({
            rootGroup: updateNodeInTree(state.rootGroup, groupId, (node) =>
              node.type === "group" ? { ...node, collapsed: !node.collapsed } : node
            ),
          })),

        reorderChildren: (groupId, fromIndex, toIndex) =>
          set((state) => ({ rootGroup: reorderInGroup(state.rootGroup, groupId, fromIndex, toIndex) })),

        setResult: (result) => set({ result }),
        setIsExecuting: (val) => set({ isExecuting: val }),

        addToHistory: (entry) =>
          set((state) => ({ history: [entry, ...state.history].slice(0, 20) })),

        savePreset: (name) => {
          const { rootGroup, selectedSchema, presets } = get();
          const preset: QueryPreset = {
            id: crypto.randomUUID(),
            name,
            query: rootGroup,
            schemaName: selectedSchema,
            createdAt: new Date().toISOString(),
          };
          set({ presets: [preset, ...presets] });
        },

        loadPreset: (presetId) => {
          const preset = get().presets.find((p) => p.id === presetId);
          if (preset) set({ rootGroup: preset.query, selectedSchema: preset.schemaName, result: null });
        },

        deletePreset: (presetId) =>
          set((state) => ({ presets: state.presets.filter((p) => p.id !== presetId) })),

        importQuery: (group, schemaName) =>
          set({ rootGroup: group, selectedSchema: schemaName, result: null }),

        resetQuery: () => set({ rootGroup: createGroup("AND"), result: null }),
      }),
      {
        name: "visual-query-builder-storage",
        partialize: (state) => ({
          rootGroup: state.rootGroup,
          selectedSchema: state.selectedSchema,
          presets: state.presets,
          history: state.history,
        }),
      }
    ),
    { name: "QueryStore" }
  )
);
