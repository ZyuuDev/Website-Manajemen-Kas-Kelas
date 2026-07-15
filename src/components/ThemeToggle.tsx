"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("sakukelas-theme", next ? "dark" : "light");
    } catch {
      // localStorage bisa gagal di mode privat — tema tetap berlaku untuk sesi ini
    }
  };

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap"}
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-border bg-card text-foreground transition-all hover:border-primary/60 hover:text-primary active:scale-95"
    >
      {/* Render ikon hanya setelah mount agar tidak mismatch dengan SSR */}
      {mounted ? (
        isDark ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />
      ) : (
        <span className="h-4.5 w-4.5" />
      )}
    </button>
  );
}
