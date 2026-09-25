"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.add("theme-switching");
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
  try {
    localStorage.setItem("theme", theme);
  } catch {}
  window.dispatchEvent(new CustomEvent("themechange", { detail: theme }));
  window.setTimeout(() => root.classList.remove("theme-switching"), 400);
}

function storedTheme(): Theme {
  try {
    return localStorage.getItem("theme") === "light" ? "light" : "dark";
  } catch {
    return "dark";
  }
}

// React can rewrite <html className> after a hydration error recovery; re-apply the stored theme when that happens.
export function ThemeSync() {
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const want = storedTheme();
      if (root.classList.contains(want) && !root.classList.contains(want === "dark" ? "light" : "dark")) return;
      root.classList.toggle("dark", want === "dark");
      root.classList.toggle("light", want === "light");
      window.dispatchEvent(new CustomEvent("themechange", { detail: want }));
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);
  return null;
}

export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(storedTheme());
    const onChange = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
    window.addEventListener("themechange", onChange);
    return () => window.removeEventListener("themechange", onChange);
  }, []);

  const next: Theme = theme === "dark" ? "light" : "dark";

  return (
    <button
      type="button"
      onClick={() => {
        applyTheme(next);
        setTheme(next);
      }}
      aria-label={`Switch to ${next} theme`}
      aria-pressed={theme === "light"}
      title={`Switch to ${next} theme`}
      className={`relative flex h-11 w-11 items-center justify-center rounded-lg border border-hairline text-muted-foreground transition-[border-color,background-color,color,box-shadow] duration-300 hover:border-brand/30 hover:bg-brand-wash hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${className}`}
    >
      <Moon aria-hidden="true" className="absolute h-[18px] w-[18px] rotate-0 scale-100 transition-[transform,opacity] duration-300 dark:-rotate-90 dark:scale-0 dark:opacity-0" />
      <Sun aria-hidden="true" className="absolute h-[18px] w-[18px] rotate-90 scale-0 opacity-0 transition-[transform,opacity] duration-300 dark:rotate-0 dark:scale-100 dark:opacity-100" />
    </button>
  );
}
