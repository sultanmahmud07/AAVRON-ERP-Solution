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

const ProfileSkeleton = () => {
  return (
    <div className="w-full p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
      
      {/* === Page Header Skeleton === */}
      <div className="space-y-2 mb-8">
        <Skeleton className="h-8 w-56 md:w-64" /> {/* Account Settings Title */}
        <Skeleton className="h-4 w-80 md:w-96" /> {/* Subtitle */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start w-full">
        
        {/* ================= LEFT COLUMN: PROFILE & DETAILS ================= */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          
          {/* User Profile Card */}
          <div className="border border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 p-8 flex flex-col items-center justify-center text-center">
            {/* Avatar */}
            <Skeleton className="h-28 w-28 rounded-full mb-5" />
            
            {/* Name and Email */}
            <Skeleton className="h-6 w-40 mb-2.5" />
            <Skeleton className="h-4 w-48 mb-6" />
            
            {/* Badges (Role & Status) */}
            <div className="flex items-center justify-center gap-3">
              <Skeleton className="h-6 w-28 rounded-full" />
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </div>

          {/* Account Details Card */}
          <div className="border border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 p-6">
            <Skeleton className="h-5 w-36 mb-6" /> {/* Card Title */}
            
            <div className="space-y-4">
              {/* Detail Row 1 */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-4 w-20" />
              </div>
              
              {/* Detail Row 2 */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
              
              {/* Detail Row 3 */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <Skeleton className="h-4 w-28" />
                </div>
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          </div>

        </div>

        {/* ================= RIGHT COLUMN: SECURITY PREFERENCES ================= */}
        <div className="lg:col-span-2">
          
          <div className="border border-gray-100 dark:border-zinc-800/60 shadow-sm rounded-2xl bg-white dark:bg-zinc-950 p-6 md:p-8">
            
            {/* Card Header */}
            <div className="mb-8">
              <Skeleton className="h-6 w-56 mb-2" />
              <Skeleton className="h-4 w-3/4 md:w-96" />
            </div>

            {/* Form Fields */}
            <div className="space-y-6 max-w-2xl">
              
              {/* Current Password */}
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              
              {/* New Password */}
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>
              
              {/* Confirm Password */}
              <div className="space-y-2.5">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-12 w-full rounded-xl" />
              </div>

            </div>

            {/* Update Password Button */}
            <div className="mt-8">
              <Skeleton className="h-11 w-40 rounded-xl" />
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;