import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface ModeToggleProps {
  className?: string;
}

export function ModeToggle({ className = "" }: ModeToggleProps) {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 shrink-0 ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <Sun className="h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
      <Moon className="absolute h-3.5 w-3.5 sm:h-4 sm:w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-sky-400" />
    </button>
  );
}

export default ModeToggle;