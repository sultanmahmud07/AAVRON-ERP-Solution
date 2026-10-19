import React, { useState, useRef, useEffect } from "react";
import { Bell, CheckCheck, Clock, AlertTriangle, CalendarCheck } from "lucide-react";
import { toast } from "sonner";

export const HeaderNotifications: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [unreadCount, setUnreadCount] = useState(2);

  const notifications = [
    {
      id: "1",
      title: "7 Leave Requests Pending",
      desc: "Requires Andrew's approval before end of day",
      time: "10m ago",
      urgent: true,
      icon: CalendarCheck,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/40",
    },
    {
      id: "2",
      title: "Payroll Run March 2026 Ready",
      desc: "Batch generated for 1,196 employees ($1,248K)",
      time: "45m ago",
      urgent: true,
      icon: AlertTriangle,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    },
    {
      id: "3",
      title: "Alex Thompson (Senior Dev)",
      desc: "Interview scheduled for today at 2:30 PM",
      time: "2h ago",
      urgent: false,
      icon: Clock,
      color: "text-teal-500 bg-teal-50 dark:bg-teal-950/40",
    },
  ];

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
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 shrink-0"
        title="Notifications"
        aria-label="Notifications"
      >
        <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#181a24]"></span>
        )}
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Dropdown Card */}
      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-[60px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-2xl bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2.5 px-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
              <p className="text-[11px] text-slate-500">2 urgent alerts pending</p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  setUnreadCount(0);
                  toast.success("All notifications marked as read");
                }}
                className="flex items-center gap-1 text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto my-1">
            {notifications.map((n) => {
              const Icon = n.icon;
              return (
                <div
                  key={n.id}
                  onClick={() => {
                    toast.info(`Opening ${n.title}`);
                    setIsOpen(false);
                  }}
                  className="flex items-start gap-2.5 sm:gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
                >
                  <div className={`w-8 h-8 rounded-lg ${n.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{n.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0">{n.time}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{n.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                toast.info("Viewing all alerts & notifications");
              }}
              className="w-full text-center text-xs font-semibold text-teal-600 dark:text-teal-400 py-1 hover:underline"
            >
              View All 9 Alerts & Requests →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderNotifications;
