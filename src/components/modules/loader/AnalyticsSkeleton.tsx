import React from "react";
import { cn } from "@/lib/utils"; 

// Reusable Skeleton primitive
const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("animate-pulse rounded-md bg-muted", className)}
    {...props}
  />
);

const AnalyticsSkeleton = () => {
  return (
    <div className="p-4 md:p-6 space-y-6 w-full">
      
      {/* === Page Header Skeleton === */}
      <div className="space-y-3 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-7 w-7 rounded-md" /> {/* Title Icon */}
          <Skeleton className="h-8 w-48 lg:w-64" /> {/* Title Text */}
        </div>
        <Skeleton className="h-4 w-72 lg:w-96" /> {/* Subtitle */}
      </div>

      {/* === Top Stats Grid Skeleton === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-5 md:p-6 bg-card rounded-2xl border border-border shadow-sm flex flex-col justify-between h-[140px]">
            <div className="flex justify-between items-start">
              <Skeleton className="h-4 w-28" /> {/* Label */}
              <Skeleton className="h-8 w-8 rounded-lg" /> {/* Icon Box */}
            </div>
            <div>
              <Skeleton className="h-8 w-16 mb-3" /> {/* Big Number */}
              <Skeleton className="h-3 w-32" /> {/* Trend line/text */}
            </div>
          </div>
        ))}
      </div>

      {/* === Charts Grid Skeleton === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
        
        {/* Left: Wide Line Chart Skeleton (Span 2) */}
        <div className="lg:col-span-2 p-5 md:p-6 bg-card rounded-2xl border border-border shadow-sm h-[400px] flex flex-col">
          <Skeleton className="h-5 w-56 mb-8" /> {/* Chart Title */}
          
          {/* Simulated Chart Area */}
          <div className="flex-1 flex flex-col justify-between relative px-2 pb-6 border-b border-l border-muted">
            {/* Horizontal Grid Lines */}
            <div className="w-full h-px bg-muted" />
            <div className="w-full h-px bg-muted" />
            <div className="w-full h-px bg-muted" />
            <div className="w-full h-px bg-muted" />
            
            {/* Animated Graph Line (Simulating the spike in the image) */}
            <svg className="absolute inset-0 w-full h-full text-muted-foreground/20 animate-pulse" preserveAspectRatio="none" viewBox="0 0 100 100" fill="none">
              <path d="M0,95 L85,95 L92,85 L96,40 L100,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M0,95 L85,95 L92,85 L96,40 L100,10 L100,100 L0,100 Z" fill="currentColor" opacity="0.1" />
            </svg>
          </div>
        </div>

        {/* Right: Donut Chart Skeleton (Span 1) */}
        <div className="lg:col-span-1 p-5 md:p-6 bg-card rounded-2xl border border-border shadow-sm h-[400px] flex flex-col">
          <Skeleton className="h-5 w-40 mb-8" /> {/* Chart Title */}
          
          <div className="flex-1 flex items-center justify-center">
            {/* Donut Chart Shape */}
            <div className="relative flex items-center justify-center w-48 h-48">
              {/* Outer Ring */}
              <Skeleton className="absolute inset-0 w-full h-full rounded-full" />
              {/* Inner Cutout (Matches background color to make it a donut) */}
              <div className="absolute w-32 h-32 bg-card rounded-full" />
            </div>
          </div>
          
          {/* Legend Items */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mt-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-3 w-3 rounded-full" /> {/* Color Dot */}
                <Skeleton className="h-3 w-16" /> {/* Label */}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AnalyticsSkeleton;