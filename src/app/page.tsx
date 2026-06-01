"use client";

import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import { WelcomeModal } from "@/components/WelcomeModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Navbar } from "@/components/Navbar";
import { QueryBuilderShell } from "@/components/query-builder/QueryBuilderShell";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";

export default function Home() {
  const [splashDone, setSplashDone] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useKeyboardShortcuts();

  useEffect(() => {
    if (splashDone) {
      const seen = localStorage.getItem("requete-welcome-seen");
      if (!seen) setShowWelcome(true);
    }
  }, [splashDone]);

  return (
    <>
      {!splashDone && <SplashScreen onComplete={() => setSplashDone(true)} />}

      <div className="h-screen flex flex-col overflow-hidden"
        style={{ opacity: splashDone ? 1 : 0, transition: "opacity 400ms ease" }}>
        <Navbar onSettingsClick={() => setShowSettings(true)} />
        <QueryBuilderShell />
      </div>

      {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
