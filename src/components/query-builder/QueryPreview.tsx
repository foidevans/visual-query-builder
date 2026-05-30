"use client";

import React, { useState, useMemo } from "react";
import { Copy, Check } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { generateSQL, generateMongo } from "@/lib/queryGenerator";
import { useQueryStore } from "@/store/queryStore";

export function QueryPreview() {
  const rootGroup = useQueryStore((s) => s.rootGroup);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("sql");

  const sql = useMemo(() => generateSQL(rootGroup), [rootGroup]);
  const mongo = useMemo(() => generateMongo(rootGroup), [rootGroup]);

  const activeContent = activeTab === "sql" ? sql : mongo;

  async function handleCopy() {
    await navigator.clipboard.writeText(activeContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border border-border bg-card h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <span className="text-sm font-medium">Query Preview</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1 text-xs text-muted-foreground"
          onClick={handleCopy}
        >
          {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy"}
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col flex-1">
        <TabsList className="w-full rounded-none border-b border-border bg-transparent justify-start px-4 gap-2 h-9">
          <TabsTrigger value="sql" className="text-xs h-7 data-[state=active]:bg-muted">
            SQL
          </TabsTrigger>
          <TabsTrigger value="mongo" className="text-xs h-7 data-[state=active]:bg-muted">
            MongoDB
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sql" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <pre className="p-4 text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed">
              {sql}
            </pre>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="mongo" className="flex-1 m-0">
          <ScrollArea className="h-full">
            <pre className="p-4 text-xs font-mono text-violet-400 whitespace-pre-wrap leading-relaxed">
              {mongo}
            </pre>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
