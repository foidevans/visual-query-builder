"use client";

import { useEffect, useState } from "react";

export function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [phase, setPhase] = useState<"visible" | "fadeout">("visible");

  useEffect(() => {
    const fadeTimer = setTimeout(() => setPhase("fadeout"), 1800);
    const doneTimer = setTimeout(() => onComplete(), 2400);
    return () => { clearTimeout(fadeTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{
        backgroundColor: "#0f0f0f",
        opacity: phase === "fadeout" ? 0 : 1,
        transition: "opacity 600ms ease",
      }}
    >
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: 10,
          background: "#1a1a1a",
          border: "1px solid #2a2a2a",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 20,
        }}
      >
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
          <rect x="3" y="6" width="10" height="2" rx="1" fill="#3b82f6" />
          <rect x="3" y="11" width="16" height="2" rx="1" fill="#8b5cf6" />
          <rect x="3" y="16" width="12" height="2" rx="1" fill="#3b82f6" />
          <rect x="3" y="21" width="8" height="2" rx="1" fill="#8b5cf6" />
          <rect x="20" y="4" width="2" height="20" rx="1" fill="#2a2a2a" />
          <rect x="23" y="8" width="2" height="12" rx="1" fill="#3b82f6" opacity="0.5" />
        </svg>
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#e5e2e1",
          letterSpacing: "-0.02em",
        }}>
          Requ
        </span>
        <span style={{
          fontFamily: "Inter, sans-serif",
          fontSize: 22,
          fontWeight: 600,
          color: "#3b82f6",
          letterSpacing: "-0.02em",
        }}>
          ête
        </span>
      </div>

      <p style={{
        fontFamily: "Inter, sans-serif",
        fontSize: 12,
        color: "#8c909f",
        marginTop: 8,
        letterSpacing: "0.05em",
        textTransform: "uppercase",
      }}>
        Visual Query Builder
      </p>

      <div style={{
        marginTop: 40,
        width: 120,
        height: 2,
        background: "#2a2a2a",
        borderRadius: 1,
        overflow: "hidden",
      }}>
        <div style={{
          height: "100%",
          background: "#3b82f6",
          borderRadius: 1,
          animation: "loadbar 1.8s ease forwards",
        }} />
      </div>

      <style>{`
        @keyframes loadbar {
          from { width: 0%; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}
