'use client';

import { usePathname } from 'next/navigation';
import { Info } from 'lucide-react';
import { SAMPLE_ROUTES } from '@/lib/sample-routes';

export function SampleDataNotice() {
  const pathname = usePathname();
  if (!SAMPLE_ROUTES.has(pathname)) return null;
  return (
    <div role="note" className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground">
      <Info className="mt-0.5 w-4 h-4 shrink-0" aria-hidden="true" />
      <p className="leading-relaxed">
        <span className="font-bold">Sample data.</span> This screen is not connected to your household yet. Changes here are not saved or shared
        between devices.
      </p>
    </div>
  );
}
