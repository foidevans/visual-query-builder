"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Eye, Play } from "lucide-react";
import { QueryGroup } from "@/components/query-builder/QueryGroup";
import { QueryPreview } from "@/components/query-builder/QueryPreview";
import { ResultsPanel } from "@/components/query-builder/ResultsPanel";
import { QueryToolbar } from "@/components/query-builder/QueryToolbar";
import { SchemaSidebar } from "@/components/query-builder/SchemaSidebar";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";

export function QueryBuilderShell() {
  const { rootGroup, selectedSchema } = useQueryStore();
  const schema = SCHEMAS.find((s) => s.name === selectedSchema);
  const [mounted, setMounted] = useState(false);
  const [mobileTab, setMobileTab] = useState("builder");

  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Database size={28} style={{ color: "var(--primary)" }} className="animate-pulse" />
          <p style={{ fontSize: 13, color: "var(--muted-foreground)" }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:flex flex-1 min-h-0">

        {schema && <SchemaSidebar fields={schema.fields} schemaName={schema.label} />}

        <div className="flex flex-col flex-1 min-h-0 min-w-0"
          style={{ borderRight: "1px solid var(--border)" }}>
          <QueryToolbar />
          <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
            style={{ padding: 16 }}>
            {schema && (
              <QueryGroup group={rootGroup} fields={schema.fields} depth={0} isRoot />
            )}
          </div>
        </div>

        <div className="flex flex-col min-h-0"
          style={{ width: 380, flexShrink: 0 }}>
          <div className="flex-1 min-h-0 overflow-hidden" style={{ padding: "16px 16px 8px" }}>
            <QueryPreview />
          </div>
          <div className="flex-1 min-h-0 overflow-hidden" style={{ padding: "8px 16px 16px" }}>
            <ResultsPanel />
          </div>
        </div>
      </div>

      <div className="flex lg:hidden flex-col flex-1 min-h-0">
        <QueryToolbar />
        <Tabs value={mobileTab} onValueChange={setMobileTab}
          className="flex flex-col flex-1 min-h-0">
          <TabsList
            className="w-full rounded-none border-b bg-transparent justify-start px-4 gap-2 h-10 shrink-0"
            style={{ borderColor: "var(--border)" }}>
            <TabsTrigger value="builder" className="text-xs gap-1.5">
              <Database size={12} /> Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs gap-1.5">
              <Eye size={12} /> Preview
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs gap-1.5">
              <Play size={12} /> Results
            </TabsTrigger>
          </TabsList>

          <TabsContent value="builder" className="flex-1 min-h-0 m-0">
            <div className="h-full overflow-y-auto overflow-x-hidden" style={{ padding: 16 }}>
              {schema && (
                <QueryGroup group={rootGroup} fields={schema.fields} depth={0} isRoot />
              )}
            </div>
          </TabsContent>

          <TabsContent value="preview" className="flex-1 min-h-0 m-0" style={{ padding: 16 }}>
            <QueryPreview />
          </TabsContent>

          <TabsContent value="results" className="flex-1 min-h-0 m-0" style={{ padding: 16 }}>
            <ResultsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
