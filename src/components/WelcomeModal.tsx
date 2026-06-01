"use client";

import { useState } from "react";
import { X, Filter, Code2, Table2, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";

interface WelcomeModalProps {
  onClose: () => void;
}

const features = [
  {
    icon: Filter,
    title: "Visual Query Builder",
    badge: "Core",
    description: "Build complex relational logic with nested condition groups. Drag and drop rules with AND/OR operators at any depth.",
    preview: (
      <div className="mt-3 rounded p-2" style={{ background: "#0e0e0e", border: "1px solid #2a2a2a" }}>
        <div className="flex items-center gap-2 mb-1.5">
          <div style={{ width: 3, height: 28, background: "#3b82f6", borderRadius: 1 }} />
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#3b82f6" }}>AND</span>
          <div style={{ height: 1, flex: 1, background: "#2a2a2a" }} />
        </div>
        <div className="flex items-center gap-2 pl-4">
          <div style={{ width: 3, height: 28, background: "#8b5cf6", borderRadius: 1 }} />
          <span style={{ fontFamily: "JetBrains Mono", fontSize: 11, color: "#8b5cf6" }}>OR</span>
          <div style={{ height: 1, flex: 1, background: "#2a2a2a" }} />
        </div>
      </div>
    ),
  },
  {
    icon: Code2,
    title: "Live SQL Preview",
    badge: null,
    description: "See your SQL and MongoDB query update in real time as you build. Copy or export with one click.",
    preview: (
      <div className="mt-3 rounded p-2" style={{ background: "#0e0e0e", border: "1px solid #2a2a2a", fontFamily: "JetBrains Mono", fontSize: 11 }}>
        <div><span style={{ color: "#3b82f6" }}>SELECT</span> <span style={{ color: "#e5e2e1" }}>*</span></div>
        <div><span style={{ color: "#3b82f6" }}>FROM</span> <span style={{ color: "#22c55e" }}>users</span></div>
        <div><span style={{ color: "#3b82f6" }}>WHERE</span> <span style={{ color: "#f97316" }}>age</span> <span style={{ color: "#8c909f" }}>&gt;</span> <span style={{ color: "#a855f7" }}>18</span></div>
      </div>
    ),
  },
  {
    icon: Layers,
    title: "Schema Intelligence",
    badge: null,
    description: "Browse all available fields grouped by type. Each field shows its data type so you always pick the right operator.",
    preview: (
      <div className="mt-3 rounded p-2 space-y-1" style={{ background: "#0e0e0e", border: "1px solid #2a2a2a" }}>
        {[
          { type: "abc", label: "name", color: "#22c55e" },
          { type: "123", label: "age", color: "#f97316" },
          { type: "date", label: "createdAt", color: "#3b82f6" },
        ].map((f) => (
          <div key={f.label} className="flex items-center gap-2">
            <span style={{ fontFamily: "JetBrains Mono", fontSize: 10, color: f.color, width: 28 }}>{f.type}</span>
            <span style={{ fontFamily: "Inter", fontSize: 11, color: "#e5e2e1" }}>{f.label}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Table2,
    title: "Data Explorer",
    badge: null,
    description: "Execute queries against your dataset and inspect results instantly. Filter, paginate, and export matching records.",
    preview: (
      <div className="mt-3 rounded overflow-hidden" style={{ background: "#0e0e0e", border: "1px solid #2a2a2a" }}>
        <div className="flex" style={{ borderBottom: "1px solid #2a2a2a", padding: "4px 8px" }}>
          {["ID", "STATUS"].map((h) => (
            <span key={h} style={{ flex: 1, fontFamily: "Inter", fontSize: 10, fontWeight: 600, color: "#8c909f", letterSpacing: "0.05em" }}>{h}</span>
          ))}
        </div>
        <div className="flex" style={{ padding: "4px 8px" }}>
          <span style={{ flex: 1, fontFamily: "JetBrains Mono", fontSize: 11, color: "#3b82f6" }}>#1029</span>
          <span style={{ flex: 1, fontFamily: "JetBrains Mono", fontSize: 11, color: "#22c55e" }}>active</span>
        </div>
      </div>
    ),
  },
];

export function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [dontShow, setDontShow] = useState(false);

  function handleGetStarted() {
    if (dontShow) localStorage.setItem("requete-welcome-seen", "true");
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)" }}>
      <div className="relative w-full max-w-2xl rounded-lg"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a", maxHeight: "90vh", overflowY: "auto" }}>

        <button onClick={handleGetStarted}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Close">
          <X size={16} />
        </button>

        <div className="flex flex-col items-center pt-10 pb-6 px-8">
          <div className="flex items-center justify-center mb-5"
            style={{ width: 48, height: 48, borderRadius: 8, background: "#201f1f", border: "1px solid #2a2a2a" }}>
            <svg width="24" height="24" viewBox="0 0 28 28" fill="none">
              <rect x="3" y="6" width="10" height="2" rx="1" fill="#3b82f6" />
              <rect x="3" y="11" width="16" height="2" rx="1" fill="#8b5cf6" />
              <rect x="3" y="16" width="12" height="2" rx="1" fill="#3b82f6" />
              <rect x="3" y="21" width="8" height="2" rx="1" fill="#8b5cf6" />
            </svg>
          </div>
          <h2 style={{ fontFamily: "Inter", fontSize: 20, fontWeight: 600, color: "#e5e2e1", letterSpacing: "-0.01em" }}>
            Welcome to Requ<span style={{ color: "#3b82f6" }}>ête</span>
          </h2>
          <p style={{ fontFamily: "Inter", fontSize: 13, color: "#8c909f", marginTop: 8, textAlign: "center", maxWidth: 400 }}>
            The visual IDE for database engineers. Build complex queries with zero friction.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-6 pb-6">
          {features.map((f) => (
            <div key={f.title} className="rounded p-4"
              style={{ background: "#201f1f", border: "1px solid #2a2a2a" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <f.icon size={14} style={{ color: "#3b82f6" }} />
                  <span style={{ fontFamily: "Inter", fontSize: 13, fontWeight: 600, color: "#e5e2e1" }}>
                    {f.title}
                  </span>
                </div>
                {f.badge && (
                  <span style={{
                    fontFamily: "Inter", fontSize: 10, fontWeight: 600,
                    color: "#8c909f", background: "#2a2a2a",
                    padding: "1px 6px", borderRadius: 3, letterSpacing: "0.03em"
                  }}>
                    {f.badge}
                  </span>
                )}
              </div>
              <p style={{ fontFamily: "Inter", fontSize: 12, color: "#8c909f", lineHeight: "18px" }}>
                {f.description}
              </p>
              {f.preview}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderTop: "1px solid #2a2a2a" }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={dontShow}
              onChange={(e) => setDontShow(e.target.checked)}
              style={{ accentColor: "#3b82f6" }}
            />
            <span style={{ fontFamily: "Inter", fontSize: 12, color: "#8c909f" }}>
              Don't show this again
            </span>
          </label>
          <Button onClick={handleGetStarted}
            style={{ background: "#3b82f6", color: "#fff", height: 32, fontSize: 13, fontWeight: 500, border: "none" }}
            className="hover:opacity-90 transition-opacity">
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
}
