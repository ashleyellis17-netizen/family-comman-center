'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PageHeader } from '@/components/page-header';
import { dataConnectionSettings, expectedSheetTabs } from '@/lib/mock-data';
import { Database, Link2, Check, RefreshCw, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function DataConnectionPage() {
  const [webAppUrl, setWebAppUrl] = useState(dataConnectionSettings.webAppUrl);
  const [apiToken, setApiToken] = useState(dataConnectionSettings.apiToken);
  const [sheetId, setSheetId] = useState(dataConnectionSettings.sheetId);
  const [connected, setConnected] = useState(dataConnectionSettings.connected);
  const [lastSync, setLastSync] = useState<string | null>(null);

  const canConnect = webAppUrl.trim() && apiToken.trim() && sheetId.trim();

  const handleConnect = () => {
    setConnected((c) => !c);
    if (!connected) setLastSync(new Date().toLocaleString());
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Data Connection"
        description="Link the app to your Google Sheets workbook"
        icon={Database}
        iconClassName="from-jaxon to-jaxon-light text-white"
      />

      <div
        className={cn(
          'rounded-3xl border shadow-sm p-5 mb-6 flex items-center gap-3',
          connected ? 'bg-success/5 border-success/30' : 'bg-card border-border/50'
        )}
      >
        <div className={cn('w-11 h-11 rounded-2xl flex items-center justify-center shrink-0', connected ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground')}>
          {connected ? <Check className="w-5 h-5" /> : <Link2 className="w-5 h-5" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground">{connected ? 'Connected' : 'Not connected'}</p>
          <p className="text-sm text-muted-foreground">
            {connected ? `Last synced ${lastSync ?? 'just now'}` : 'Enter your Apps Script details below to connect'}
          </p>
        </div>
        {connected && (
          <Button variant="outline" size="sm" className="rounded-xl gap-1" onClick={() => setLastSync(new Date().toLocaleString())}>
            <RefreshCw className="w-4 h-4" /> Sync now
          </Button>
        )}
      </div>

      <div className="rounded-3xl bg-card border border-border/50 shadow-sm p-5 space-y-4 mb-6">
        <div className="space-y-1.5">
          <Label htmlFor="url">Web App URL</Label>
          <Input id="url" value={webAppUrl} onChange={(e) => setWebAppUrl(e.target.value)} placeholder="https://script.google.com/macros/s/.../exec" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="token">API Token</Label>
          <Input id="token" type="password" value={apiToken} onChange={(e) => setApiToken(e.target.value)} placeholder="Your secret token" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="sheet">Sheet ID</Label>
          <Input id="sheet" value={sheetId} onChange={(e) => setSheetId(e.target.value)} placeholder="The ID from the Sheets URL" />
        </div>
        <Button onClick={handleConnect} disabled={!connected && !canConnect} className="w-full rounded-xl gap-1">
          {connected ? 'Disconnect' : 'Connect'}
        </Button>
      </div>

      <div className="rounded-3xl bg-card border border-border/50 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-border/50 bg-muted/30 flex items-center gap-2">
          <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-bold text-foreground text-sm">Expected workbook tabs ({expectedSheetTabs.length})</h2>
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {expectedSheetTabs.map((tab) => (
            <span key={tab} className="px-2.5 py-1 rounded-lg text-xs font-medium bg-muted text-muted-foreground border border-border/40">
              {tab}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
