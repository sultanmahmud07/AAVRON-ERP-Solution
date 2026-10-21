import React, { useState, useMemo } from "react";
import { NavLink, useLocation } from "react-router";
import {
  ChevronDown,
  ChevronRight,
  PanelLeftClose,
  PanelLeft,
  Search,
  X,
} from "lucide-react";
import DreamsLogo from "../common/DreamsLogo";
import { erpNavSections, NavItem, NavSection } from "@/config/erpNavData";

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

  // Menu Search Query
  const [searchQuery, setSearchQuery] = useState("");

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

  // Filter sections and items based on search query without mutating menu content
  const filteredSections = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return erpNavSections;

    return erpNavSections
      .map((section) => {
        const matchingItems = section.items
          .map((item) => {
            const itemMatches = item.title.toLowerCase().includes(q);
            if (item.subItems && item.subItems.length > 0) {
              const matchingSubs = item.subItems.filter((sub) =>
                sub.title.toLowerCase().includes(q)
              );
              if (itemMatches || matchingSubs.length > 0) {
                return {
                  ...item,
                  // Keep matching subItems if parent didn't match, or all subItems if parent matched
                  subItems: itemMatches ? item.subItems : matchingSubs,
                };
              }
              return null;
            }
            return itemMatches ? item : null;
          })
          .filter(Boolean) as NavItem[];

        if (matchingItems.length > 0) {
          return {
            ...section,
            items: matchingItems,
          };
        }
        return null;
      })
      .filter(Boolean) as NavSection[];
  }, [searchQuery]);

  const hasSearchResults = filteredSections.length > 0;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white dark:bg-[#16181f] border-r border-slate-200/80 dark:border-slate-800/80 select-none transition-colors">
      {/* Top Header: Logo & Collapse Button */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200/80 dark:border-slate-800/80 shrink-0">
        <NavLink to="/" className="flex items-center">
          <DreamsLogo showText={isOpen} />
        </NavLink>

        <button
          onClick={onToggle}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden lg:flex items-center justify-center cursor-pointer"
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

      {/* Menu Search Bar */}
      {isOpen ? (
        <div className="px-3 pt-3 pb-1 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search menu..."
              className="w-full pl-8 pr-7 py-1.5 text-xs bg-slate-100/80 dark:bg-[#1f222b] border border-transparent dark:border-slate-700/60 rounded-lg text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 dark:focus:ring-slate-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 cursor-pointer"
                title="Clear search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="pt-3 px-2 flex justify-center shrink-0">
          <button
            type="button"
            onClick={onToggle}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
            title="Search menu"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Menu Scrollable Area */}
      <div className="flex-1 overflow-y-auto px-3 py-3 pt-0 space-y-5">
        {!hasSearchResults ? (
          <div className="px-3 py-8 text-center text-xs text-slate-400">
            <Search className="w-6 h-6 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">
              No menu items found
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              No results for "{searchQuery}"
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-[#0c6760] dark:text-teal-400 font-semibold hover:underline cursor-pointer"
            >
              Clear search
            </button>
          </div>
        ) : (
          filteredSections.map((section, idx) => (
            <div key={idx} className="">
              {/* Section Title: Title case, bold, font style matching reference image */}
              {isOpen && (
                <div className="px-3 pt-2 pb-1 text-[13px] font-bold text-slate-800 dark:text-slate-200 tracking-normal">
                  {section.sectionTitle}
                </div>
              )}

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item, itemIdx) => {
                  const Icon = item.icon;
                  const hasSub = Boolean(item.subItems && item.subItems.length > 0);
                  const active = isItemActive(item);
                  // When searching, auto-expand accordion to show matching subitems
                  const isMenuOpen = searchQuery.trim()
                    ? true
                    : openMenus[item.title] !== undefined
                      ? openMenus[item.title]
                      : active;

                  // 1. Accordion Item with Submenus
                  if (hasSub) {
                    return (
                      <div key={itemIdx} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => toggleMenu(item.title, isMenuOpen)}
                          className={`w-full flex items-center justify-between px-3 py-1.5 rounded text-[13.5px] transition-all text-left cursor-pointer group ${active
                            ? "bg-[#202938] text-white dark:bg-[#a3b3cc] dark:text-[#111827] font-bold shadow-xs"
                            : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold"
                            }`}
                          title={!isOpen ? item.title : undefined}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Icon
                              className={`w-[17px] h-[17px] shrink-0 transition-colors ${active
                                ? "text-white dark:text-[#111827]"
                                : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                                }`}
                            />
                            {isOpen && (
                              <span className="truncate">{item.title}</span>
                            )}
                          </div>
                          {isOpen && (
                            <div className="shrink-0 ml-1">
                              {isMenuOpen ? (
                                <ChevronDown
                                  className={`w-4 h-4 transition-transform ${active
                                    ? "text-white dark:text-[#111827]"
                                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400"
                                    }`}
                                />
                              ) : (
                                <ChevronRight
                                  className={`w-4 h-4 transition-transform ${active
                                    ? "text-white dark:text-[#111827]"
                                    : "text-slate-400 group-hover:text-slate-600 dark:text-slate-400"
                                    }`}
                                />
                              )}
                            </div>
                          )}
                        </button>

                        {/* Submenu Accordion: PRESERVED EXACTLY AS IT IS */}
                        {isOpen && isMenuOpen && item.subItems && (
                          <div className="pl-6 pr-1 py-1 space-y-0.5 border-l-2 border-slate-100 dark:border-slate-800/80 ml-5">
                            {item.subItems.map((sub, sIdx) => {
                              const isCurrent = isSubItemActive(sub.url);
                              return (
                                <NavLink
                                  key={sIdx}
                                  to={sub.url}
                                  onClick={() => {
                                    if (window.innerWidth < 1024)
                                      onMobileClose();
                                  }}
                                  className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${isCurrent
                                    ? "text-teal-600 dark:text-teal-400 font-bold bg-teal-50/70 dark:bg-teal-950/30"
                                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                    }`}
                                >
                                  <span
                                    className={`w-1.5 h-1.5 rounded-full shrink-0 transition-all ${isCurrent
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

                  // 2. Regular Single Nav Item (matching reference image exactly: active light bg-[#202938] text-white, active dark bg-[#a3b3cc] text-[#111827])
                  const isSingleActive = isSubItemActive(item.url || "");
                  return (
                    <NavLink
                      key={itemIdx}
                      to={item.url || "#"}
                      onClick={() => {
                        if (window.innerWidth < 1024) onMobileClose();
                      }}
                      className={`group flex items-center justify-between px-3 py-1.5 rounded text-[13.5px] transition-all cursor-pointer ${isSingleActive
                        ? "bg-[#202938] text-white dark:bg-[#a3b3cc] dark:text-[#111827] font-bold shadow-xs"
                        : "text-slate-800 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-semibold"
                        }`}
                      title={!isOpen ? item.title : undefined}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Icon
                          className={`w-[17px] h-[17px] shrink-0 transition-colors ${isSingleActive
                            ? "text-white dark:text-[#111827]"
                            : "text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white"
                            }`}
                        />
                        {isOpen && (
                          <span className="truncate">{item.title}</span>
                        )}
                      </div>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:block shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out z-40 ${isOpen ? "w-64" : "w-18"
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
            className="w-72 h-full bg-white dark:bg-[#16181f] shadow-2xl animate-in slide-in-from-left duration-200"
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
