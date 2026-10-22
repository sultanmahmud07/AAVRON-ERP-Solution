import React, { useState, useRef, useEffect } from "react";
import { Languages, Check } from "lucide-react";
import { toast } from "sonner";

interface Language {
  code: string;
  name: string;
  flag: string;
}

const languages: Language[] = [
  { code: "en", name: "English (US)", flag: "🇺🇸" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "ar", name: "العربية", flag: "🇸🇦" },
];

export const LanguageSelector: React.FC = () => {
  const [selected, setSelected] = useState<Language>(languages[0]);
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 font-medium text-xs shrink-0"
        title="Change Language"
        aria-label="Change Language"
      >
        <Languages className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-[60px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-48 max-w-[220px] rounded-md bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Language
          </div>
          <div className="space-y-0.5">
            {languages.map((lang) => {
              const isSelected = lang.code === selected.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => {
                    setSelected(lang);
                    setIsOpen(false);
                    toast.success(`Language set to ${lang.name}`);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-md text-xs font-semibold text-left transition-colors ${isSelected
                    ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-300"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                    }`}
                >
                  <span className="flex items-center gap-2">
                    <span>{lang.flag}</span>
                    <span>{lang.name}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;
