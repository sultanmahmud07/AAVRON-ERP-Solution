import React, { useState } from "react";
import { Outlet } from "react-router";
import DreamsSidebar from "./DreamsSidebar";
import DashboardHeader from "./DashboardHeader";

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-[#0f1117] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Sidebar Navigation */}
      <DreamsSidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <DashboardHeader
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileSidebarOpen(!mobileSidebarOpen);
            } else {
              setSidebarOpen(!sidebarOpen);
            }
          }}
        />

        {/* Page Main Content */}
        <main className="flex-1 p-2 sm:p-3 lg:p-5 max-w-[1720px] w-full mx-auto">
          <Outlet />
        </main>
        <footer>This is footer</footer>
      </div>
    </div>
  );
};

export default DashboardLayout;