import React from "react";
import { cn } from "@/lib/utils";

// FIXED: Switched from 'bg-muted' to specific gray shades for better contrast
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-200 dark:bg-gray-700", 
      className
    )}
    {...props}
  />
);

const TableSkeleton = () => {
  return (
    <div className="w-full space-y-5">
      {/* Wrapper: Added dark:border-gray-800 to ensure the border is visible */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm bg-card overflow-hidden">
        
        {/* Table Header Row */}
        {/* Added dark:bg-gray-800/50 to make the header distinct in dark mode */}
        <div className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 p-4">
          <div className="grid grid-cols-12 gap-4">
             <Skeleton className="col-span-2 h-4 w-16" /> {/* Type */}
             <Skeleton className="col-span-1 h-4 w-12" /> {/* Weight */}
             <Skeleton className="col-span-1 h-4 w-12" /> {/* Amount */}
             <Skeleton className="col-span-2 h-4 w-24" /> {/* Date */}
             <Skeleton className="col-span-2 h-4 w-24" /> {/* ID */}
             <Skeleton className="col-span-1 h-4 w-16" /> {/* Status */}
             <Skeleton className="col-span-3 h-4 w-20 justify-self-end" /> {/* Action */}
          </div>
        </div>

        {/* Table Body Rows */}
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/30">
              <div className="grid grid-cols-12 gap-4 items-center">
                
                {/* 1. Type */}
                <div className="col-span-2">
                   <Skeleton className="h-4 w-24 mb-1" />
                </div>

                {/* 2. Weight */}
                <div className="col-span-1">
                   <Skeleton className="h-4 w-10" />
                </div>

                {/* 3. Due Amount */}
                <div className="col-span-1">
                   <Skeleton className="h-4 w-8" />
                </div>

                {/* 4. Delivery Date */}
                <div className="col-span-2">
                   <Skeleton className="h-4 w-32" />
                </div>

                {/* 5. Tracking ID */}
                <div className="col-span-2">
                   <Skeleton className="h-4 w-28 rounded-sm" />
                </div>

                {/* 6. Status */}
                <div className="col-span-1">
                   <Skeleton className="h-6 w-20 rounded-full" />
                </div>

                {/* 7. Action Buttons */}
                <div className="col-span-3 flex justify-end gap-2">
                   <Skeleton className="h-9 w-9 rounded-md" /> {/* Eye Button */}
                   <Skeleton className="h-9 w-24 rounded-md" /> {/* Action Button */}
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* === 3. Pagination Footer === */}
      <div className="flex justify-between items-center pt-2 px-1">
         <Skeleton className="h-4 w-40" />
         <div className="flex gap-2">
           <Skeleton className="h-8 w-8 rounded-md" />
           <Skeleton className="h-8 w-8 rounded-md" />
           <Skeleton className="h-8 w-8 rounded-md" />
         </div>
      </div>

    </div>
  );
};

export default TableSkeleton;