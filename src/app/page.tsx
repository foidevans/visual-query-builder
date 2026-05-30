"use client";

import { Database } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QueryBuilderShell } from "@/components/query-builder/QueryBuilderShell";
import { ThemeToggle } from "@/components/query-builder/ThemeToggle";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";

export default function Home() {
  const { selectedSchema, setSelectedSchema, resetQuery } = useQueryStore();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border px-4 py-3 flex items-center gap-3 shrink-0">
        <Database size={18} className="text-blue-400 shrink-0" />
        <span className="font-semibold text-sm tracking-tight">Visual Query Builder</span>
        <div className="flex-1" />
        <Select
          value={selectedSchema}
          onValueChange={(val) => { setSelectedSchema(val); resetQuery(); }}
        >
          <SelectTrigger className="h-8 w-32 text-xs">
            <SelectValue placeholder="Schema" />
          </SelectTrigger>
          <SelectContent>
            {SCHEMAS.map((s) => (
              <SelectItem key={s.name} value={s.name} className="text-xs">{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ThemeToggle />
      </header>

      <QueryBuilderShell />
    </div>
  );
}
