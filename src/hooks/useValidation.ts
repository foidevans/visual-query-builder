import { useMemo } from "react";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";
import { validateQuery } from "@/lib/validator";

export function useValidation() {
  const rootGroup = useQueryStore((s) => s.rootGroup);
  const selectedSchema = useQueryStore((s) => s.selectedSchema);

  const schema = SCHEMAS.find((s) => s.name === selectedSchema);

  const result = useMemo(() => {
    if (!schema) return { valid: true, errors: [] };
    return validateQuery(rootGroup, schema.fields);
  }, [rootGroup, schema]);

  function getErrorForNode(nodeId: string): string | undefined {
    return result.errors.find((e) => e.nodeId === nodeId)?.message;
  }

  return { ...result, getErrorForNode };
}
