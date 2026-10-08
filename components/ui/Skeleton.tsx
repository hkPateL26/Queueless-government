import React from 'react';

/**
 * Universal Premium Shimmer Element
 * Features smooth pulse + subtle gradient sweep
 */
export const Shimmer: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] rounded-xl ${className}`} />
);

/**
 * Skeleton for Scheme Bento Cards in SchemesCatalog
 */
export const SchemeCardSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {Array.from({ length: count }).map((_, i) => (
      <div 
        key={i} 
        className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-3.5"
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shimmer className="w-10 h-10 rounded-2xl" />
              <div className="space-y-1">
                <Shimmer className="h-3 w-20" />
                <Shimmer className="h-2.5 w-14" />
              </div>
            </div>
            <Shimmer className="h-5 w-16 rounded-full" />
          </div>

          <div className="space-y-1.5 pt-1">
            <Shimmer className="h-4.5 w-4/5" />
            <Shimmer className="h-4 w-3/5" />
          </div>

          <Shimmer className="h-14 w-full rounded-xl" />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Shimmer className="h-4 w-20 rounded-md" />
          <Shimmer className="h-8 w-24 rounded-xl" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Time Slot Grid in SlotBookingModal
 */
export const SlotSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="p-3 border border-slate-200 bg-white rounded-xl flex items-center justify-between">
        <div className="space-y-1.5">
          <Shimmer className="h-4 w-28" />
          <Shimmer className="h-2.5 w-20" />
        </div>
        <Shimmer className="h-5 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

/**
 * Skeleton for 6 Kacheri Waiting Hall Counters
 */
export const CounterGridSkeleton: React.FC<{ count?: number }> = ({ count = 6 }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="rounded-2xl border-2 border-slate-200 bg-white p-3.5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <Shimmer className="h-3.5 w-20" />
          <Shimmer className="h-4 w-14 rounded-full" />
        </div>

        <div className="space-y-1">
          <Shimmer className="h-4 w-36" />
          <Shimmer className="h-2.5 w-24" />
        </div>

        <div className="grid grid-cols-2 gap-2 py-1">
          <Shimmer className="h-14 rounded-xl" />
          <Shimmer className="h-14 rounded-xl" />
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-3 w-20" />
        </div>
      </div>
    ))}
  </div>
);

/**
 * Skeleton for Token Search / Status Card in TokenTrackerModal
 */
export const CardSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl sm:rounded-3xl p-5 border border-slate-200 space-y-4">
    <div className="flex justify-between items-center pb-2 border-b border-slate-100">
      <Shimmer className="h-4 w-28" />
      <Shimmer className="h-5 w-20 rounded-full" />
    </div>
    <div className="text-center py-2 space-y-2">
      <Shimmer className="h-3 w-24 mx-auto" />
      <Shimmer className="h-10 w-32 mx-auto rounded-xl" />
      <Shimmer className="h-4 w-48 mx-auto" />
    </div>
    <div className="grid grid-cols-3 gap-2 py-1">
      <Shimmer className="h-12 rounded-xl" />
      <Shimmer className="h-12 rounded-xl" />
      <Shimmer className="h-12 rounded-xl" />
    </div>
    <Shimmer className="h-10 w-full rounded-xl" />
  </div>
);

/**
 * Skeleton for Digital Token Pass Modal
 */
export const PassSkeleton: React.FC = () => (
  <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-5 max-w-lg mx-auto">
    <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
      <Shimmer className="w-12 h-12 rounded-2xl" />
      <div className="space-y-1.5 flex-1">
        <Shimmer className="h-4 w-40" />
        <Shimmer className="h-3 w-28" />
      </div>
    </div>
    <div className="text-center space-y-2">
      <Shimmer className="h-3 w-24 mx-auto" />
      <Shimmer className="h-12 w-36 mx-auto rounded-xl" />
      <Shimmer className="h-44 w-44 mx-auto rounded-2xl" />
    </div>
    <div className="space-y-2">
      <Shimmer className="h-14 w-full rounded-2xl" />
      <div className="grid grid-cols-2 gap-2">
        <Shimmer className="h-10 rounded-xl" />
        <Shimmer className="h-10 rounded-xl" />
      </div>
    </div>
  </div>
);

/**
 * Timeline Skeleton
 */
export const TimelineSkeleton: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex gap-4 items-center">
        <Shimmer className="w-8 h-8 rounded-full" />
        <div className="space-y-1.5 flex-1">
          <Shimmer className="h-4 w-32" />
          <Shimmer className="h-3 w-48" />
        </div>
      </div>
    ))}
  </div>
);
