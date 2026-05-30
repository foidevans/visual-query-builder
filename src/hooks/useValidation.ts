import { useMemo, useCallback, useState } from "react";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";
import { validateQuery } from "@/lib/validator";

export function useValidation() {
  const rootGroup = useQueryStore((s) => s.rootGroup);
  const selectedSchema = useQueryStore((s) => s.selectedSchema);
  const [touchedIds, setTouchedIds] = useState<Set<string>>(new Set());

  const schema = SCHEMAS.find((s) => s.name === selectedSchema);

  const result = useMemo(() => {
    if (!schema) return { valid: true, errors: [] };
    return validateQuery(rootGroup, schema.fields);
  }, [rootGroup, schema]);

  const touchNode = useCallback((nodeId: string) => {
    setTouchedIds((prev) => new Set(prev).add(nodeId));
  }, []);

  const resetTouched = useCallback(() => {
    setTouchedIds(new Set());
  }, []);

  function getErrorForNode(nodeId: string): string | undefined {
    if (!touchedIds.has(nodeId)) return undefined;
    return result.errors.find((e) => e.nodeId === nodeId)?.message;
  }

  const visibleErrorCount = result.errors.filter((e) =>
    touchedIds.has(e.nodeId)
  ).length;

  return {
    ...result,
    getErrorForNode,
    touchNode,
    resetTouched,
    visibleErrorCount,
  };
}
