'use client';

import { useState, useTransition } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Smile,
  BookOpen,
  CalendarClock,
  FolderKanban,
  HandHelping,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  PartyPopper,
} from 'lucide-react';
import type { AssignmentRow } from '@/lib/db/schema';
import type { ProjectWithMilestones } from '@/app/actions/projects';
import { getCheckinConfig, todayISO, REQUEST_CATEGORIES, type CheckinStepKey } from '@/lib/checkin';
import { saveSkillCheckin, createAssignment } from '@/app/actions/school';
import { createParentRequest } from '@/app/actions/parent-requests';
import { createBrainDump } from '@/app/actions/brain-dump';
import { SkillRatingGrid } from './skill-tracker';
import { getAccent } from './shared';

const STEP_ICONS: Record<CheckinStepKey, React.ElementType> = {
  day: Smile,
  homework: BookOpen,
  tests: CalendarClock,
  projects: FolderKanban,
  ask: HandHelping,
  brain: Lightbulb,
};

export function GuidedCheckIn({
  childId,
  childName,
  open,
  onOpenChange,
  openHomework,
  projects,
}: {
  childId: string;
  childName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  openHomework: AssignmentRow[];
  projects: ProjectWithMilestones[];
}) {
  const accent = getAccent(childId);
  const config = getCheckinConfig(childId);
  const STEPS = config.steps;
  const today = todayISO();
  const [isPending, startTransition] = useTransition();

  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);

  // Step 1 - skills
  const [skills, setSkills] = useState<Record<string, string>>({});

  // Simple inline capture fields
  const [hwTitle, setHwTitle] = useState('');
  const [hwSubject, setHwSubject] = useState('');
  const [hwAddedCount, setHwAddedCount] = useState(0);

  const [testTitle, setTestTitle] = useState('');
  const [testType, setTestType] = useState('test');
  const [testDate, setTestDate] = useState('');
  const [testAddedCount, setTestAddedCount] = useState(0);

  const [projTitle, setProjTitle] = useState('');
  const [projAddedCount, setProjAddedCount] = useState(0);

  const [askText, setAskText] = useState('');
  const [askCategory, setAskCategory] = useState('question');
  const [askAddedCount, setAskAddedCount] = useState(0);

  const [brainText, setBrainText] = useState('');
  const [brainAddedCount, setBrainAddedCount] = useState(0);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  function resetAll() {
    setStepIdx(0);
    setFinished(false);
    setSkills({});
    setHwTitle(''); setHwSubject(''); setHwAddedCount(0);
    setTestTitle(''); setTestType('test'); setTestDate(''); setTestAddedCount(0);
    setProjTitle(''); setProjAddedCount(0);
    setAskText(''); setAskCategory('question'); setAskAddedCount(0);
    setBrainText(''); setBrainAddedCount(0);
  }

  function handleOpenChange(o: boolean) {
    onOpenChange(o);
    if (!o) setTimeout(resetAll, 200);
  }

  function next() {
    if (step.key === 'day' && Object.keys(skills).length > 0) {
      const ratings = Object.entries(skills).map(([skill, rating]) => ({ skill, rating }));
      startTransition(async () => { await saveSkillCheckin({ childId, date: today, ratings }); });
    }
    if (isLast) {
      setFinished(true);
      return;
    }
    setStepIdx((i) => i + 1);
  }

  function addHomework() {
    if (!hwTitle.trim()) return;
    const title = hwTitle; const subject = hwSubject;
    startTransition(async () => {
      await createAssignment({ childId, title, subject, type: 'homework', dueDate: today, status: 'Not Started' });
      setHwTitle(''); setHwSubject(''); setHwAddedCount((c) => c + 1);
    });
  }
  function addTest() {
    if (!testTitle.trim()) return;
    const title = testTitle; const type = testType; const dueDate = testDate;
    startTransition(async () => {
      await createAssignment({ childId, title, type, dueDate, priority: 'high', status: 'Not Started' });
      setTestTitle(''); setTestDate(''); setTestAddedCount((c) => c + 1);
    });
  }
  function addProject() {
    if (!projTitle.trim()) return;
    const title = projTitle;
    startTransition(async () => {
      await createAssignment({ childId, title, type: 'project', priority: 'high', status: 'Not Started' });
      setProjTitle(''); setProjAddedCount((c) => c + 1);
    });
  }
  function addAsk() {
    if (!askText.trim()) return;
    const content = askText; const category = askCategory;
    startTransition(async () => {
      await createParentRequest({ childId, content, category });
      setAskText(''); setAskAddedCount((c) => c + 1);
    });
  }
  function addBrain() {
    if (!brainText.trim()) return;
    const content = brainText;
    startTransition(async () => {
      await createBrainDump({ childId, content });
      setBrainText(''); setBrainAddedCount((c) => c + 1);
    });
  }

  const addedPill = (n: number, noun: string) =>
    n > 0 ? (
      <p className="inline-flex items-center gap-1.5 text-sm font-bold text-success">
        <Check className="w-4 h-4" aria-hidden="true" />
        Added {n} {noun}{n > 1 ? 's' : ''}
      </p>
    ) : null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        {finished ? (
          <div className="text-center py-8">
            <div className={cn('mx-auto w-20 h-20 rounded-3xl flex items-center justify-center mb-5 bg-gradient-to-br', accent.grad)}>
              <PartyPopper className="w-10 h-10 text-white" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl text-center">Check-in complete!</DialogTitle>
            </DialogHeader>
            <p className="text-muted-foreground mt-2 mb-6">Nice work, {childName}. Everything is saved.</p>
            <Button className={cn('touch-target font-bold', accent.solid)} onClick={() => handleOpenChange(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className={cn('rounded-2xl flex items-center justify-center bg-gradient-to-br', accent.grad, config.style === 'visual' ? 'w-14 h-14' : 'w-11 h-11')}>
                  {(() => {
                    const StepIcon = STEP_ICONS[step.key];
                    return <StepIcon className={cn('text-white', config.style === 'visual' ? 'w-7 h-7' : 'w-6 h-6')} />;
                  })()}
                </div>
                <div>
                  {step.framing && (
                    <p className={cn('text-xs font-bold uppercase tracking-wide', accent.text)}>{step.framing}</p>
                  )}
                  <DialogTitle className={cn(config.style === 'visual' ? 'text-2xl' : 'text-xl')}>{step.title}</DialogTitle>
                  <p className="text-sm text-muted-foreground">{step.helper}</p>
                </div>
              </div>
              {/* Progress dots */}
              <div className="flex items-center gap-1.5 mt-3" aria-label={`Step ${stepIdx + 1} of ${STEPS.length}`}>
                {STEPS.map((s, i) => (
                  <span
                    key={s.key}
                    className={cn(
                      'h-2 rounded-full transition-all',
                      i === stepIdx ? cn('w-6', accent.bar) : i < stepIdx ? cn('w-2', accent.bar, 'opacity-60') : 'w-2 bg-muted'
                    )}
                  />
                ))}
              </div>
            </DialogHeader>

            <div className="py-2 min-h-[180px]">
              {step.key === 'day' && (
                <SkillRatingGrid childId={childId} value={skills} onChange={(s, r) => setSkills((p) => ({ ...p, [s]: r }))} size="lg" />
              )}

              {step.key === 'homework' && (
                <div className="space-y-4">
                  {openHomework.length > 0 && (
                    <div className="rounded-2xl bg-muted/40 p-3">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-2">Already on your list</p>
                      <ul className="space-y-1 text-sm text-foreground">
                        {openHomework.slice(0, 5).map((h) => (
                          <li key={h.id} className="flex items-center gap-2">
                            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
                            {h.title}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input placeholder="Homework (e.g. Read ch. 4)" value={hwTitle} onChange={(e) => setHwTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addHomework(); }} />
                    <Input placeholder="Subject" value={hwSubject} onChange={(e) => setHwSubject(e.target.value)} className="w-28" />
                    <Button onClick={addHomework} disabled={isPending || !hwTitle.trim()} className={accent.solid}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {addedPill(hwAddedCount, 'assignment')}
                </div>
              )}

              {step.key === 'tests' && (
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Select value={testType} onValueChange={setTestType}>
                      <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="test">Test</SelectItem>
                        <SelectItem value="quiz">Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input placeholder="Subject / topic" value={testTitle} onChange={(e) => setTestTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addTest(); }} />
                  </div>
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <label className="text-sm font-medium text-foreground">When is it?</label>
                      <Input type="date" value={testDate} onChange={(e) => setTestDate(e.target.value)} />
                    </div>
                    <Button onClick={addTest} disabled={isPending || !testTitle.trim()} className={accent.solid}>
                      <Plus className="w-4 h-4" />
                      Add
                    </Button>
                  </div>
                  {addedPill(testAddedCount, 'test')}
                </div>
              )}

              {step.key === 'projects' && (
                <div className="space-y-4">
                  {projects.filter((p) => p.status !== 'done').length > 0 && (
                    <div className="rounded-2xl bg-muted/40 p-3 space-y-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Your projects</p>
                      {projects.filter((p) => p.status !== 'done').map((p) => {
                        const nextStep = p.milestones.find((m) => !m.done);
                        return (
                          <div key={p.id} className="text-sm">
                            <span className="font-semibold text-foreground">{p.title}</span>
                            {nextStep && (
                              <span className="flex items-center gap-1.5 text-muted-foreground">
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" /> Next: {nextStep.title}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input placeholder="New project idea" value={projTitle} onChange={(e) => setProjTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addProject(); }} />
                    <Button onClick={addProject} disabled={isPending || !projTitle.trim()} className={accent.solid}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">Add the steps later from the Projects card.</p>
                  {addedPill(projAddedCount, 'project')}
                </div>
              )}

              {step.key === 'ask' && (
                <div className="space-y-3">
                  <Select value={askCategory} onValueChange={setAskCategory}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {REQUEST_CATEGORIES.map((c) => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea placeholder="What do you need?" value={askText} onChange={(e) => setAskText(e.target.value)} rows={2} />
                  <Button onClick={addAsk} disabled={isPending || !askText.trim()} className={cn('w-full', accent.solid)}>
                    <HandHelping className="w-4 h-4" />
                    Send request
                  </Button>
                  {addedPill(askAddedCount, 'request')}
                </div>
              )}

              {step.key === 'brain' && (
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Anything else…" value={brainText} onChange={(e) => setBrainText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229) addBrain(); }} />
                    <Button onClick={addBrain} disabled={isPending || !brainText.trim()} className={accent.solid}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {addedPill(brainAddedCount, 'note')}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
                disabled={stepIdx === 0}
                className="touch-target"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                {!isLast && (
                  <Button variant="ghost" onClick={() => setStepIdx((i) => i + 1)} className="touch-target text-muted-foreground">
                    Skip
                  </Button>
                )}
                <Button onClick={next} className={cn('touch-target font-bold', accent.solid)}>
                  {isLast ? 'Finish' : 'Next'}
                  {!isLast && <ArrowRight className="w-4 h-4" />}
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
