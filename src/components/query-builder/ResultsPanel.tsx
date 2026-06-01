"use client";

import React, { useMemo, useState } from "react";
import { Play, Loader2, Inbox, Clock, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

    const queryResult = { data: results, totalCount: results.length, executionTimeMs };
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
    <div className="flex flex-col h-full rounded"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--foreground)", letterSpacing: "0.02em" }}>
          RESULTS
        </span>
        <div className="flex items-center gap-2">
          {result && (
            <>
              <Badge variant="outline" className="text-xs gap-1"
                style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
                <Hash size={10} />{result.totalCount} rows
              </Badge>
              <Badge variant="outline" className="text-xs gap-1"
                style={{ color: "var(--muted-foreground)", borderColor: "var(--border)" }}>
                <Clock size={10} />{result.executionTimeMs}ms
              </Badge>
            </>
          )}
          <Button size="sm" className="h-7 text-xs gap-1"
            style={{ background: "var(--primary)", color: "#fff", border: "none" }}
            onClick={handleExecute}
            disabled={isExecuting}>
            {isExecuting
              ? <><Loader2 size={11} className="animate-spin" /> Running...</>
              : <><Play size={11} /> Run Query</>
            }
          </Button>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 min-h-0 relative">
        {isExecuting && (
          <div className="absolute inset-0 flex items-center justify-center gap-2"
            style={{ color: "var(--muted-foreground)", fontSize: 13 }}>
            <Loader2 size={15} className="animate-spin" />
            Executing query...
          </div>
        )}

        {!isExecuting && !result && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ color: "var(--muted-foreground)" }}>
            <Play size={28} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 12 }}>Run a query to see results</p>
          </div>
        )}

        {!isExecuting && result && result.totalCount === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2"
            style={{ color: "var(--muted-foreground)" }}>
            <Inbox size={28} style={{ opacity: 0.2 }} />
            <p style={{ fontSize: 12 }}>No records match your query</p>
          </div>
        )}

        {!isExecuting && result && result.totalCount > 0 && (
          <div className="absolute inset-0 overflow-auto">
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead style={{ position: "sticky", top: 0, zIndex: 1, background: "var(--surface-high)" }}>
                <tr>
                  {columns.map((col) => (
                    <th key={col} style={{
                      textAlign: "left",
                      padding: "6px 12px",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.05em",
                      color: "var(--muted-foreground)",
                      whiteSpace: "nowrap",
                      borderBottom: "1px solid var(--border)",
                    }}>
                      {col.toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginated.map((row, i) => (
                  <tr key={i}
                    style={{ borderBottom: "1px solid var(--border)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    {columns.map((col) => (
                      <td key={col} style={{
                        padding: "6px 12px",
                        fontFamily: "var(--font-jetbrains), monospace",
                        fontSize: 11,
                        color: "var(--muted-foreground)",
                        whiteSpace: "nowrap",
                      }}>
                        {String(row[col] ?? "")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-3 py-2 shrink-0"
          style={{ borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="h-6 text-xs px-2"
              onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
              Prev
            </Button>
            <Button variant="outline" size="sm" className="h-6 text-xs px-2"
              onClick={() => setPage((p) => p + 1)} disabled={page === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
