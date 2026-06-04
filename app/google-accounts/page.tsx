'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { googleAccounts as initialAccounts } from '@/lib/mock-data';
import type { GoogleAccount } from '@/lib/types';
import { Mail, Calendar, Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';

export default function GoogleAccountsPage() {
  const [accounts, setAccounts] = useState<GoogleAccount[]>(initialAccounts);

  const toggleConnected = (id: string) =>
    setAccounts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, connected: !a.connected, syncEnabled: !a.connected ? a.syncEnabled : false } : a))
    );
  const toggleSync = (id: string) =>
    setAccounts((prev) => prev.map((a) => (a.id === id ? { ...a, syncEnabled: !a.syncEnabled } : a)));

  const roleColor: Record<GoogleAccount['role'], string> = {
    Parent: 'bg-primary/10 text-primary',
    Child: 'bg-alex/10 text-alex',
    Shared: 'bg-carson/10 text-carson',
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Google Accounts"
        description="Connect Gmail and Google Calendar for each family member"
        icon={Mail}
        iconClassName="from-primary to-primary/70 text-primary-foreground"
      />

      <div className="rounded-2xl bg-muted/40 border border-border/50 p-4 mb-6 text-sm text-muted-foreground">
        Connecting an account lets the command center read calendar events and reminders. Sync is one-way (read-only) until you enable two-way sync per account.
      </div>

      <div className="space-y-3">
        {accounts.map((a) => (
          <div key={a.id} className="rounded-3xl bg-card border border-border/50 shadow-sm p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-2xl bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-foreground">{a.name}</h3>
                    <span className={cn('px-2 py-0.5 rounded-full text-[10px] font-bold uppercase', roleColor[a.role])}>{a.role}</span>
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{a.gmail}</p>
                </div>
              </div>
              <Button
                size="sm"
                variant={a.connected ? 'outline' : 'default'}
                className="rounded-xl gap-1"
                onClick={() => toggleConnected(a.id)}
              >
                {a.connected ? <><Check className="w-4 h-4" /> Connected</> : <><Link2 className="w-4 h-4" /> Connect</>}
              </Button>
            </div>

            {a.connected && (
              <div className="mt-4 pt-4 border-t border-border/40 space-y-3">
                {a.calendarId && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" /> {a.calendarId}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Two-way calendar sync</span>
                  <Switch checked={a.syncEnabled} onCheckedChange={() => toggleSync(a.id)} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
