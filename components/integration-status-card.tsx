import { AlertTriangle, KeyRound } from 'lucide-react';
import type { IntegrationStatus } from '@/lib/integrations';

export function IntegrationStatusCard({
  status,
  summary,
  whatItWillDo,
}: {
  status: IntegrationStatus;
  summary: string;
  whatItWillDo: string[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <section aria-labelledby="integration-status" className="flex items-start gap-4 rounded-3xl border border-warning/40 bg-warning/10 p-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-warning text-warning-foreground">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="flex min-w-0 flex-col gap-1">
          <h2 id="integration-status" className="font-bold text-foreground">
            {status.configured ? 'Credentials found, sync not built yet' : 'Not configured'}
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">{summary}</p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Nothing on this page is connected, and no data is being read or written. The app works fully without it.
          </p>
        </div>
      </section>

      {!status.configured && (
        <section aria-labelledby="integration-missing" className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
          <h2 id="integration-missing" className="flex items-center gap-2 font-bold text-foreground">
            <KeyRound className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Missing settings
          </h2>
          <ul className="flex flex-wrap gap-2">
            {status.missing.map((key) => (
              <li key={key} className="rounded-lg border border-border/40 bg-muted px-2.5 py-1 font-mono text-xs text-muted-foreground">
                {key}
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="integration-planned" className="flex flex-col gap-3 rounded-3xl border border-border/50 bg-card p-5 shadow-sm">
        <h2 id="integration-planned" className="font-bold text-foreground">Planned once it is built</h2>
        <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
          {whatItWillDo.map((line) => (
            <li key={line} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {line}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
