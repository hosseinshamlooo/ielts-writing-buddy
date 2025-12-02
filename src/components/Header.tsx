"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTask } from "@/src/contexts/TaskContext";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { task, setTask } = useTask();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Use resolvedTheme to avoid flickering
  const currentTheme = mounted ? resolvedTheme : "light";

  const textColor = currentTheme === "dark" ? "#ffffff" : "#000000";

  return (
    <header className="fixed top-0 right-0 p-4 pr-12 z-50 flex gap-4 items-center justify-end">
      {/* Task Toggle Button */}
      <button
        onClick={() => setTask(task === "task1" ? "task2" : "task1")}
        className="flex items-center gap-2 rounded-full px-4 py-3 text-lg h-12 min-w-[140px] bg-transparent hover:bg-[var(--color-accent)] transition-colors border-0 outline-none"
        style={{ 
          color: textColor,
          fontFamily: "var(--font-sans), 'Outfit', sans-serif"
        }}
      >
        <span 
          className="size-5 flex items-center justify-center font-semibold"
          style={{ color: textColor }}
        >
          {task === "task1" ? "1" : "2"}
        </span>
        <span 
          className="-translate-y-[1px]"
          style={{ color: textColor }}
        >
          Task {task === "task1" ? "1" : "2"}
        </span>
      </button>

      {/* Dark Mode Toggle Button */}
      <button
        onClick={() => setTheme(currentTheme === "dark" ? "light" : "dark")}
        className="flex items-center gap-2 rounded-full px-4 py-3 text-lg h-12 min-w-[140px] bg-transparent hover:bg-[var(--color-accent)] transition-colors border-0 outline-none"
        aria-label="Toggle dark mode"
        style={{ 
          color: textColor,
          fontFamily: "var(--font-sans), 'Outfit', sans-serif"
        }}
      >
        {currentTheme === "dark" ? (
          <Sun 
            className="size-5" 
            style={{ color: textColor }}
          />
        ) : (
          <Moon 
            className="size-5" 
            style={{ color: textColor }}
          />
        )}
        <span 
          className="-translate-y-[1px]"
          style={{ color: textColor }}
        >
          {currentTheme === "dark" ? "Light" : "Dark"} Mode
        </span>
      </button>
    </header>
  );
}
