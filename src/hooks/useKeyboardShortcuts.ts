"use client";

import { useEffect, useRef } from "react";
import { useQueryStore } from "@/store/queryStore";

export function useKeyboardShortcuts() {
  const { addRule, resetQuery, addGroup, removeLastRule, rootGroup } = useQueryStore();
  const rootGroupIdRef = useRef(rootGroup.id);

  useEffect(() => {
    rootGroupIdRef.current = rootGroup.id;
  }, [rootGroup.id]);

  useEffect(() => {
    let lastFired = 0;

    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName.toLowerCase();
      if (["input", "textarea", "select"].includes(tag)) return;

      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const ctrl = isMac ? e.metaKey : e.ctrlKey;
      if (!ctrl) return;

      const now = Date.now();
      if (now - lastFired < 100) return;
      lastFired = now;

      switch (e.key) {
        case "Enter":
          e.preventDefault();
          addRule(rootGroupIdRef.current);
          break;
        case "g":
        case "G":
          e.preventDefault();
          addGroup(rootGroupIdRef.current);
          break;
        case "r":
        case "R":
          e.preventDefault();
          removeLastRule();
          break;
        case "Delete":
          e.preventDefault();
          resetQuery();
          break;
        default:
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [addRule, resetQuery, addGroup, removeLastRule]);
}
