import React from "react";
import { cn } from "@/lib/utils";

// Sleek pulse animation using zinc-800 to match your premium dark theme
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800", 
      className
    )}
    {...props}
  />
);

const AvailableSkeleton = () => {
  return (
    <div className="w-full p-3 md:p-5">
        {/* === Page Header Skeleton === */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-md" /> {/* Title Icon */}
          <Skeleton className="h-8 w-48 lg:w-64" /> {/* Title Text */}
        </div>
        <Skeleton className="h-4 w-72 lg:w-96" /> {/* Subtitle */}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        
        {/* ================= LEFT: CUSTOM CALENDAR SKELETON ================= */}
        <div className="lg:col-span-5 border border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden lg:sticky top-6">
          <div className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-4 px-6">
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-28" /> {/* "Select Dates" */}
              <div className="flex gap-1">
                <Skeleton className="h-8 w-8 rounded-lg" /> {/* Prev button */}
                <Skeleton className="h-8 w-8 rounded-lg" /> {/* Next button */}
              </div>
            </div>
            <div className="flex justify-center mt-3">
              <Skeleton className="h-6 w-32" /> {/* Month/Year */}
            </div>
          </div>
          
          <div className="p-6 pt-6">
            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-4 gap-1">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="flex justify-center">
                  <Skeleton className="h-3 w-6 rounded-sm" />
                </div>
              ))}
            </div>

            {/* Calendar Grid (5 rows of 7 days) */}
            <div className="grid grid-cols-7 gap-y-2 gap-x-1 justify-items-center">
              {Array.from({ length: 35 }).map((_, index) => (
                <Skeleton key={index} className="w-8 h-8 md:w-10 md:h-10 rounded-full" />
              ))}
            </div>

            {/* Footer summary */}
            <div className="mt-6 md:mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>

        {/* ================= RIGHT: TIME SLOT CONFIGURATOR SKELETON ================= */}
        <div className="lg:col-span-7 flex flex-col gap-6">

          {/* Top Info Banner */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900 rounded-xl p-4 flex items-start gap-3">
            <Skeleton className="w-5 h-5 rounded-full shrink-0" />
            <div className="w-full space-y-2 mt-0.5">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          </div>

          {/* Time Slot Cards (Simulate 2 selected dates) */}
          <div className="space-y-4 md:space-y-6">
            {Array.from({ length: 2 }).map((_, cardIdx) => (
              <div key={cardIdx} className="border border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
                <div className="bg-gray-50/50 dark:bg-zinc-900/50 border-b border-gray-100 dark:border-zinc-800 py-3 px-4 flex flex-row items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-4 h-4 rounded-sm" /> {/* Icon */}
                    <Skeleton className="h-5 w-40 md:w-56" /> {/* Date Title */}
                  </div>
                  <Skeleton className="h-6 w-6 rounded-md" /> {/* Trash Icon */}
                </div>
                
                <div className="pt-4 pb-5 md:pt-5 md:pb-6 px-4">
                  {/* Grid of Time Slot Pills */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:flex md:flex-wrap gap-2 md:gap-3">
                    {Array.from({ length: 6 }).map((_, pillIdx) => (
                      <Skeleton 
                        key={pillIdx} 
                        className="h-[42px] w-full md:w-[120px] rounded-xl" 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Fixed Bottom Action Bar */}
          <div className="sticky bottom-4 z-10 flex justify-center md:justify-end p-3 md:p-4 bg-white/90 dark:bg-zinc-950/90 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm mt-4">
             <Skeleton className="h-11 w-full md:w-48 rounded-xl" />
          </div>

        </div>
      </div>
    </div>
  );
};

export default AvailableSkeleton;