"use client";

import React, { useRef, useState } from "react";
import {
  RotateCcw, Download, Upload, Save, History,
  BookMarked, Trash2, ChevronDown, AlertCircle,
  CheckCircle2, MoreHorizontal, X,
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
  const [showDrawer, setShowDrawer] = useState(false);
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

  const validationBadge = valid ? (
    <Badge variant="outline" className="text-xs gap-1 shrink-0"
      style={{ color: "var(--success)", borderColor: "var(--success)", background: "transparent" }}>
      <CheckCircle2 size={10} /> Valid
    </Badge>
  ) : (
    <Badge variant="outline" className="text-xs gap-1 shrink-0"
      style={{ color: "var(--error)", borderColor: "var(--error)", background: "transparent" }}>
      <AlertCircle size={10} />
      {visibleErrorCount > 0 ? `${visibleErrorCount} error${visibleErrorCount !== 1 ? "s" : ""}` : "Invalid"}
    </Badge>
  );

  return (
    <>
      <div className="hidden lg:flex items-center gap-1.5 px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-dim)" }}>

        {validationBadge}
        <Separator orientation="vertical" className="h-4 shrink-0" />

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
          style={{ color: "var(--muted-foreground)" }} onClick={resetQuery}>
          <RotateCcw size={11} /> Reset
        </Button>

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
          style={{ color: "var(--muted-foreground)" }} onClick={handleExport}>
          <Download size={11} /> Export
        </Button>

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => fileInputRef.current?.click()}>
          <Upload size={11} /> Import
        </Button>

        {showPresetInput ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              className="h-7 text-xs px-2 rounded outline-none"
              style={{ width: 130, background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
              placeholder="Preset name..."
              value={presetName}
              onChange={(e) => setPresetName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSavePreset();
                if (e.key === "Escape") setShowPresetInput(false);
              }}
            />
            <Button size="sm" className="h-7 text-xs px-2" onClick={handleSavePreset}>Save</Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
            style={{ color: "var(--muted-foreground)" }}
            onClick={() => setShowPresetInput(true)}>
            <Save size={11} /> Save Preset
          </Button>
        )}

        {presets.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
                style={{ color: "var(--muted-foreground)" }}>
                <BookMarked size={11} /> Presets <ChevronDown size={9} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <DropdownMenuLabel className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Saved Presets
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: "var(--border)" }} />
              <ScrollArea className="max-h-48">
                {presets.map((preset) => (
                  <DropdownMenuItem key={preset.id}
                    className="flex items-center justify-between group"
                    style={{ color: "var(--foreground)" }}>
                    <button className="text-xs flex-1 text-left"
                      style={{ background: "transparent", border: "none", color: "var(--foreground)", cursor: "pointer" }}
                      onClick={() => loadPreset(preset.id)}>
                      {preset.name}
                      <span className="block text-[10px]" style={{ color: "var(--muted-foreground)" }}>
                        {preset.schemaName}
                      </span>
                    </button>
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-all"
                      style={{ color: "var(--muted-foreground)", background: "transparent", border: "none", cursor: "pointer" }}
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
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2"
                style={{ color: "var(--muted-foreground)" }}>
                <History size={11} /> History <ChevronDown size={9} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64"
              style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>
              <DropdownMenuLabel className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                Query History
              </DropdownMenuLabel>
              <DropdownMenuSeparator style={{ background: "var(--border)" }} />
              <ScrollArea className="max-h-64">
                {history.map((entry) => (
                  <DropdownMenuItem
                    key={entry.id}
                    className="text-xs flex flex-col items-start gap-0.5 cursor-pointer"
                    style={{ color: "var(--foreground)" }}
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

      <div className="flex lg:hidden items-center gap-2 px-3 py-2 shrink-0"
        style={{ borderBottom: "1px solid var(--border)", background: "var(--surface-dim)" }}>

        {validationBadge}
        <div style={{ flex: 1 }} />

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 shrink-0"
          style={{ color: "var(--muted-foreground)" }} onClick={resetQuery}>
          <RotateCcw size={11} /> Reset
        </Button>

        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 px-2 shrink-0"
          style={{ color: "var(--muted-foreground)" }}
          onClick={() => setShowDrawer(true)}>
          <MoreHorizontal size={14} /> More
        </Button>
      </div>

      {showDrawer && (
        <>
          <div className="fixed inset-0 z-40"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setShowDrawer(false)}
          />
          <div className="fixed top-0 right-0 h-full z-50 flex flex-col"
            style={{
              width: 280,
              background: "var(--surface)",
              borderLeft: "1px solid var(--border)",
              boxShadow: "-4px 0 24px rgba(0,0,0,0.3)",
            }}>

            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Actions</span>
              <button onClick={() => setShowDrawer(false)}
                style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                <X size={15} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4 space-y-5">

                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8 }}>
                    Query File
                  </p>
                  <div className="space-y-1.5">
                    {[
                      { icon: Download, label: "Export JSON", action: () => { handleExport(); setShowDrawer(false); } },
                      { icon: Upload, label: "Import JSON", action: () => { fileInputRef.current?.click(); setShowDrawer(false); } },
                    ].map(({ icon: Icon, label, action }) => (
                      <button key={label} onClick={action}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded text-left"
                        style={{ fontSize: 13, color: "var(--foreground)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                      >
                        <Icon size={13} style={{ color: "var(--muted-foreground)" }} />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8 }}>
                    Presets
                  </p>
                  {showPresetInput ? (
                    <div className="flex gap-1 mb-2">
                      <input autoFocus
                        className="flex-1 h-8 text-xs px-2 rounded outline-none"
                        style={{ background: "var(--input)", border: "1px solid var(--border)", color: "var(--foreground)" }}
                        placeholder="Preset name..."
                        value={presetName}
                        onChange={(e) => setPresetName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePreset();
                          if (e.key === "Escape") setShowPresetInput(false);
                        }}
                      />
                      <Button size="sm" className="h-8 text-xs px-3" onClick={handleSavePreset}>Save</Button>
                    </div>
                  ) : (
                    <button onClick={() => setShowPresetInput(true)}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded text-left mb-2"
                      style={{ fontSize: 13, color: "var(--foreground)", background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Save size={13} style={{ color: "var(--muted-foreground)" }} />
                      Save Current Query
                    </button>
                  )}
                  {presets.length > 0 ? (
                    <div className="space-y-1">
                      {presets.map((preset) => (
                        <div key={preset.id}
                          className="flex items-center justify-between px-3 py-2 rounded group"
                          style={{ border: "1px solid var(--border)" }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <button className="flex-1 text-left"
                            onClick={() => { loadPreset(preset.id); setShowDrawer(false); }}
                            style={{ background: "transparent", border: "none", cursor: "pointer" }}>
                            <span style={{ fontSize: 12, color: "var(--foreground)" }}>{preset.name}</span>
                            <span style={{ display: "block", fontSize: 10, color: "var(--muted-foreground)" }}>{preset.schemaName}</span>
                          </button>
                          <button onClick={() => deletePreset(preset.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                            <Trash2 size={11} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p style={{ fontSize: 11, color: "var(--muted-foreground)" }}>No saved presets yet.</p>
                  )}
                </div>

                {history.length > 0 && (
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 8 }}>
                      Query History
                    </p>
                    <div className="space-y-1">
                      {history.map((entry) => (
                        <button key={entry.id}
                          className="w-full flex flex-col items-start px-3 py-2 rounded text-left"
                          style={{ background: "transparent", border: "1px solid var(--border)", cursor: "pointer" }}
                          onClick={() => { importQuery(entry.query, entry.schemaName); setShowDrawer(false); }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          <span style={{ fontSize: 12, color: "var(--foreground)", fontWeight: 500 }}>{entry.schemaName}</span>
                          <span style={{ fontSize: 10, color: "var(--muted-foreground)" }}>
                            {new Date(entry.executedAt).toLocaleTimeString()} · {entry.resultCount} rows
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
    </>
  );
}
