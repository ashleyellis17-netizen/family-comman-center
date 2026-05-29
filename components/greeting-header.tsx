'use client';

import { useEffect, useState } from 'react';

function greetingFor(hour: number) {
  if (hour < 5) return 'Good night';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good night';
}

export function GreetingHeader() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000 * 30);
    return () => clearInterval(id);
  }, []);

  const dateLabel = now
    ? now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    : '';
  const timeLabel = now
    ? now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    : '';
  const greeting = now ? greetingFor(now.getHours()) : 'Welcome';

  return (
    <header className="relative overflow-hidden rounded-3xl bg-sidebar p-6 text-sidebar-accent-foreground shadow-lg shadow-black/10 md:p-8">
      <div className="absolute inset-0 boho-dots opacity-[0.07]" aria-hidden />
      <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-gradient-to-br from-alex/30 to-transparent blur-2xl" aria-hidden />
      <div className="absolute -bottom-20 right-1/3 h-48 w-48 rounded-full bg-gradient-to-br from-carson/25 to-transparent blur-2xl" aria-hidden />
      <div className="relative flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em] text-sidebar-foreground/55">
            {dateLabel || 'Family Command Center'}
          </p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-balance md:text-4xl lg:text-5xl">
            {greeting}, Theveny Family
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-sidebar-foreground/65 md:text-base">
            Everything the household needs for today, all in one place.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl bg-white/10 px-5 py-3 backdrop-blur-sm">
          <div className="text-right">
            <p className="font-mono text-3xl font-bold leading-none tabular-nums md:text-4xl">
              {timeLabel || '--:--'}
            </p>
            <p className="mt-1 text-xs font-medium text-sidebar-foreground/60">Local time</p>
          </div>
        </div>
      </div>
    </header>
  );
}
