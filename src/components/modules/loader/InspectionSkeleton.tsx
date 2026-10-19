import React from "react";
import { cn } from "@/lib/utils";

// Using zinc-800 to match your premium dark theme
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "animate-pulse rounded-md bg-gray-200 dark:bg-zinc-800", 
      className
    )}
    {...props}
  />
);

const InspectionSkeleton = () => {
  return (
    <div className="w-full">
      {/* Wrapper: Match the table container border and background */}
      <div className="rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-950 overflow-hidden w-full">
        
        {/* === Table Header Row === */}
        <div className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50 p-4">
          <div className="grid grid-cols-12 gap-4">
             <Skeleton className="col-span-2 h-4 w-12" /> {/* Client */}
             <Skeleton className="col-span-2 h-4 w-24" /> {/* Contact Info */}
             <Skeleton className="col-span-2 h-4 w-20" /> {/* Schedule */}
             <Skeleton className="col-span-3 h-4 w-20" /> {/* Location */}
             <Skeleton className="col-span-2 h-4 w-16" /> {/* Status */}
             <Skeleton className="col-span-1 h-4 w-16 justify-self-end" /> {/* Actions */}
          </div>
        </div>

        {/* === Table Body Rows === */}
        <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="p-4 transition-colors">
              <div className="grid grid-cols-12 gap-4 items-start">
                
                {/* 1. Client (Name & Service) */}
                <div className="col-span-2 space-y-2 pt-1">
                   <Skeleton className="h-4 w-24" />
                   <Skeleton className="h-3 w-32" />
                </div>

                {/* 2. Contact Info (Email & Phone) */}
                <div className="col-span-2 space-y-2 pt-1">
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                     <Skeleton className="h-3.5 w-36" />
                   </div>
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                     <Skeleton className="h-3.5 w-28" />
                   </div>
                </div>

                {/* 3. Schedule (Date & Time) */}
                <div className="col-span-2 space-y-2 pt-1">
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-3.5 w-3.5 rounded-sm shrink-0" />
                     <Skeleton className="h-4 w-32" />
                   </div>
                   <div className="flex items-center gap-2">
                     <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0" />
                     <Skeleton className="h-4 w-24" />
                   </div>
                </div>

                {/* 4. Location (Address, City/State/Zip) */}
                <div className="col-span-3 pt-1">
                   <div className="flex items-start gap-2">
                     <Skeleton className="h-3.5 w-3.5 rounded-full shrink-0 mt-1" />
                     <div className="space-y-2 w-full">
                       <Skeleton className="h-4 w-48" />
                       <Skeleton className="h-3 w-36" />
                     </div>
                   </div>
                </div>

                {/* 5. Status (Badge) */}
                <div className="col-span-2 pt-1">
                   <Skeleton className="h-6 w-24 rounded-full" />
                </div>

                {/* 6. Action Buttons (View, Delete, Menu) */}
                <div className="col-span-1 flex justify-end gap-1 pt-1">
                   <Skeleton className="h-8 w-8 rounded-md" /> 
                   <Skeleton className="h-8 w-8 rounded-md" /> 
                   <Skeleton className="h-8 w-8 rounded-md" /> 
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>

      {/* === Pagination Footer === */}
      <div className="flex justify-end mt-6">
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

export default InspectionSkeleton;