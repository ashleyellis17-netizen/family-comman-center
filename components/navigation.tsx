'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Home,
  Users,
  CalendarDays,
  CalendarHeart,
  ListTodo,
  Sun,
  Unlock,
  CheckCheck,
  Star,
  GraduationCap,
  Wallet,
  Lock,
  RotateCcw,
  Gift,
  ShoppingCart,
  Heart as HeartIcon,
  Sparkles,
  UtensilsCrossed,
  CalendarRange,
  Package,
  Shield,
  Settings,
  Plug,
  Menu,
  X,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    label: 'Home',
    items: [
      { href: '/', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/family-hub', label: 'Family Hub', icon: Home },
    ],
  },
  {
    label: 'Family',
    items: [
      { href: '/alex', label: 'Alex', icon: Users, color: 'alex' },
      { href: '/jaxon', label: 'Jaxon', icon: Users, color: 'jaxon' },
      { href: '/carson', label: 'Carson', icon: Users, color: 'carson' },
      { href: '/mom', label: 'Mom', icon: Users, color: 'mom' },
      { href: '/dad', label: 'Dad', icon: Users, color: 'dad' },
    ],
  },
  {
    label: 'Calendars',
    items: [
      { href: '/calendar', label: 'Shared Calendar', icon: CalendarHeart },
      { href: '/mom-calendar', label: 'Mom Calendar', icon: CalendarDays, color: 'mom' },
      { href: '/dad-calendar', label: 'Dad Calendar', icon: CalendarDays, color: 'dad' },
    ],
  },
  {
    label: 'Tasks & Rewards',
    items: [
      { href: '/chores', label: 'Kids Chores', icon: ListTodo },
      { href: '/summer-tasks', label: 'Summer Unlock', icon: Sun },
      { href: '/reward-unlock', label: 'Reward Unlock', icon: Unlock },
      { href: '/approvals', label: 'Approval Queue', icon: CheckCheck },
      { href: '/rewards', label: 'Rewards Store', icon: Gift },
    ],
  },
  {
    label: 'Tracking',
    items: [
      { href: '/behavior', label: 'Behavior', icon: Star },
      { href: '/grades', label: 'Grades', icon: GraduationCap },
      { href: '/allowance', label: 'Allowance', icon: Wallet },
      { href: '/grounding', label: 'Grounding', icon: Lock },
      { href: '/earn-back', label: 'Earn Back Plan', icon: RotateCcw },
    ],
  },
  {
    label: 'Kitchen',
    items: [
      { href: '/grocery-list', label: 'Grocery List', icon: ShoppingCart },
      { href: '/grocery-wishlist', label: 'Wishlist', icon: Sparkles },
      { href: '/meal-ideas', label: 'Meal Ideas', icon: UtensilsCrossed },
      { href: '/meal-plan', label: 'Meal Plan', icon: CalendarRange },
      { href: '/pantry', label: 'Pantry & Staples', icon: Package },
    ],
  },
  {
    label: 'Parents',
    items: [
      { href: '/admin', label: 'Parent Admin', icon: Shield },
      { href: '/settings', label: 'Google Accounts', icon: Settings },
      { href: '/data-connection', label: 'Data Connection', icon: Plug },
    ],
  },
];

function activeClasses(color?: string) {
  switch (color) {
    case 'alex':
      return 'bg-alex text-alex-foreground shadow-md shadow-alex/25';
    case 'jaxon':
      return 'bg-jaxon text-jaxon-foreground shadow-md shadow-jaxon/25';
    case 'carson':
      return 'bg-carson text-carson-foreground shadow-md shadow-carson/25';
    case 'mom':
      return 'bg-mom text-mom-foreground shadow-md shadow-mom/25';
    case 'dad':
      return 'bg-dad text-dad-foreground shadow-md shadow-dad/25';
    default:
      return 'bg-primary text-primary-foreground shadow-md shadow-primary/25';
  }
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5 p-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground/70">
            {group.label}
          </p>
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onNavigate}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all touch-target',
                    isActive
                      ? activeClasses(item.color)
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                  )}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Brand() {
  return (
    <Link href="/" className="group flex items-center gap-3">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-alex via-jaxon to-carson shadow-lg transition-transform group-hover:scale-105">
        <HeartIcon className="h-5 w-5 fill-white/50 text-white" />
      </div>
      <div>
        <h1 className="text-base font-extrabold leading-tight tracking-tight text-foreground">Theveny Family</h1>
        <p className="text-xs font-medium text-muted-foreground">Command Center</p>
      </div>
    </Link>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col border-r border-border/50 bg-card/80 backdrop-blur-sm lg:flex">
        <div className="border-b border-border/50 p-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-border/50 bg-card/90 p-4 backdrop-blur-sm lg:hidden">
        <Brand />
        <Button
          variant="ghost"
          size="icon"
          className="touch-target rounded-xl"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[73px] z-40 overflow-y-auto bg-background/98 backdrop-blur-sm lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <NavLinks onNavigate={() => setOpen(false)} />
        </div>
      )}
    </>
  );
}
