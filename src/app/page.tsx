"use client";

import React from "react";
import { Database } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { QueryGroup } from "@/components/query-builder/QueryGroup";
import { QueryPreview } from "@/components/query-builder/QueryPreview";
import { ResultsPanel } from "@/components/query-builder/ResultsPanel";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";

export default function Home() {
  const { rootGroup, selectedSchema, setSelectedSchema, resetQuery } = useQueryStore();

  const schema = SCHEMAS.find((s) => s.name === selectedSchema);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-6 py-3 flex items-center gap-3">
        <Database size={20} className="text-blue-400" />
        <span className="font-semibold text-sm tracking-tight">Visual Query Builder</span>
        <div className="flex-1" />
        <Select value={selectedSchema} onValueChange={(val) => { setSelectedSchema(val); resetQuery(); }}>
          <SelectTrigger className="h-8 w-40 text-xs">
            <SelectValue placeholder="Select schema" />
          </SelectTrigger>
          <SelectContent>
            {SCHEMAS.map((s) => (
              <SelectItem key={s.name} value={s.name} className="text-xs">
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </header>

      <div className="flex flex-1 overflow-hidden gap-0">
        <div className="flex flex-col w-full lg:w-1/2 border-r border-border">
          <div className="px-4 py-2 border-b border-border flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Query Builder · {schema?.label}
            </span>
          </div>
          <ScrollArea className="flex-1 p-4">
            {schema && (
              <QueryGroup
                group={rootGroup}
                fields={schema.fields}
                depth={0}
                isRoot
              />
            )}
          </ScrollArea>
        </div>

        <div className="hidden lg:flex flex-col w-1/2 overflow-hidden">
          <div className="flex-1 overflow-hidden p-4 pb-2">
            <QueryPreview />
          </div>
          <div className="flex-1 overflow-hidden p-4 pt-2">
            <ResultsPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
