import React from 'react';

export const MovieCardSkeleton = () => (
  <div className="w-[180px] sm:w-[220px] shrink-0 animate-pulse flex flex-col gap-3">
    <div className="w-full aspect-[2/3] rounded-2xl bg-slate-800/80 border border-slate-700/40" />
    <div className="h-4 w-3/4 rounded bg-slate-800" />
    <div className="h-3 w-1/2 rounded bg-slate-800/60" />
  </div>
);

export const HeroSkeleton = () => (
  <div className="w-full h-[70vh] min-h-[500px] bg-slate-900 animate-pulse relative overflow-hidden flex items-end p-8 md:p-16">
    <div className="max-w-xl w-full flex flex-col gap-4">
      <div className="h-8 w-40 rounded-full bg-slate-800" />
      <div className="h-12 w-3/4 rounded-lg bg-slate-800" />
      <div className="h-4 w-full rounded bg-slate-800" />
      <div className="h-4 w-5/6 rounded bg-slate-800" />
      <div className="flex gap-4 mt-4">
        <div className="h-12 w-36 rounded-xl bg-slate-800" />
        <div className="h-12 w-36 rounded-xl bg-slate-800" />
      </div>
    </div>
  </div>
);

export const GridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
    {Array.from({ length: count }).map((_, i) => (
      <div key={i} className="animate-pulse flex flex-col gap-2">
        <div className="w-full aspect-[2/3] rounded-2xl bg-slate-800/80 border border-slate-700/40" />
        <div className="h-4 w-3/4 rounded bg-slate-800" />
        <div className="h-3 w-1/2 rounded bg-slate-800/60" />
      </div>
    ))}
  </div>
);
