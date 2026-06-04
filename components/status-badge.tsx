import { cn } from '@/lib/utils';

// Maps any known status string to a color treatment.
const statusStyles: Record<string, string> = {
  // Summer task statuses
  'Not Started': 'bg-muted text-muted-foreground border-border',
  'In Progress': 'bg-warning/15 text-warning-foreground border-warning/30',
  'Needs Parent Check': 'bg-primary/15 text-primary border-primary/30',
  Approved: 'bg-success/15 text-success border-success/30',
  'Rejected / Redo': 'bg-destructive/15 text-destructive border-destructive/30',
  Missed: 'bg-destructive/15 text-destructive border-destructive/30',
  Excused: 'bg-muted text-muted-foreground border-border',
  // Reward unlock states
  Locked: 'bg-muted text-muted-foreground border-border',
  'Needs Parent Approval': 'bg-primary/15 text-primary border-primary/30',
  Unlocked: 'bg-success/15 text-success border-success/30',
  'Used Today': 'bg-jaxon-muted text-jaxon border-jaxon/30',
  'Daily Limit Reached': 'bg-destructive/15 text-destructive border-destructive/30',
  // Grounding / approvals
  Active: 'bg-destructive/15 text-destructive border-destructive/30',
  'Earn Back Available': 'bg-warning/15 text-warning-foreground border-warning/30',
  'Ready for Review': 'bg-primary/15 text-primary border-primary/30',
  Resolved: 'bg-success/15 text-success border-success/30',
  Pending: 'bg-warning/15 text-warning-foreground border-warning/30',
  Rejected: 'bg-destructive/15 text-destructive border-destructive/30',
  Redo: 'bg-destructive/15 text-destructive border-destructive/30',
  // Priorities
  High: 'bg-destructive/15 text-destructive border-destructive/30',
  Medium: 'bg-warning/15 text-warning-foreground border-warning/30',
  Low: 'bg-muted text-muted-foreground border-border',
  // Mom work modes
  Available: 'bg-success/15 text-success border-success/30',
  'Quiet Time': 'bg-primary/15 text-primary border-primary/30',
  'Do Not Interrupt': 'bg-destructive/15 text-destructive border-destructive/30',
  'Lunch Break': 'bg-warning/15 text-warning-foreground border-warning/30',
  'Done Working': 'bg-success/15 text-success border-success/30',
  // Allowance / restriction labels
  Eligible: 'bg-success/15 text-success border-success/30',
  'Allowance Locked': 'bg-destructive/15 text-destructive border-destructive/30',
  'Parent Override': 'bg-primary/15 text-primary border-primary/30',
  'Electronics Locked': 'bg-destructive/15 text-destructive border-destructive/30',
  'Game Time Locked': 'bg-destructive/15 text-destructive border-destructive/30',
};

export function StatusBadge({ status, className }: { status: string; className?: string }) {
  const style = statusStyles[status] ?? 'bg-muted text-muted-foreground border-border';
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border whitespace-nowrap',
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
