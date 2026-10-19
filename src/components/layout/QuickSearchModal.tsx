import React, { useState, useEffect } from "react";
import { Search, X, Layers, Users, Package, DollarSign, CornerDownLeft } from "lucide-react";
import { useNavigate } from "react-router";

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickSearchModal: React.FC<QuickSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: "HRM Dashboard (Overview)", category: "Dashboard", url: "/", icon: Users },
    { title: "Inventory Products", category: "Inventory", url: "/inventory/products", icon: Package },
    { title: "Inventory Units", category: "Inventory", url: "/inventory/units", icon: Layers },
    { title: "Monthly Payroll & Payslips", category: "Finance & HR", url: "/hrm/payroll", icon: DollarSign },
    { title: "Employees Directory", category: "HRM", url: "/hrm/employees", icon: Users },
    { title: "Recruitment Pipeline", category: "HRM", url: "/hrm/recruitment", icon: Users },
  ];

  const filtered = query.trim()
    ? quickLinks.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.category.toLowerCase().includes(query.toLowerCase())
      )
    : quickLinks;

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search modules, records, employees, or pages..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none"
          />
          {query && (
            <button onClick={() => setQuery("")} className="p-1 text-slate-400 hover:text-slate-600">
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 max-h-80 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Quick Navigation & Shortcuts
          </div>

          <div className="space-y-1">
            {filtered.map((item, idx) => {
              const Icon = item.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(item.url)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 group text-left transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-slate-300 dark:text-slate-600 group-hover:text-teal-500">
                    <span className="text-xs font-medium hidden sm:inline">Jump</span>
                    <CornerDownLeft className="w-3.5 h-3.5" />
                  </div>
                </button>
              );
            })}
            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-slate-400">
                No matching results found for "{query}"
              </div>
            )}
          </div>
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span>Navigation:</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
              ↑↓
            </kbd>
            <span>Select:</span>
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-[10px]">
              ↵
            </kbd>
          </div>
          <span>Dreams ERP Global Search</span>
        </div>
      </div>
    </div>
  );
};

export default QuickSearchModal;
