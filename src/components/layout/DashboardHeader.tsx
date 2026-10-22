import React, { useState } from "react";
import { Search, PanelLeftClose, PanelLeft, Menu } from "lucide-react";
import { Link } from "react-router";
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
      <header className="h-16 shrink-0 flex items-center justify-between px-3 sm:px-6 bg-white dark:bg-[#12141c] border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 z-30 transition-colors w-full">
        {/* Left Side: Mobile Menu Button + Logo + Company Selector */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className="p-1.5 sm:p-2 rounded-md text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none shrink-0"
            aria-label="Toggle Navigation Sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="w-5 h-5 hidden lg:block" />
            ) : (
              <PanelLeft className="w-5 h-5 hidden lg:block" />
            )}
            <Menu className="w-5 h-5 lg:hidden" />
          </button>

          {/* Logo on small & medium screens (Desktop has logo in sidebar) */}
          <Link to="/" className="lg:hidden flex items-center shrink-0">
            <DreamsLogo showText="responsive" />
          </Link>

          {/* Company Workspace Switcher */}
          <div className="shrink-0">
            <CompanySelector />
          </div>
        </div>

        {/* Right Side: Theme, Search, Notifications, Messages, Language, Profile */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle (Sun / Moon) - Always accessible */}
          <ModeToggle />

          {/* Quick Search Button (⌘K) - Always accessible */}
          <button
            onClick={() => setSearchModalOpen(true)}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 shrink-0"
            title="Quick Search (⌘K)"
            aria-label="Search"
          >
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Language Selector (Tablet & Desktop; also available in mobile profile) */}
          <div className="hidden md:block">
            <LanguageSelector />
          </div>

          {/* Notifications (With red unread indicator badge) - Always accessible */}
          <HeaderNotifications />

          {/* Messages (Desktop & Tablet; also available in mobile profile) */}
          <div className="hidden sm:block">
            <HeaderMessages />
          </div>

          {/* Divider */}
          <div className="hidden sm:block h-5 sm:h-6 w-px bg-slate-200 dark:bg-slate-800 mx-0.5 sm:mx-1" />

          {/* Jamie Anderson Profile Avatar & Menu */}
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