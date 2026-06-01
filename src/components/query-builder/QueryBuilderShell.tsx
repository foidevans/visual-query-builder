"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
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
          <Database size={28} style={{ color: "#3b82f6" }} className="animate-pulse" />
          <p style={{ fontFamily: "Inter", fontSize: 13, color: "#8c909f" }}>Loading workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:flex flex-1 overflow-hidden">
        {schema && <SchemaSidebar fields={schema.fields} schemaName={schema.label} />}

        <div className="flex flex-col flex-1 overflow-hidden" style={{ borderRight: "1px solid #2a2a2a" }}>
          <QueryToolbar />
          <ScrollArea className="flex-1 p-4">
            {schema && (
              <QueryGroup group={rootGroup} fields={schema.fields} depth={0} isRoot />
            )}
          </ScrollArea>
        </div>

        <div className="flex flex-col overflow-hidden" style={{ width: 380, flexShrink: 0 }}>
          <div className="flex-1 overflow-hidden p-4 pb-2">
            <QueryPreview />
          </div>
          <div className="flex-1 overflow-hidden p-4 pt-2">
            <ResultsPanel />
          </div>
        </div>
      </div>

      <div className="flex lg:hidden flex-col flex-1 overflow-hidden">
        <QueryToolbar />
        <Tabs value={mobileTab} onValueChange={setMobileTab} className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="w-full rounded-none border-b bg-transparent justify-start px-4 gap-2 h-10 shrink-0"
            style={{ borderColor: "#2a2a2a" }}>
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
          <TabsContent value="builder" className="flex-1 overflow-hidden m-0">
            <ScrollArea className="h-full p-4">
              {schema && <QueryGroup group={rootGroup} fields={schema.fields} depth={0} isRoot />}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="preview" className="flex-1 overflow-hidden m-0 p-4">
            <QueryPreview />
          </TabsContent>
          <TabsContent value="results" className="flex-1 overflow-hidden m-0 p-4">
            <ResultsPanel />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
