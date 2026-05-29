import type { AssigneeId } from './types';

// Centralized color class maps so person colors stay consistent everywhere.
export const personColor: Record<
  string,
  { text: string; bg: string; bgSolid: string; border: string; ring: string; gradientText?: string; dot: string }
> = {
  alex: { text: 'text-alex', bg: 'bg-alex-muted', bgSolid: 'bg-alex text-alex-foreground', border: 'border-alex/30', ring: 'ring-alex/40', gradientText: 'gradient-text-alex', dot: 'bg-alex' },
  jaxon: { text: 'text-jaxon', bg: 'bg-jaxon-muted', bgSolid: 'bg-jaxon text-jaxon-foreground', border: 'border-jaxon/30', ring: 'ring-jaxon/40', gradientText: 'gradient-text-jaxon', dot: 'bg-jaxon' },
  carson: { text: 'text-carson', bg: 'bg-carson-muted', bgSolid: 'bg-carson text-carson-foreground', border: 'border-carson/30', ring: 'ring-carson/40', gradientText: 'gradient-text-carson', dot: 'bg-carson' },
  mom: { text: 'text-mom', bg: 'bg-mom-muted', bgSolid: 'bg-mom text-mom-foreground', border: 'border-mom/30', ring: 'ring-mom/40', dot: 'bg-mom' },
  dad: { text: 'text-dad', bg: 'bg-dad-muted', bgSolid: 'bg-dad text-dad-foreground', border: 'border-dad/30', ring: 'ring-dad/40', dot: 'bg-dad' },
  all: { text: 'text-family', bg: 'bg-family-muted', bgSolid: 'bg-family text-family-foreground', border: 'border-family/30', ring: 'ring-family/40', dot: 'bg-family' },
  family: { text: 'text-family', bg: 'bg-family-muted', bgSolid: 'bg-family text-family-foreground', border: 'border-family/30', ring: 'ring-family/40', dot: 'bg-family' },
};

export function colorFor(id?: AssigneeId | string) {
  return personColor[id ?? 'family'] ?? personColor.family;
}

export const personLabel: Record<string, string> = {
  alex: 'Alex',
  jaxon: 'Jaxon',
  carson: 'Carson',
  mom: 'Mom',
  dad: 'Dad',
  all: 'Everyone',
};

export const categoryColor: Record<string, string> = {
  school: 'bg-alex-muted text-alex border-alex/30',
  sports: 'bg-jaxon-muted text-jaxon border-jaxon/30',
  appointment: 'bg-destructive/15 text-destructive border-destructive/30',
  family: 'bg-family-muted text-family border-family/30',
  work: 'bg-dad-muted text-dad border-dad/30',
  reminder: 'bg-mom-muted text-mom border-mom/30',
  meal: 'bg-carson-muted text-carson border-carson/30',
  chore: 'bg-secondary text-secondary-foreground border-border',
  other: 'bg-muted text-muted-foreground border-border',
};
