"use client";

import { X, Keyboard, Database, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQueryStore } from "@/store/queryStore";
import { SCHEMAS } from "@/data/schemas";

interface SettingsModalProps {
  onClose: () => void;
}

export function SettingsModal({ onClose }: SettingsModalProps) {
  const { selectedSchema, history, presets, resetQuery } = useQueryStore();
  const schema = SCHEMAS.find((s) => s.name === selectedSchema);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.6)" }}>
      <div className="relative w-full max-w-md rounded-lg overflow-hidden"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}>

        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}>
          <span style={{ fontFamily: "var(--font-inter)", fontSize: 14, fontWeight: 600, color: "var(--foreground)" }}>
            Settings
          </span>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">

          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 10 }}>
              Workspace
            </p>
            <div className="space-y-2">
              {[
                { label: "Active Schema", value: schema?.label ?? selectedSchema },
                { label: "Saved Presets", value: presets.length },
                { label: "Query History", value: `${history.length} / 20` },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-1.5 px-3 rounded"
                  style={{ background: "var(--surface-container)", border: "1px solid var(--border)" }}>
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{item.label}</span>
                  <span style={{ fontFamily: "var(--font-jetbrains)", fontSize: 12, color: "var(--foreground)" }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--muted-foreground)", marginBottom: 10 }}>
              Keyboard Shortcuts
            </p>
            <div className="space-y-1.5">
              {[
                { keys: ["Ctrl", "Enter"], desc: "Add rule to root group" },
                { keys: ["Ctrl", "G"], desc: "Add nested group" },
                { keys: ["Ctrl", "R"], desc: "Remove last rule" },
                { keys: ["Ctrl", "Del"], desc: "Reset entire query" },
              ].map((s) => (
                <div key={s.desc} className="flex items-center justify-between">
                  <span style={{ fontSize: 12, color: "var(--muted-foreground)" }}>{s.desc}</span>
                  <div className="flex items-center gap-1">
                    {s.keys.map((k) => (
                      <kbd key={k} style={{
                        fontFamily: "var(--font-jetbrains)",
                        fontSize: 10,
                        padding: "2px 6px",
                        background: "var(--surface-high)",
                        border: "1px solid var(--border-bright)",
                        borderRadius: 3,
                        color: "var(--foreground)",
                      }}>
                        {k}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <p style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--error)", marginBottom: 10 }}>
              Danger Zone
            </p>
            <Button
              variant="outline"
              className="w-full h-8 text-xs"
              style={{ borderColor: "var(--error)", color: "var(--error)", background: "transparent" }}
              onClick={() => { resetQuery(); onClose(); }}
            >
              Reset Current Query
            </Button>
          </div>

          <div className="flex items-center gap-2 pt-1" style={{ borderTop: "1px solid var(--border)" }}>
            <Info size={12} style={{ color: "var(--muted-foreground)" }} />
            <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>
              Requête v1.0 — Visual Query Builder
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
