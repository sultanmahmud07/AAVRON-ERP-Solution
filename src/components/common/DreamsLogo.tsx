import React from "react";

interface DreamsLogoProps {
  className?: string;
  showText?: boolean | "responsive";
}

export const DreamsLogo: React.FC<DreamsLogoProps> = ({
  className = "",
  showText = true,
}) => {
  return (
    <div className={`flex items-center gap-2 select-none shrink-0 ${className}`}>
      {/* High-fidelity vector mark matching reference design */}
      <div className="relative w-8 h-8 shrink-0 flex items-center justify-center">
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          {/* Hexagon outline segments */}
          <path
            d="M18 4L29 10.5V23.5L18 30L7 23.5V10.5L18 4Z"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-slate-300 dark:text-slate-700"
          />
          {/* Inner data connectors */}
          <path
            d="M11 21L18 16L25 20"
            stroke="#10b981"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M18 16V10"
            stroke="#0ea5e9"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          {/* Colorful corner nodes */}
          <circle cx="18" cy="4" r="2.5" fill="#38bdf8" />
          <circle cx="29" cy="10.5" r="2.5" fill="#a855f7" />
          <circle cx="29" cy="23.5" r="2.5" fill="#ec4899" />
          <circle cx="18" cy="30" r="2.5" fill="#f97316" />
          <circle cx="7" cy="23.5" r="2.5" fill="#10b981" />
          <circle cx="7" cy="10.5" r="2.5" fill="#06b6d4" />
          <circle cx="18" cy="16" r="2" fill="#10b981" />
        </svg>
      </div>

      {showText === true && (
        <div className="flex items-baseline tracking-tight">
          <span className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            NEXORA
          </span>
          <span className="text-[16px] sm:text-[17px] font-semibold text-teal-600 dark:text-teal-400 ml-1 uppercase text-xs sm:text-sm tracking-wider">
            ERP
          </span>
        </div>
      )}

      {showText === "responsive" && (
        <div className="hidden min-[420px]:flex items-baseline tracking-tight">
          <span className="text-[16px] sm:text-[17px] font-extrabold text-slate-900 dark:text-white tracking-tight">
            NEXORA
          </span>
          <span className="text-[16px] sm:text-[17px] font-semibold text-teal-600 dark:text-teal-400 ml-1 uppercase text-xs sm:text-sm tracking-wider">
            ERP
          </span>
        </div>
      )}
    </div>
  );
};

export const NexoraLogo = DreamsLogo;
export default DreamsLogo;
