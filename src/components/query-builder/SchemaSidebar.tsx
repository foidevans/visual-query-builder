"use client";

import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import { FieldSchema } from "@/types/query";

interface SchemaSidebarProps {
  fields: FieldSchema[];
  schemaName: string;
}

const TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  string:  { label: "abc", color: "var(--type-string)" },
  number:  { label: "123", color: "var(--type-number)" },
  date:    { label: "date", color: "var(--type-date)" },
  enum:    { label: "enum", color: "var(--type-enum)" },
  boolean: { label: "bool", color: "var(--type-boolean)" },
};

function FieldList({ fields }: { fields: FieldSchema[] }) {
  return (
    <div style={{ padding: "0 8px 12px" }}>
      {fields.map((field) => {
        const typeConf = TYPE_CONFIG[field.type] ?? { label: field.type, color: "var(--muted-foreground)" };
        return (
          <div key={field.name}
            className="flex items-center gap-2 rounded px-2 py-1.5 cursor-default"
            style={{ transition: "background 150ms" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-high)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <span style={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              color: typeConf.color,
              width: 30,
              flexShrink: 0,
            }}>
              {typeConf.label}
            </span>
            <span style={{ fontSize: 12, color: "var(--foreground)" }}>
              {field.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export function SchemaSidebar({ fields, schemaName }: SchemaSidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarContent = (
    <>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 4 }}>
          Schema
        </p>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>
          {schemaName}
        </p>
      </div>

      <div style={{ padding: "10px 16px 6px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
          Fields
        </p>
      </div>

      <div style={{ flex: 1, overflowY: "auto" }}>
        <FieldList fields={fields} />
      </div>

      <div style={{ borderTop: "1px solid var(--border)", padding: "12px 16px" }}>
        <p style={{ fontSize: 10, fontWeight: 600, color: "var(--muted-foreground)", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: 8 }}>
          Schema Stats
        </p>
        <div className="space-y-1.5">
          {[
            { label: "Total Fields", value: fields.length },
            { label: "String", value: fields.filter(f => f.type === "string").length },
            { label: "Number", value: fields.filter(f => f.type === "number").length },
            { label: "Date", value: fields.filter(f => f.type === "date").length },
            { label: "Enum", value: fields.filter(f => f.type === "enum").length },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span style={{ fontSize: 11, color: "var(--muted-foreground)" }}>{s.label}</span>
              <span style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11, color: "var(--foreground)" }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <>
      <div className="hidden lg:flex flex-col h-full"
        style={{ width: 220, background: "var(--surface-dim)", borderRight: "1px solid var(--border)", flexShrink: 0 }}>
        {sidebarContent}
      </div>

      <div className="lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          style={{
            position: "fixed", bottom: 16, left: 16, zIndex: 40,
            display: "flex", alignItems: "center", gap: 6,
            height: 32, padding: "0 12px",
            background: "var(--primary)", color: "#fff",
            border: "none", borderRadius: 6,
            fontSize: 12, fontWeight: 500, cursor: "pointer",
          }}
        >
          <ChevronRight size={12} />
          Schema
        </button>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex flex-col justify-end"
            style={{ background: "rgba(0,0,0,0.5)" }}
            onClick={() => setMobileOpen(false)}
          >
            <div
              className="flex flex-col rounded-t-xl overflow-hidden"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", maxHeight: "70vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-3"
                style={{ borderBottom: "1px solid var(--border)" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--foreground)" }}>Schema Fields</span>
                <button onClick={() => setMobileOpen(false)}
                  style={{ background: "transparent", border: "none", color: "var(--muted-foreground)", cursor: "pointer" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ overflowY: "auto" }}>
                <FieldList fields={fields} />
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
