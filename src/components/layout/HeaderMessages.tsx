import React, { useState, useRef, useEffect } from "react";
import { Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";

export const HeaderMessages: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const messages = [
    {
      id: "1",
      sender: "Evelyn Hayes",
      role: "Product Manager",
      text: "Q1 roadmap updates ready for review in Project module.",
      time: "15m ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face",
    },
    {
      id: "2",
      sender: "Marcus Vance",
      role: "Finance Lead",
      text: "Uploaded monthly tax reconciliation reports.",
      time: "1h ago",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
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
        className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#181a24] text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-all shadow-xs hover:border-slate-300 dark:hover:border-slate-700 shrink-0"
        title="Messages"
        aria-label="Messages"
      >
        <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#181a24]"></span>
      </button>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-2xs"
          onClick={() => setIsOpen(false)}
        />
      )}

      {isOpen && (
        <div className="fixed sm:absolute right-3 sm:right-0 top-[60px] sm:top-full mt-2 w-[calc(100vw-24px)] sm:w-96 max-w-sm rounded-md bg-white dark:bg-[#181a24] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-3 z-50 animate-in fade-in zoom-in-95">
          <div className="flex items-center justify-between pb-2.5 px-2 border-b border-slate-100 dark:border-slate-800">
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Direct Messages</h4>
              <p className="text-[11px] text-slate-500">2 unread conversations</p>
            </div>
            <MessageSquare className="w-4 h-4 text-emerald-500" />
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-72 overflow-y-auto my-1">
            {messages.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  toast.info(`Opening chat with ${m.sender}`);
                  setIsOpen(false);
                }}
                className="flex items-center gap-2.5 sm:gap-3 p-2.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition-colors"
              >
                <div className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden shrink-0">
                  <img src={m.avatar} alt={m.sender} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 w-2 h-2 bg-emerald-500 rounded-full border border-white dark:border-slate-900"></span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{m.sender}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{m.time}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1">{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => {
                setIsOpen(false);
                toast.info("Opening Messages application");
              }}
              className="w-full text-center text-xs font-semibold text-teal-600 dark:text-teal-400 py-1 hover:underline"
            >
              Open Messaging Hub →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HeaderMessages;
