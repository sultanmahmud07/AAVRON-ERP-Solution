import React, { useState, useRef, useEffect } from "react";
import { Download, ChevronDown, FileText, FileSpreadsheet, Printer } from "lucide-react";
import { toast } from "sonner";

export const ExportDropdown: React.FC = () => {
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

  const handleExport = (type: string) => {
    setIsOpen(false);
    toast.success(`Exporting ERP Dashboard Report as ${type}...`);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3.5 py-2 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all font-semibold text-xs shadow-xs"
        aria-expanded={isOpen}
      >
        <Download className="w-3.5 h-3.5 text-slate-500" />
        <span>Export</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-1.5 z-40 animate-in fade-in zoom-in-95">
          <button
            onClick={() => handleExport("PDF")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
          >
            <FileText className="w-4 h-4 text-rose-500" />
            <span>Export as PDF</span>
          </button>
          <button
            onClick={() => handleExport("Excel (.xlsx)")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Export as Excel</span>
          </button>
          <button
            onClick={() => handleExport("CSV")}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export as CSV</span>
          </button>
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
          <button
            onClick={() => {
              setIsOpen(false);
              window.print();
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-md transition-colors text-left"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Overview</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportDropdown;
