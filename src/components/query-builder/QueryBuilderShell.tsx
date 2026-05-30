"use client";

import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Eye, Play } from "lucide-react";
import { QueryGroup } from "@/components/query-builder/QueryGroup";
import { QueryPreview } from "@/components/query-builder/QueryPreview";
import { ResultsPanel } from "@/components/query-builder/ResultsPanel";
import { QueryToolbar } from "@/components/query-builder/QueryToolbar";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";

export function QueryBuilderShell() {
  const { rootGroup, selectedSchema } = useQueryStore();
  const schema = SCHEMAS.find((s) => s.name === selectedSchema);
  const [mounted, setMounted] = useState(false);
  const [mobileTab, setMobileTab] = useState("builder");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Database size={32} className="text-blue-400 animate-pulse" />
          <p className="text-sm">Loading query builder...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hidden lg:flex flex-1 overflow-hidden">
        <div className="flex flex-col w-1/2 border-r border-border overflow-hidden">
          <QueryToolbar />
          <ScrollArea className="flex-1 p-4">
            {schema && <QueryGroup group={rootGroup} fields={schema.fields} depth={0} isRoot />}
          </ScrollArea>
        </div>
        <div className="flex flex-col w-1/2 overflow-hidden">
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
          <TabsList className="w-full rounded-none border-b border-border bg-transparent justify-start px-4 gap-2 h-10 shrink-0">
            <TabsTrigger value="builder" className="text-xs gap-1.5 data-[state=active]:bg-muted">
              <Database size={12} />
              Builder
            </TabsTrigger>
            <TabsTrigger value="preview" className="text-xs gap-1.5 data-[state=active]:bg-muted">
              <Eye size={12} />
              Preview
            </TabsTrigger>
            <TabsTrigger value="results" className="text-xs gap-1.5 data-[state=active]:bg-muted">
              <Play size={12} />
              Results
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
