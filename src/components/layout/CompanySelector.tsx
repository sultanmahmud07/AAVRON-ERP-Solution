import React, { useState, useRef, useEffect } from "react";
import { Building2, Check, MoreHorizontal, Plus } from "lucide-react";
import { toast } from "sonner";

interface Company {
  id: string;
  name: string;
  type: string;
  iconBg: string;
}

const companies: Company[] = [
  { id: "1", name: "Falcon LLP", type: "Main Enterprise", iconBg: "bg-fuchsia-600" },
  { id: "2", name: "Dreams Tech Global", type: "Technology Subsidiary", iconBg: "bg-teal-600" },
  { id: "3", name: "Apex Logistics Ltd", type: "Supply Chain", iconBg: "bg-blue-600" },
  { id: "4", name: "Nova Manufacturing", type: "Production Plant", iconBg: "bg-amber-600" },
];

export const CompanySelector: React.FC = () => {
  const [selected, setSelected] = useState<Company>(companies[0]);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      {/* Pill button matching reference design: [ 🏢 Falcon LLP ··· ] */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all shadow-xs text-left"
        aria-expanded={isOpen}
      >
        <div className={`w-5 h-5 rounded-md ${selected.iconBg} text-white flex items-center justify-center shrink-0`}>
          <Building2 className="w-3.5 h-3.5" />
        </div>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 max-w-[120px] sm:max-w-[160px] truncate">
          {selected.name}
        </span>
        <MoreHorizontal className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute left-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-2 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Select Company / Branch
          </div>

          <div className="space-y-1">
            {companies.map((comp) => {
              const isSelected = comp.id === selected.id;
              return (
                <button
                  key={comp.id}
                  onClick={() => {
                    setSelected(comp);
                    setIsOpen(false);
                    toast.success(`Switched active workspace to ${comp.name}`);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-all ${
                    isSelected
                      ? "bg-teal-50 dark:bg-teal-950/40 text-teal-900 dark:text-teal-200"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-7 h-7 rounded-lg ${comp.iconBg} text-white flex items-center justify-center shrink-0`}>
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold leading-tight truncate">{comp.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{comp.type}</p>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 ml-2" />}
                </button>
              );
            })}
          </div>

          <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                toast.info("Create new company branch modal");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30 rounded-xl transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Company Branch</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanySelector;
