import React from 'react';

export const HeroSkeleton = () => (
  <div className="relative w-full max-w-[900px] aspect-[16/9] mb-16 rounded-[2.5rem] overflow-hidden bg-[var(--onyx-skeleton)] animate-pulse border border-[var(--onyx-border)] border-dashed">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--onyx-skeleton-shimmer)] to-transparent skew-x-12 -translate-x-full animate-shimmer"></div>
  </div>
);

export const MovieRowSkeleton = () => (
  <section className="px-6 md:px-12 mb-32">
    <div className="flex items-end justify-between mb-16 max-w-9xl mx-auto px-6">
      <div className="space-y-4">
        <div className="w-24 h-2 bg-[var(--onyx-skeleton)] rounded-full"></div>
        <div className="w-64 h-12 bg-[var(--onyx-skeleton)] rounded-2xl"></div>
      </div>
    </div>
    <div className="flex gap-12 overflow-x-hidden px-8 md:px-24">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="flex-shrink-0 w-[300px] aspect-[2/3] rounded-[2rem] bg-[var(--onyx-skeleton)] border border-[var(--onyx-border)] relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--onyx-skeleton-shimmer)] to-transparent -translate-x-full animate-shimmer"></div>
        </div>
      ))}
    </div>
  </section>
);

export const DetailSkeleton = () => (
    <div className="min-h-screen bg-[var(--onyx-bg)] p-32 flex flex-col items-center">
        <div className="w-full max-w-5xl h-[500px] bg-[var(--onyx-skeleton)] rounded-[3rem] animate-pulse border border-[var(--onyx-border)] mb-16"></div>
        <div className="w-full max-w-3xl space-y-8">
            <div className="h-16 bg-[var(--onyx-skeleton)] rounded-2xl w-3/4"></div>
            <div className="h-4 bg-[var(--onyx-skeleton)] rounded-full w-full"></div>
            <div className="h-4 bg-[var(--onyx-skeleton)] rounded-full w-5/6"></div>
        </div>
    </div>
);

export const GridSkeleton = () => (
  <div className="aspect-[2/3] rounded-[2rem] bg-[var(--onyx-skeleton)] border border-[var(--onyx-border)] relative overflow-hidden animate-pulse">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[var(--onyx-skeleton-shimmer)] to-transparent -translate-x-full animate-shimmer"></div>
  </div>
);
