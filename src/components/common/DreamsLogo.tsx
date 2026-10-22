import React from "react";

interface DreamsLogoProps {
  className?: string;
  showText?: boolean | "responsive";
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export const DreamsLogo: React.FC<DreamsLogoProps> = ({
  className = "",
  showText = true,
  title,
  subtitle,
  size = "md",
}) => {
  const iconSizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  }[size];

  const titleSizeClasses = {
    sm: "text-sm",
    md: "text-[16px] sm:text-[17px]",
    lg: "text-xl sm:text-2xl",
  }[size];
  const mainTitle = title || "NEXORA";
  const subTitle = subtitle !== undefined ? subtitle : "ERP";

  return (
    <div className={`flex items-center gap-2.5 select-none shrink-0 ${className}`}>
      {/* High-fidelity vector mark matching reference design */}
      <div className={`relative ${iconSizeClasses} shrink-0 flex items-center justify-center`}>
        <svg
          viewBox="0 0 36 36"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full"
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
        <div className="flex items-baseline tracking-tight gap-1.5">
          <span className={`${titleSizeClasses} font-extrabold text-slate-900 dark:text-white tracking-tight`}>
            {mainTitle}
          </span>
          {subTitle && (
            <span className={`${titleSizeClasses} font-bold text-slate-900 dark:text-teal-400 tracking-wider`}>
              {subTitle}
            </span>
          )}
        </div>
      )}

      {showText === "responsive" && (
        <div className="hidden min-[420px]:flex items-baseline tracking-tight gap-1.5">
          <span className={`${titleSizeClasses} font-extrabold text-slate-900 dark:text-white tracking-tight`}>
            {mainTitle}
          </span>
          {subTitle && (
            <span className={`${titleSizeClasses} font-bold text-slate-900 dark:text-teal-400 tracking-wider`}>
              {subTitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export const NexoraLogo = DreamsLogo;
export default DreamsLogo;
