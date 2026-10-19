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

const AddressSkeleton = () => {
  return (
    <div className="w-full">
      {/* === Card Grid Layout === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 9 }).map((_, i) => (
          <div 
            key={i} 
            className="border border-gray-200 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 flex flex-col h-[180px]"
          >
            
            {/* Header: Title, Badge, and Address */}
            <div className="p-5 pb-6 flex flex-col gap-3 w-full">
              <div className="flex items-start justify-between gap-4 w-full">
                {/* Street Address Title */}
                <Skeleton className="h-6 w-3/4 rounded-md" />
                {/* Tiny Type Badge */}
                <Skeleton className="h-5 w-14 rounded-md shrink-0" />
              </div>
              
              {/* City, State Zip with map pin placeholder */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            </div>

            <div className="flex-1" />

            {/* Footer: Small Date and Actions */}
            <div className="p-4 bg-gray-50/50 dark:bg-zinc-900/30 border-t border-gray-100 dark:border-zinc-800/50 flex items-center justify-between gap-2 mt-auto rounded-b-2xl">
              {/* Small Date */}
              <Skeleton className="h-3 w-28 rounded-sm" />

              {/* Actions (Edit / Delete buttons) */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-16 rounded-lg" />
                <Skeleton className="h-8 w-16 rounded-lg" />
              </div>
            </div>

          </div>
        ))}
      </div>

      {/* === Pagination Footer Skeleton === */}
      <div className="flex justify-end mt-8 pt-4 border-t border-gray-100 dark:border-zinc-800/50">
         <div className="flex gap-1.5">
           <Skeleton className="h-9 w-9 rounded-xl" />
           <Skeleton className="h-9 w-9 rounded-xl" />
           <Skeleton className="h-9 w-9 rounded-xl" />
           <Skeleton className="h-9 w-9 rounded-xl" />
         </div>
      </div>
    </div>
  );
};

export default AddressSkeleton;