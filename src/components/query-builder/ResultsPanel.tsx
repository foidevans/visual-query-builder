"use client";

import React, { useMemo, useState } from "react";
import { Play, Loader2, Inbox, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQueryStore } from "@/store/queryStore";
import { executeQuery } from "@/lib/queryExecutor";
import { MOCK_DATA } from "@/data/mockData";
import { SCHEMAS } from "@/data/schemas";
import { validateQuery } from "@/lib/validator";

export function ResultsPanel() {
  const { rootGroup, selectedSchema, setResult, setIsExecuting, addToHistory, result, isExecuting } = useQueryStore();
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const schema = SCHEMAS.find((s) => s.name === selectedSchema);

  async function handleExecute() {
    if (!schema) return;

    const validation = validateQuery(rootGroup, schema.fields);
    if (!validation.valid) return;

    setIsExecuting(true);
    setResult(null);
    setPage(1);

    await new Promise((r) => setTimeout(r, 400));

    const data = MOCK_DATA[selectedSchema] ?? [];
    const { results, executionTimeMs } = executeQuery(data, rootGroup);

    const queryResult = {
      data: results,
      totalCount: results.length,
      executionTimeMs,
    };

    setResult(queryResult);
    setIsExecuting(false);

    addToHistory({
      id: crypto.randomUUID(),
      query: rootGroup,
      schemaName: selectedSchema,
      executedAt: new Date().toISOString(),
      resultCount: results.length,
    });
  }

  const columns = useMemo(() => {
    if (!result || result.data.length === 0) return [];
    return Object.keys(result.data[0]);
  }, [result]);

  const paginated = useMemo(() => {
    if (!result) return [];
    return result.data.slice((page - 1) * pageSize, page * pageSize);
  }, [result, page]);

  const totalPages = result ? Math.ceil(result.totalCount / pageSize) : 0;

  return (
    <div className="rounded-lg border border-border bg-card flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-sm font-medium">Results</span>
        <div className="flex items-center gap-2">
          {result && (
            <>
              <Badge variant="outline" className="text-xs gap-1">
                <Hash size={10} />
                {result.totalCount} rows
              </Badge>
              <Badge variant="outline" className="text-xs gap-1">
                <Clock size={10} />
                {result.executionTimeMs}ms
              </Badge>
            </>
          )}
          <Button
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleExecute}
            disabled={isExecuting}
          >
            {isExecuting ? (
              <Loader2 size={12} className="animate-spin" />
            ) : (
              <Play size={12} />
            )}
            {isExecuting ? "Running..." : "Run Query"}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {isExecuting && (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground text-sm">
            <Loader2 size={16} className="animate-spin" />
            Executing query...
          </div>
        )}

        {!isExecuting && !result && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <Play size={32} className="opacity-20" />
            <p className="text-sm">Run a query to see results</p>
          </div>
        )}

        {!isExecuting && result && result.totalCount === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
            <Inbox size={32} className="opacity-20" />
            <p className="text-sm">No records match your query</p>
          </div>
        )}

        {!isExecuting && result && result.totalCount > 0 && (
          <ScrollArea className="h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-muted border-b border-border">
                  <tr>
                    {columns.map((col) => (
                      <th key={col} className="text-left px-3 py-2 font-medium text-muted-foreground whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((row, i) => (
                    <tr key={i} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                      {columns.map((col) => (
                        <td key={col} className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                          {String(row[col] ?? "")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ScrollArea>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-2 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Prev
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
