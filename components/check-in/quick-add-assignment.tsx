'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { createAssignment } from '@/app/actions/school';
import { ASSIGNMENT_TYPES, PRIORITIES, EFFORTS } from '@/lib/checkin';
import { cn } from '@/lib/utils';

export function QuickAddAssignment({
  childId,
  defaultType = 'homework',
  triggerLabel = 'Add homework',
  triggerClassName,
  triggerVariant = 'default',
  fullWidth = false,
}: {
  childId: string;
  defaultType?: string;
  triggerLabel?: string;
  triggerClassName?: string;
  triggerVariant?: 'default' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [title, setTitle] = useState('');
  const [type, setType] = useState(defaultType);
  const [subject, setSubject] = useState('');
  const [teacher, setTeacher] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('normal');
  const [effort, setEffort] = useState('');

  function reset() {
    setTitle('');
    setType(defaultType);
    setSubject('');
    setTeacher('');
    setDueDate('');
    setPriority('normal');
    setEffort('');
  }

  function save() {
    if (!title.trim()) return;
    startTransition(async () => {
      await createAssignment({
        childId,
        title,
        type,
        subject,
        teacher,
        dueDate,
        priority,
        effort: effort || undefined,
        status: 'Not Started',
      });
      reset();
      setOpen(false);
    });
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset(); }}>
      <DialogTrigger asChild>
        <Button
          variant={triggerVariant}
          className={cn(fullWidth && 'w-full', 'touch-target font-bold', triggerClassName)}
        >
          <Plus className="w-4 h-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add school work</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="qa-title">What is it?</Label>
            <Input
              id="qa-title"
              placeholder="e.g. Math worksheet p. 42"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Type</Label>
              <Select value={type} onValueChange={setType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ASSIGNMENT_TYPES.map((t) => (
                    <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-subject">Subject</Label>
              <Input id="qa-subject" placeholder="Math" value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qa-due">Due date</Label>
              <Input id="qa-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="qa-teacher">Teacher (optional)</Label>
              <Input id="qa-teacher" placeholder="Mrs. Carter" value={teacher} onChange={(e) => setTeacher(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>How long?</Label>
              <Select value={effort || 'none'} onValueChange={(v) => setEffort(v === 'none' ? '' : v)}>
                <SelectTrigger><SelectValue placeholder="Not sure" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Not sure</SelectItem>
                  {EFFORTS.map((e) => (
                    <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => { reset(); setOpen(false); }}>Cancel</Button>
          <Button onClick={save} disabled={isPending || !title.trim()}>
            {isPending ? 'Adding…' : 'Add'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
