"use client";

import React, { useRef, useState } from "react";
import {
  RotateCcw, Download, Upload, Save, History,
  BookMarked, Trash2, ChevronDown, AlertCircle, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useQueryStore } from "@/store/queryStore";
import { useValidation } from "@/hooks/useValidation";
import { KeyboardShortcuts } from "./KeyboardShortcuts";
import { QueryGroup } from "@/types/query";

export function QueryToolbar() {
  const {
    resetQuery, savePreset, loadPreset, deletePreset,
    importQuery, rootGroup, selectedSchema, presets, history,
  } = useQueryStore();

  const { valid, visibleErrorCount } = useValidation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [presetName, setPresetName] = useState("");
  const [showPresetInput, setShowPresetInput] = useState(false);

  function handleExport() {
    const payload = { query: rootGroup, schemaName: selectedSchema };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `query-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = JSON.parse(ev.target?.result as string);
        if (parsed.query && parsed.schemaName) {
          importQuery(parsed.query as QueryGroup, parsed.schemaName);
        }
      } catch {
        alert("Invalid query JSON file");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  function handleSavePreset() {
    if (!presetName.trim()) return;
    savePreset(presetName.trim());
    setPresetName("");
    setShowPresetInput(false);
  }

  return (
    <div className="flex items-center gap-2 px-4 py-2 border-b flex-wrap shrink-0"
      style={{ borderColor: "var(--border)", background: "var(--surface-dim)" }}>

      {valid ? (
        <Badge variant="outline" className="text-xs gap-1"
          style={{ color: "var(--success)", borderColor: "var(--success)", background: "transparent" }}>
          <CheckCircle2 size={10} />
          Valid
        </Badge>
      ) : (
        <Badge variant="outline" className="text-xs gap-1"
          style={{ color: "var(--error)", borderColor: "var(--error)", background: "transparent" }}>
          <AlertCircle size={10} />
          {visibleErrorCount > 0 ? `${visibleErrorCount} error${visibleErrorCount !== 1 ? "s" : ""}` : "Invalid"}
        </Badge>
      )}

      <Separator orientation="vertical" className="h-5" />

      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
        style={{ color: "var(--muted-foreground)" }} onClick={resetQuery}>
        <RotateCcw size={12} /> Reset
      </Button>

      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
        style={{ color: "var(--muted-foreground)" }} onClick={handleExport}>
        <Download size={12} /> Export
      </Button>

      <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
        style={{ color: "var(--muted-foreground)" }}
        onClick={() => fileInputRef.current?.click()}>
        <Upload size={12} /> Import
      </Button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />

      {showPresetInput ? (
        <div className="flex items-center gap-1">
          <input
            autoFocus
            className="h-7 text-xs px-2 rounded outline-none"
            style={{
              width: 140, background: "var(--input)",
              border: "1px solid var(--border)", color: "var(--foreground)",
            }}
            placeholder="Preset name..."
            value={presetName}
            onChange={(e) => setPresetName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSavePreset();
              if (e.key === "Escape") setShowPresetInput(false);
            }}
          />
          <Button size="sm" className="h-7 text-xs" onClick={handleSavePreset}>Save</Button>
        </div>
      ) : (
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => setShowPresetInput(true)}>
          <Save size={12} /> Save Preset
        </Button>
      )}

      {presets.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
              style={{ color: "var(--muted-foreground)" }}>
              <BookMarked size={12} /> Presets <ChevronDown size={10} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel className="text-xs">Saved Presets</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-48">
              {presets.map((preset) => (
                <DropdownMenuItem key={preset.id} className="flex items-center justify-between group">
                  <button className="text-xs flex-1 text-left" onClick={() => loadPreset(preset.id)}>
                    {preset.name}
                    <span className="block text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                      {preset.schemaName}
                    </span>
                  </button>
                  <button
                    className="opacity-0 group-hover:opacity-100 transition-all"
                    style={{ color: "var(--muted-foreground)", background: "transparent", border: "none" }}
                    onClick={(e) => { e.stopPropagation(); deletePreset(preset.id); }}
                  >
                    <Trash2 size={11} />
                  </button>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {history.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1"
              style={{ color: "var(--muted-foreground)" }}>
              <History size={12} /> History <ChevronDown size={10} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-xs">Query History</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <ScrollArea className="max-h-64">
              {history.map((entry) => (
                <DropdownMenuItem
                  key={entry.id}
                  className="text-xs flex flex-col items-start gap-0.5 cursor-pointer"
                  onClick={() => importQuery(entry.query, entry.schemaName)}
                >
                  <span className="font-medium">{entry.schemaName}</span>
                  <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                    {new Date(entry.executedAt).toLocaleTimeString()} · {entry.resultCount} rows
                  </span>
                </DropdownMenuItem>
              ))}
            </ScrollArea>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="ml-auto">
        <KeyboardShortcuts />
      </div>
    </div>
  );
}
