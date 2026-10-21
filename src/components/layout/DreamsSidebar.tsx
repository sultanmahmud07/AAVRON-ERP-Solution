import React, { useState } from "react";
import { NavLink, useLocation } from "react-router";
import { ChevronDown, ChevronRight, PanelLeftClose, PanelLeft } from "lucide-react";
import DreamsLogo from "../common/DreamsLogo";
import { erpNavSections, NavItem } from "@/config/erpNavData";

interface DreamsSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const DreamsSidebar: React.FC<DreamsSidebarProps> = ({
  isOpen,
  onToggle,
  mobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();

  // Keep track of which accordion items are open
  // Default open "Dashboard"
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    Dashboard: true,
  });

  const toggleMenu = (title: string, currentOpen: boolean) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !currentOpen,
    }));
  };

  const isSubItemActive = (url: string) => {
    if (url === "/" && location.pathname === "/") return true;
    if (url !== "/" && location.pathname.startsWith(url)) return true;
    return false;
  };

  const isItemActive = (item: NavItem) => {
    if (item.url && isSubItemActive(item.url)) return true;
    if (item.subItems) {
      return item.subItems.some((sub) => isSubItemActive(sub.url));
    }
    return false;
  };

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#12141c] border-r border-slate-200/80 dark:border-slate-800/80 select-none transition-colors">
      {/* Top Header: Logo & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <NavLink to="/" className="flex items-center">
          <DreamsLogo showText={isOpen} />
        </NavLink>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:flex items-center justify-center"
          title={isOpen ? "Collapse Sidebar" : "Expand Sidebar"}
          aria-label="Toggle Sidebar"
        >
          {isOpen ? (
            <PanelLeftClose className="w-4 h-4" />
          ) : (
            <PanelLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Navigation Menu Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {erpNavSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {/* Section Title */}
            {isOpen && (
              <div className="px-3 pb-1 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {section.sectionTitle}
              </div>
            )}

            {/* Section Items */}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const Icon = item.icon;
                const hasSub = Boolean(item.subItems && item.subItems.length > 0);
                const active = isItemActive(item);
                const isMenuOpen = openMenus[item.title] !== undefined ? openMenus[item.title] : active;

                // If item has sub-items
                if (hasSub) {
                  return (
                    <div key={itemIdx} className="space-y-1">
                      <button
                        onClick={() => toggleMenu(item.title, isMenuOpen)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all text-left ${
                          active
                            ? "bg-slate-900 text-white dark:bg-[#1e222e] dark:text-white shadow-xs"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                        }`}
                        title={!isOpen ? item.title : undefined}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Icon className={`w-4 h-4 shrink-0 ${active ? "text-white" : "text-slate-500 dark:text-slate-400"}`} />
                          {isOpen && <span className="truncate">{item.title}</span>}
                        </div>
                        {isOpen && (
                          <div className="shrink-0 text-slate-400">
                            {isMenuOpen ? (
                              <ChevronDown className="w-4 h-4" />
                            ) : (
                              <ChevronRight className="w-4 h-4" />
                            )}
                          </div>
                        )}
                      </button>

                      {/* Submenu Accordion */}
                      {isOpen && isMenuOpen && item.subItems && (
                        <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/80 ml-5">
                          {item.subItems.map((sub, sIdx) => {
                            const isCurrent = isSubItemActive(sub.url);
                            return (
                              <NavLink
                                key={sIdx}
                                to={sub.url}
                                onClick={() => {
                                  if (window.innerWidth < 1024) onMobileClose();
                                }}
                                className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                  isCurrent
                                    ? "text-teal-600 dark:text-teal-400 font-bold bg-teal-50/70 dark:bg-teal-950/30"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${
                                    isCurrent
                                      ? "bg-teal-500 scale-125 ring-2 ring-teal-500/30"
                                      : "bg-slate-300 dark:bg-slate-600"
                                  }`}
                                />
                                <span className="truncate">{sub.title}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                // Regular Single Nav Item (like Products, Categories, Units, etc.)
                const isSingleActive = isSubItemActive(item.url || "");
                return (
                  <NavLink
                    key={itemIdx}
                    to={item.url || "#"}
                    onClick={() => {
                      if (window.innerWidth < 1024) onMobileClose();
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isSingleActive
                        ? "bg-slate-200/80 text-slate-900 dark:bg-[#cbd5e1] dark:text-slate-950 font-bold shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                    title={!isOpen ? item.title : undefined}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${isSingleActive ? "text-slate-900 dark:text-slate-950" : "text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"}`} />
                      {isOpen && <span className="truncate">{item.title}</span>}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-40 ${
          isOpen ? "w-64" : "w-18"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs animate-in fade-in"
          onClick={onMobileClose}
        >
          <div
            className="w-72 h-full bg-white dark:bg-[#12141c] shadow-2xl animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};

export default DreamsSidebar;
