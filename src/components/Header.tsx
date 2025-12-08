"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTask } from "@/src/contexts/TaskContext";
import { Sun, Moon } from "lucide-react";

export default function Header() {
  const { theme, setTheme } = useTheme();
  const { task, setTask } = useTask();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  return (
    <header className="fixed top-0 right-0 p-4 z-50 flex items-center justify-end w-full overflow-hidden gap-3">
      {/* Task Toggle Button */}
      <button
        onClick={() => setTask(task === "task1" ? "task2" : "task1")}
        className="flex items-center gap-3 px-5 py-2.5 rounded-full text-base bg-[var(--color-selected-bg)] text-[var(--color-selected-text)] hover:opacity-90 transition-all border-0 outline-none"
      >
        <span className="whitespace-nowrap">
          Task {task === "task1" ? "1" : "2"}
        </span>
      </button>

      {/* Dark Mode Toggle Button */}
      {mounted && (
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center gap-3 px-5 py-2.5 rounded-full text-base bg-[var(--color-selected-bg)] text-[var(--color-selected-text)] hover:opacity-90 transition-all border-0 outline-none"
        >
          {theme === "dark" ? (
            <Sun className="size-5" style={{ color: "#6b6b6b" }} />
          ) : (
            <Moon className="size-5" style={{ color: "#171717" }} />
          )}
          <span className="whitespace-nowrap">
            {theme === "dark" ? "Light" : "Dark"} Mode
          </span>
        </button>
      )}
    </header>
  );
}
