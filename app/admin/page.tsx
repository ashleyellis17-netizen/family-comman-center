'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { PinEntry } from '@/components/pin-entry';
import { children, chores, rewards } from '@/lib/mock-data';
import { ChildAvatar } from '@/components/child-avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Shield,
  Plus,
  Check,
  Star,
  Calendar,
  GraduationCap,
  Wallet,
  Gift,
  Settings,
  LogOut,
  ThumbsUp,
  ThumbsDown,
  ListTodo,
} from 'lucide-react';
import type { ChildId } from '@/lib/types';

type AdminSection =
  | 'overview'
  | 'add-chore'
  | 'complete-chore'
  | 'add-behavior'
  | 'add-event'
  | 'add-grade'
  | 'add-allowance'
  | 'add-reward'
  | 'redeem-reward'
  | 'settings';

const adminSections = [
  { id: 'overview' as const, label: 'Overview', icon: Shield },
  { id: 'add-chore' as const, label: 'Add Chore', icon: Plus },
  { id: 'complete-chore' as const, label: 'Complete Chore', icon: Check },
  { id: 'add-behavior' as const, label: 'Add Behavior', icon: Star },
  { id: 'add-event' as const, label: 'Add Event', icon: Calendar },
  { id: 'add-grade' as const, label: 'Add Grade', icon: GraduationCap },
  { id: 'add-allowance' as const, label: 'Adjust Allowance', icon: Wallet },
  { id: 'add-reward' as const, label: 'Add Reward', icon: Gift },
  { id: 'redeem-reward' as const, label: 'Redeem Reward', icon: Gift },
  { id: 'settings' as const, label: 'Settings', icon: Settings },
];

