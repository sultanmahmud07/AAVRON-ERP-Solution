import React, { useState, useRef, useEffect } from "react";
import {
  User,
  UserPen,
  Settings,
  LifeBuoy,
  Lock,
  LogOut,
  ChevronDown,
  Mail,
  Languages,
} from "lucide-react";
import jamieAvatar from "@/assets/images/default/jamie_anderson.jpg";
import { toast } from "sonner";
import { useNavigate } from "react-router";
import { useAppDispatch } from "@/redux/hook";
import { authApi, useLogoutMutation } from "@/redux/features/auth/auth.api";

interface UserProfileMenuProps {
  compact?: boolean;
  userInfo?: any;
}

export const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ compact = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [logout] = useLogoutMutation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleLogout = async () => {
    setIsOpen(false);
    try {
      await logout(undefined).unwrap();
    } catch (e) {
      console.warn("Logout request completed or handled:", e);
    }
    dispatch(authApi.util.resetApiState());
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.clear();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  const handleAction = (label: string) => {
    setIsOpen(false);
    toast.info(`${label} action triggered`);
  };

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 p-0.5 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-teal-500/30 shrink-0"
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="User Profile Menu"
      >
        <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden ring-2 ring-slate-200 dark:ring-slate-700 hover:ring-teal-500 transition-all">
          <img
            src={jamieAvatar}
            alt="Jamie Anderson"
            className="w-full h-full object-cover"
          />
          {/* Active online green dot */}
          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
        </div>
        {!compact && (
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 transition-transform duration-200 hidden md:block ${isOpen ? "rotate-180" : ""
              }`}
          />
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Card - Mobile Safe Positioning */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-[60px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-64 max-w-[280px] rounded-md bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 py-3 z-50 transform transition-all duration-200 origin-top-right animate-in fade-in zoom-in-95">
          {/* Profile Header */}
          <div className="flex items-center gap-3.5 px-4 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full overflow-hidden shrink-0 ring-2 ring-teal-500/30">
              <img
                src={jamieAvatar}
                alt="Jamie Anderson"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h4 className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                Jamie Anderson
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Administrator
              </p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1.5 space-y-0.5">
            <button
              onClick={() => handleAction("View Profile")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
            >
              <User className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>View Profile</span>
            </button>

            <button
              onClick={() => handleAction("Edit Profile")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
            >
              <UserPen className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Edit Profile</span>
            </button>

            <button
              onClick={() => handleAction("Settings")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
            >
              <Settings className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Settings</span>
            </button>

            <button
              onClick={() => handleAction("Support Tickets")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
            >
              <LifeBuoy className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              <span>Support Tickets</span>
            </button>

            {/* Mobile shortcuts for Messages & Language */}
            <div className="sm:hidden pt-1 border-t border-slate-100 dark:border-slate-800/80">
              <button
                onClick={() => handleAction("Messages Hub")}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
              >
                <Mail className="w-4 h-4 text-emerald-500" />
                <span>Messages (2 New)</span>
              </button>

              <button
                onClick={() => handleAction("Change Language")}
                className="w-full flex items-center gap-3 px-4 py-2 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
              >
                <Languages className="w-4 h-4 text-sky-500" />
                <span>Language (English US)</span>
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

          {/* Bottom Actions */}
          <div className="py-1 space-y-0.5">
            <button
              onClick={() => handleAction("Screen Locked")}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors font-medium text-left"
            >
              <Lock className="w-4 h-4 text-slate-400" />
              <span>Lock Screen</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-xs sm:text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors font-medium text-left cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-600" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;