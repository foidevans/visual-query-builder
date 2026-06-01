"use client";

import { Settings } from "lucide-react";
import { ThemeToggle } from "@/components/query-builder/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCHEMAS } from "@/data/schemas";
import { useQueryStore } from "@/store/queryStore";

interface NavbarProps {
  onSettingsClick: () => void;
}

export function Navbar({ onSettingsClick }: NavbarProps) {
  const { selectedSchema, setSelectedSchema, resetQuery } = useQueryStore();

  return (
    <header style={{
      height: 44,
      background: "var(--surface-dim)",
      borderBottom: "1px solid var(--border)",
      display: "flex",
      alignItems: "center",
      paddingLeft: 16,
      paddingRight: 16,
      gap: 0,
      flexShrink: 0,
    }}>
      <div className="flex items-center gap-2 mr-6" style={{ flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="6" width="10" height="2" rx="1" fill="var(--primary)" />
          <rect x="3" y="11" width="16" height="2" rx="1" fill="var(--logic-or)" />
          <rect x="3" y="16" width="12" height="2" rx="1" fill="var(--primary)" />
          <rect x="3" y="21" width="8" height="2" rx="1" fill="var(--logic-or)" />
        </svg>
        <span style={{
          fontFamily: "var(--font-inter), Inter, sans-serif",
          fontSize: 15,
          fontWeight: 600,
          color: "var(--foreground)",
          letterSpacing: "-0.02em",
        }}>
          Requ<span style={{ color: "var(--primary)" }}>ête</span>
        </span>
      </div>

      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        padding: "0 14px",
        borderBottom: "2px solid var(--primary)",
        fontFamily: "var(--font-inter), Inter, sans-serif",
        fontSize: 13,
        fontWeight: 500,
        color: "var(--foreground)",
      }}>
        Query Builder
      </div>

      <div style={{ flex: 1 }} />

      <Select
        value={selectedSchema}
        onValueChange={(val) => { setSelectedSchema(val); resetQuery(); }}
      >
        <SelectTrigger style={{
          height: 28,
          fontSize: 12,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          color: "var(--foreground)",
          width: 140,
          borderRadius: 4,
        }}>
          <SelectValue placeholder="Schema" />
        </SelectTrigger>
        <SelectContent>
          {SCHEMAS.map((s) => (
            <SelectItem key={s.name} value={s.name} className="text-xs">{s.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex items-center gap-1 ml-2">
        <ThemeToggle />
        <button
          onClick={onSettingsClick}
          style={{
            width: 28, height: 28,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: "transparent", border: "none",
            color: "var(--muted-foreground)",
            borderRadius: 4, cursor: "pointer",
          }}
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </header>
  );
}
