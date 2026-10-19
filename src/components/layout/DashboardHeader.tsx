import React, { useState } from "react";
import { Search, PanelLeftClose, PanelLeft, Menu } from "lucide-react";
import { ModeToggle } from "./ModeToggler";
import { UserProfileMenu } from "./UserProfileMenu";
import { CompanySelector } from "./CompanySelector";
import { HeaderNotifications } from "./HeaderNotifications";
import { HeaderMessages } from "./HeaderMessages";
import { LanguageSelector } from "./LanguageSelector";
import { QuickSearchModal } from "./QuickSearchModal";
import DreamsLogo from "../common/DreamsLogo";

interface DashboardHeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sidebarOpen,
  onToggleSidebar,
}) => {
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  return (
    <>
      <header className="h-16 shrink-0 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-[#12141c] border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors">
        {/* Left Side: Sidebar toggle & Company Selector */}
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
            aria-label="Toggle Navigation Sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 hidden lg:block" />
            ) : (
              <PanelLeft className="w-5 h-5 hidden lg:block" />
            )}
            <Menu className="w-5 h-5 lg:hidden" />
          </button>

          {/* Logo on small screens or when collapsed */}
          {(!sidebarOpen || window.innerWidth < 1024) && (
            <div className="lg:hidden flex items-center mr-1">
              <DreamsLogo showText={true} />
            </div>
          )}

          {/* Company Workspace Switcher */}
          <CompanySelector />
        </div>

        {/* Right Side: Theme, Search, Language, Notifications, Messages, Profile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Theme Toggle (Dark / Night Mode & Light Mode) */}
          <ModeToggle />

          {/* Search Trigger Button */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-9 h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
            title="Quick Search (⌘K)"
            aria-label="Search"
          >
            <Search className="w-4 h-4" />
          </button>

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications with alert count */}
          <HeaderNotifications />

          {/* Messages with unread indicator */}
          <HeaderMessages />

          {/* Vertical Divider */}
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 mx-1" />

          {/* Jamie Anderson Profile Menu (Exact match to profile_menu.png) */}
          <UserProfileMenu />
        </div>
      </header>

      {/* Quick Search Spotlight Dialog */}
      <QuickSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
      />
    </>
  );
};

export default DashboardHeader;