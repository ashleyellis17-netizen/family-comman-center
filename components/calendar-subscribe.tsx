'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Copy, Check, Download, Rss } from 'lucide-react';

export function CalendarSubscribe() {
  const [origin, setOrigin] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const httpUrl = origin ? `${origin}/api/calendar` : '';
  // webcal:// triggers the "subscribe" flow in most calendar apps/devices
  const webcalUrl = origin
    ? `webcal://${origin.replace(/^https?:\/\//, '')}/api/calendar`
    : '';

  const handleCopy = async () => {
    if (!httpUrl) return;
    try {
      await navigator.clipboard.writeText(httpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-5">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/15 text-primary flex items-center justify-center flex-shrink-0">
          <Rss className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-foreground">Sync to Cozyla</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Subscribe your Cozyla calendar to this live feed. New family events,
            school district dates, and assignment due dates update automatically.
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">
                Feed URL
              </p>
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 truncate rounded-lg bg-muted px-3 py-2 text-xs text-foreground">
                  {httpUrl || 'Loading...'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!httpUrl}
                  className="flex-shrink-0 gap-1.5 bg-transparent"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild className="gap-1.5">
                <a href={webcalUrl || '#'}>
                  <CalendarPlus className="w-4 h-4" />
                  Subscribe
                </a>
              </Button>
              <Button asChild variant="outline" className="gap-1.5 bg-transparent">
                <a href={httpUrl || '#'} download="family-command-center.ics">
                  <Download className="w-4 h-4" />
                  Download .ics
                </a>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              In the Cozyla app, go to{' '}
              <span className="font-medium text-foreground">
                Calendar → Add Calendar → Subscribe by URL
              </span>{' '}
              and paste the feed URL above. The device refreshes on its own
              schedule, so events stay in sync without re-importing.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
