"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateSQL, generateMongo } from "@/lib/queryGenerator";
import { useQueryStore } from "@/store/queryStore";

export function QueryPreview() {
  const rootGroup = useQueryStore((s) => s.rootGroup);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"sql" | "mongo">("sql");

  const sql = useMemo(() => generateSQL(rootGroup), [rootGroup]);
  const mongo = useMemo(() => generateMongo(rootGroup), [rootGroup]);

  const activeContent = activeTab === "sql" ? sql : mongo;

  async function handleCopy() {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col h-full rounded"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

      <div className="flex items-center justify-between px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)" }}>
        <div className="flex items-center gap-1">
          <span style={{
            fontSize: 12, fontWeight: 600,
            color: "var(--foreground)", letterSpacing: "0.02em"
          }}>
            QUERY PREVIEW
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded overflow-hidden"
            style={{ border: "1px solid var(--border)" }}>
            {(["sql", "mongo"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{
                  padding: "2px 10px",
                  fontSize: 11,
                  fontWeight: 500,
                  fontFamily: "var(--font-jetbrains), monospace",
                  background: activeTab === tab ? "var(--primary)" : "transparent",
                  color: activeTab === tab ? "#fff" : "var(--muted-foreground)",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 150ms",
                  textTransform: "uppercase",
                }}>
                {tab}
              </button>
            ))}
          </div>
          <Button variant="ghost" size="sm" className="h-6 gap-1 px-2"
            style={{ fontSize: 11, color: "var(--muted-foreground)" }}
            onClick={handleCopy}>
            {copied
              ? <><Check size={11} style={{ color: "var(--success)" }} /> Copied</>
              : <><Copy size={11} /> Copy</>
            }
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        <pre style={{
          margin: 0,
          padding: "12px 16px",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 12,
          lineHeight: "20px",
          color: activeTab === "sql" ? "#22c55e" : "#a855f7",
          whiteSpace: "pre",
          minWidth: "max-content",
        }}>
          {activeContent}
        </pre>
      </div>
    </div>
  );
}
