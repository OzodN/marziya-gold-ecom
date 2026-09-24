import React from "react";

export const ProductCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col overflow-hidden rounded-2xl border border-noir-800 bg-noir-900/60 animate-pulse">
      {/* Image Skeleton */}
      <div className="aspect-square w-full bg-noir-800/80" />

      {/* Details Skeleton */}
      <div className="flex flex-1 flex-col justify-between p-5 space-y-4">
        <div className="space-y-2.5">
          <div className="h-3 w-16 rounded bg-noir-800" />
          <div className="h-5 w-3/4 rounded bg-noir-800" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 w-20 rounded bg-noir-800/60" />
            <div className="h-4 w-24 rounded bg-noir-800/60" />
          </div>
        </div>

        {/* Action Button Skeleton */}
        <div className="pt-2">
          <div className="h-10 w-full rounded-xl bg-noir-800" />
        </div>
      </div>
    </div>
  );
};
