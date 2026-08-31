'use client';

import { useMemo, useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Smile, Check } from 'lucide-react';
import type { SkillCheckinRow } from '@/lib/db/schema';
import { getCheckinConfig, todayISO, type SkillRating } from '@/lib/checkin';
import { saveSkillCheckin } from '@/app/actions/school';
import { getAccent } from './shared';

const toneStyle: Record<SkillRating['tone'], { on: string; off: string }> = {
  good: {
    on: 'bg-success text-success-foreground border-success shadow-sm',
    off: 'bg-card text-foreground border-border hover:border-success/50',
  },
  mid: {
    on: 'bg-warning text-warning-foreground border-warning shadow-sm',
    off: 'bg-card text-foreground border-border hover:border-warning/50',
  },
  low: {
    on: 'bg-primary text-primary-foreground border-primary shadow-sm',
    off: 'bg-card text-foreground border-border hover:border-primary/50',
  },
};

// Controlled grid of skills, each with a set of age-appropriate rating buttons.
export function SkillRatingGrid({
  childId,
  value,
  onChange,
  size = 'md',
}: {
  childId: string;
  value: Record<string, string>;
  onChange: (skill: string, rating: string) => void;
  size?: 'md' | 'lg';
}) {
  const config = getCheckinConfig(childId);
  return (
    <div className="space-y-4">
      {config.skills.map((skill) => (
        <div key={skill}>
          <p className={cn('font-bold text-foreground mb-2', size === 'lg' ? 'text-lg' : 'text-base')}>
            {skill}
          </p>
          <div className="flex flex-wrap gap-2">
            {config.ratings.map((r) => {
              const selected = value[skill] === r.label;
              const tone = toneStyle[r.tone];
              return (
                <button
                  key={r.label}
                  type="button"
                  onClick={() => onChange(skill, r.label)}
                  aria-pressed={selected}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-2xl border-2 font-bold transition-all touch-target',
                    size === 'lg' ? 'px-5 py-3 text-lg' : 'px-4 py-2.5 text-sm',
                    selected ? tone.on : tone.off
                  )}
                >
                  <span aria-hidden="true" className={size === 'lg' ? 'text-2xl' : 'text-xl'}>
                    {r.emoji}
                  </span>
                  {r.label}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Standalone card: shows today's check-in status and lets you (re)log skills.
export function SkillTrackerCard({
  childId,
  checkins,
}: {
  childId: string;
  checkins: SkillCheckinRow[];
}) {
  const accent = getAccent(childId);
  const today = todayISO();
  const [isPending, startTransition] = useTransition();

  const todaysRatings = useMemo(() => {
    const map: Record<string, string> = {};
    for (const c of checkins) {
      if (c.date === today) map[c.skill] = c.rating;
    }
    return map;
  }, [checkins, today]);

  const [draft, setDraft] = useState<Record<string, string>>(todaysRatings);
  const [editing, setEditing] = useState(Object.keys(todaysRatings).length === 0);

  const hasToday = Object.keys(todaysRatings).length > 0;

  function save() {
    const ratings = Object.entries(draft).map(([skill, rating]) => ({ skill, rating }));
    if (ratings.length === 0) return;
    startTransition(async () => {
      await saveSkillCheckin({ childId, date: today, ratings });
      setEditing(false);
    });
  }

  // Group recent history by date (most recent 5 days, excluding today).
  const historyDays = useMemo(() => {
    const byDate: Record<string, SkillCheckinRow[]> = {};
    for (const c of checkins) {
      if (c.date === today) continue;
      (byDate[c.date] ??= []).push(c);
    }
    return Object.keys(byDate)
      .sort((a, b) => b.localeCompare(a))
      .slice(0, 5)
      .map((date) => ({ date, entries: byDate[date] }));
  }, [checkins, today]);

  return (
    <div className="rounded-3xl bg-card border border-border/60 shadow-sm p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className={cn('w-10 h-10 rounded-2xl flex items-center justify-center', accent.soft)}>
            <Smile className={cn('w-5 h-5', accent.text)} />
          </div>
          <div>
            <h3 className="text-lg font-extrabold text-foreground">How Today Went</h3>
            <p className="text-xs text-muted-foreground font-medium">Skill check-in</p>
          </div>
        </div>
        {hasToday && !editing && (
          <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
            Update
          </Button>
        )}
      </div>

      {editing ? (
        <>
          <SkillRatingGrid childId={childId} value={draft} onChange={(s, r) => setDraft((p) => ({ ...p, [s]: r }))} />
          <div className="flex justify-end gap-2 mt-5">
            {hasToday && (
              <Button variant="ghost" onClick={() => { setDraft(todaysRatings); setEditing(false); }}>
                Cancel
              </Button>
            )}
            <Button onClick={save} disabled={isPending || Object.keys(draft).length === 0} className={accent.solid}>
              {isPending ? 'Saving…' : "Save Today's Check-In"}
            </Button>
          </div>
        </>
      ) : (
        <div className="space-y-2">
          {Object.entries(todaysRatings).map(([skill, rating]) => (
            <div key={skill} className="flex items-center justify-between gap-3 rounded-2xl bg-muted/40 px-4 py-2.5">
              <span className="font-semibold text-foreground">{skill}</span>
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-foreground">
                <Check className="w-4 h-4 text-success" aria-hidden="true" />
                {rating}
              </span>
            </div>
          ))}
        </div>
      )}

      {historyDays.length > 0 && (
        <div className="mt-6 pt-4 border-t border-border/60">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Recent days</p>
          <div className="space-y-2">
            {historyDays.map(({ date, entries }) => (
              <div key={date} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 text-muted-foreground font-medium">
                  {new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {entries.map((e) => (
                    <span key={e.id} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
                      {e.rating}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