function AdminForm({ section, onBack }: { section: AdminSection; onBack: () => void }) {
  const [selectedChild, setSelectedChild] = useState<ChildId | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would save to Google Sheets API
    console.log('[v0] Form submitted:', { section, selectedChild, formData });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({});
      setSelectedChild(null);
    }, 2000);
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-success" />
        </div>
        <h3 className="text-xl font-bold text-foreground">Success!</h3>
        <p className="text-muted-foreground mt-2">Your changes have been saved.</p>
      </div>
    );
  }

  const renderChildSelector = () => (
    <div className="mb-6">
      <label className="block text-sm font-medium text-foreground mb-3">
        Select Child
      </label>
      <div className="flex flex-wrap gap-3">
        {children.map((child) => (
          <button
            key={child.id}
            type="button"
            onClick={() => setSelectedChild(child.id as ChildId)}
            className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all touch-target',
              selectedChild === child.id
                ? `border-${child.color} bg-${child.color}-muted/30`
                : 'border-border bg-card hover:border-muted-foreground'
            )}
          >
            <ChildAvatar childId={child.id as ChildId} name={child.name} size="sm" />
            <span className="font-medium text-foreground">{child.name}</span>
          </button>
        ))}
      </div>
    </div>
  );

  const inputClass = 'h-12 text-lg bg-muted border-border';

  switch (section) {
    case 'add-chore':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Add New Chore</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Chore Title
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Clean Room"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description (optional)
            </label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Additional details..."
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.dueDate || ''}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Points
              </label>
              <Input
                type="number"
                value={formData.points || ''}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                placeholder="5"
                className={inputClass}
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Recurring
            </label>
            <select
              value={formData.recurring || ''}
              onChange={(e) => setFormData({ ...formData, recurring: e.target.value })}
              className="w-full h-12 text-lg bg-muted border border-border rounded-lg px-3 text-foreground"
            >
              <option value="">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedChild} className="flex-1 h-12 touch-target">
              Add Chore
            </Button>
          </div>
        </form>
      );

    case 'complete-chore':
      const pendingChores = chores.filter((c) => !c.completed);
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Complete Chore</h3>
          <div className="space-y-2">
            {pendingChores.map((chore) => {
              const child = children.find((c) => c.id === chore.assignedTo);
              return (
                <button
                  key={chore.id}
                  type="button"
                  onClick={() => setFormData({ choreId: chore.id })}
                  className={cn(
                    'w-full flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all touch-target',
                    formData.choreId === chore.id
                      ? 'border-success bg-success/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div className={cn(
                    'w-6 h-6 rounded-full border-2 flex items-center justify-center',
                    formData.choreId === chore.id ? 'border-success bg-success' : 'border-border'
                  )}>
                    {formData.choreId === chore.id && <Check className="w-4 h-4 text-success-foreground" />}
                  </div>
                  {child && <ChildAvatar childId={child.id as ChildId} name={child.name} size="sm" />}
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{chore.title}</p>
                    <p className="text-sm text-muted-foreground">Due: {chore.dueDate}</p>
                  </div>
                  <span className="text-sm text-muted-foreground">{chore.points} pts</span>
                </button>
              );
            })}
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.choreId} className="flex-1 h-12 touch-target bg-success hover:bg-success/90">
              Mark Complete
            </Button>
          </div>
        </form>
      );

    case 'add-behavior':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Add Behavior Note</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'positive' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all touch-target',
                  formData.type === 'positive'
                    ? 'border-success bg-success/10'
                    : 'border-border hover:border-success/50'
                )}
              >
                <ThumbsUp className="w-6 h-6 text-success" />
                <span className="font-medium text-foreground">Positive</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'negative' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all touch-target',
                  formData.type === 'negative'
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border hover:border-destructive/50'
                )}
              >
                <ThumbsDown className="w-6 h-6 text-destructive" />
                <span className="font-medium text-foreground">Negative</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What happened?"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Points
            </label>
            <Input
              type="number"
              value={formData.points || ''}
              onChange={(e) => setFormData({ ...formData, points: e.target.value })}
              placeholder="10"
              className={inputClass}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedChild || !formData.type} className="flex-1 h-12 touch-target">
              Add Note
            </Button>
          </div>
        </form>
      );

    case 'add-event':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Add Calendar Event</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Event Title
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Soccer Practice"
              className={inputClass}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date
              </label>
              <Input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Time (optional)
              </label>
              <Input
                type="time"
                value={formData.time || ''}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Category
            </label>
            <select
              value={formData.category || ''}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full h-12 text-lg bg-muted border border-border rounded-lg px-3 text-foreground"
              required
            >
              <option value="">Select category</option>
              <option value="school">School</option>
              <option value="sports">Sports</option>
              <option value="appointment">Appointment</option>
              <option value="family">Family</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 touch-target">
              Add Event
            </Button>
          </div>
        </form>
      );

    case 'add-grade':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Add Grade</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Subject
            </label>
            <Input
              value={formData.subject || ''}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g., Math"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Assignment (optional)
            </label>
            <Input
              value={formData.assignment || ''}
              onChange={(e) => setFormData({ ...formData, assignment: e.target.value })}
              placeholder="e.g., Chapter 5 Test"
              className={inputClass}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Grade (%)
              </label>
              <Input
                type="number"
                min="0"
                max="100"
                value={formData.grade || ''}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                placeholder="92"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Date
              </label>
              <Input
                type="date"
                value={formData.date || ''}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedChild} className="flex-1 h-12 touch-target">
              Add Grade
            </Button>
          </div>
        </form>
      );

    case 'add-allowance':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Adjust Allowance</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Type
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, adjustType: 'add' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all touch-target',
                  formData.adjustType === 'add'
                    ? 'border-success bg-success/10'
                    : 'border-border hover:border-success/50'
                )}
              >
                <Plus className="w-6 h-6 text-success" />
                <span className="font-medium text-foreground">Add</span>
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, adjustType: 'subtract' })}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all touch-target',
                  formData.adjustType === 'subtract'
                    ? 'border-destructive bg-destructive/10'
                    : 'border-border hover:border-destructive/50'
                )}
              >
                <Wallet className="w-6 h-6 text-destructive" />
                <span className="font-medium text-foreground">Subtract</span>
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Amount ($)
            </label>
            <Input
              type="number"
              min="0"
              step="0.01"
              value={formData.amount || ''}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="10.00"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reason
            </label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Weekly allowance"
              className={inputClass}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedChild || !formData.adjustType} className="flex-1 h-12 touch-target">
              Save
            </Button>
          </div>
        </form>
      );

    case 'add-reward':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Add New Reward</h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Reward Title
            </label>
            <Input
              value={formData.title || ''}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Extra Screen Time"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Description
            </label>
            <Input
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="30 minutes of extra screen time"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Point Cost
            </label>
            <Input
              type="number"
              min="1"
              value={formData.cost || ''}
              onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
              placeholder="10"
              className={inputClass}
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-12 touch-target">
              Add Reward
            </Button>
          </div>
        </form>
      );

    case 'redeem-reward':
      return (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Redeem Reward</h3>
          {renderChildSelector()}
          <div>
            <label className="block text-sm font-medium text-foreground mb-3">
              Select Reward
            </label>
            <div className="space-y-2">
              {rewards.filter(r => r.available).map((reward) => (
                <button
                  key={reward.id}
                  type="button"
                  onClick={() => setFormData({ ...formData, rewardId: reward.id })}
                  className={cn(
                    'w-full flex items-center justify-between p-4 rounded-xl border-2 text-left transition-all touch-target',
                    formData.rewardId === reward.id
                      ? 'border-warning bg-warning/10'
                      : 'border-border hover:border-muted-foreground'
                  )}
                >
                  <div>
                    <p className="font-medium text-foreground">{reward.title}</p>
                    {reward.description && (
                      <p className="text-sm text-muted-foreground">{reward.description}</p>
                    )}
                  </div>
                  <span className="font-bold text-warning-foreground">{reward.cost} pts</span>
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" onClick={onBack} className="flex-1 h-12 touch-target">
              Cancel
            </Button>
            <Button type="submit" disabled={!selectedChild || !formData.rewardId} className="flex-1 h-12 touch-target bg-warning hover:bg-warning/90 text-warning-foreground">
              Redeem
            </Button>
          </div>
        </form>
      );

    case 'settings':
      return (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-foreground mb-4">Settings</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium text-foreground mb-2">Change PIN</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Update the admin access PIN
              </p>
              <Input placeholder="New PIN" type="password" maxLength={4} className={inputClass} />
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium text-foreground mb-2">Google Sheets Connection</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Connect to Google Sheets for data persistence
              </p>
              <Input placeholder="Google Apps Script URL" className={inputClass} />
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/30">
              <h4 className="font-medium text-foreground mb-2">Edit Children</h4>
              <p className="text-sm text-muted-foreground">
                Manage child profiles, names, and colors
              </p>
            </div>
          </div>
          <Button type="button" variant="secondary" onClick={onBack} className="w-full h-12 touch-target mt-4">
            Back
          </Button>
        </div>
      );

    default:
      return null;
  }
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');

  if (!isAuthenticated) {
    return <PinEntry onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="cozyla-heading text-foreground flex items-center gap-3">
            <Shield className="w-8 h-8" />
            Parent Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage family command center
          </p>
        </div>
        <Button
          variant="ghost"
          onClick={() => setIsAuthenticated(false)}
          className="touch-target"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Lock
        </Button>
      </div>

      {activeSection === 'overview' ? (
        /* Admin Menu Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {adminSections.slice(1).map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className="rounded-2xl bg-card shadow-lg border border-border/50 p-6 text-center hover:bg-muted/50 transition-colors touch-target"
              >
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <p className="font-medium text-foreground">{section.label}</p>
              </button>
            );
          })}
        </div>
      ) : (
        /* Active Form */
        <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-6">
          <AdminForm 
            section={activeSection} 
            onBack={() => setActiveSection('overview')} 
          />
        </div>
      )}

      {/* Quick Stats */}
      {activeSection === 'overview' && (
        <div className="rounded-2xl bg-card shadow-lg border border-border/50 p-6">
          <h2 className="font-bold text-foreground mb-4">Quick Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <ListTodo className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{chores.filter(c => !c.completed).length}</p>
              <p className="text-sm text-muted-foreground">Pending Chores</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <Gift className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{rewards.length}</p>
              <p className="text-sm text-muted-foreground">Active Rewards</p>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-xl">
              <Star className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-2xl font-bold text-foreground">{children.length}</p>
              <p className="text-sm text-muted-foreground">Children</p>
            </div>
            <div className="text-center p-4 bg-success/10 rounded-xl">
              <Check className="w-6 h-6 mx-auto mb-2 text-success" />
              <p className="text-2xl font-bold text-success">{chores.filter(c => c.completed).length}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
