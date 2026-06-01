"use client";

import { useEffect, useState } from "react";
import { Keyboard } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export function KeyboardShortcuts() {
  const [modKey, setModKey] = useState("Ctrl");

  useEffect(() => {
    const isMac = navigator.platform.toUpperCase().includes("MAC");
    setModKey(isMac ? "⌘" : "Ctrl");
  }, []);

  const shortcuts = [
    { keys: [modKey, "Enter"], description: "Add rule to root group" },
    { keys: [modKey, "G"], description: "Add nested group" },
    { keys: [modKey, "R"], description: "Remove last rule" },
    { keys: [modKey, "Del"], description: "Reset entire query" },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
          <Keyboard size={12} />
          Shortcuts
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-background border border-border shadow-lg">
        <DropdownMenuLabel className="text-xs">Keyboard Shortcuts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="p-2 space-y-2">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2">
              <span className="text-xs text-muted-foreground">{s.description}</span>
              <div className="flex items-center gap-1 shrink-0">
                {s.keys.map((k) => (
                  <kbd
                    key={k}
                    className="px-1.5 py-0.5 text-[10px] font-mono bg-muted border border-border rounded"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[10px] text-muted-foreground pt-1 border-t border-border mt-2">
            Not available on mobile devices
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
