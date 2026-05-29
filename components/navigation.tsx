'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
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
  Sparkles,
  UtensilsCrossed,
  CalendarRange,
  Package,
  Shield,
  Settings,
  Plug,
  Menu,
  X,
  CalendarClock,
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
    label: 'Settings',
    items: [
      { href: '/settings', label: 'Google Accounts', icon: Settings },
      { href: '/data-connection', label: 'Data Connection', icon: Plug },
    ],
  },
];

// Quick-access items for the tablet/mobile bottom bar.
const bottomBarItems: NavItem[] = [
  { href: '/', label: 'Home', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: CalendarClock },
  { href: '/summer-tasks', label: 'Tasks', icon: Sun },
  { href: '/grocery-list', label: 'Grocery', icon: ShoppingCart },
];

function dotColor(color?: string) {
  switch (color) {
    case 'alex':
      return 'bg-alex';
    case 'jaxon':
      return 'bg-jaxon';
    case 'carson':
      return 'bg-carson';
    case 'mom':
      return 'bg-mom-light';
    case 'dad':
      return 'bg-dad-light';
    default:
      return 'bg-sidebar-primary';
  }
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-6 px-3 py-4">
      {navGroups.map((group) => (
        <div key={group.label}>
          <p className="px-3 pb-2 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-sidebar-foreground/45">
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
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[0.95rem] font-semibold transition-all',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
                      : 'text-sidebar-foreground/75 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-sidebar-accent/50 text-sidebar-foreground/70 group-hover:bg-sidebar-accent',
                    )}
                  >
                    <Icon className="h-[1.05rem] w-[1.05rem]" />
                  </span>
                  <span className="truncate">{item.label}</span>
                  {item.color && (
                    <span className={cn('ml-auto h-2 w-2 rounded-full', dotColor(item.color))} />
                  )}
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
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-alex via-jaxon to-carson shadow-lg shadow-black/20 transition-transform group-hover:scale-105">
        <Home className="h-5 w-5 text-white" />
      </div>
      <div>
        <h1 className="text-[0.95rem] font-extrabold leading-tight tracking-tight text-sidebar-accent-foreground">
          Theveny Family
        </h1>
        <p className="text-xs font-medium text-sidebar-foreground/55">Command Center</p>
      </div>
    </Link>
  );
}

function AdminButton({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/admin"
      onClick={onNavigate}
      className="flex items-center gap-3 rounded-xl bg-sidebar-primary px-3 py-3 font-bold text-sidebar-primary-foreground shadow-md shadow-black/20 transition-transform hover:scale-[1.02]"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15">
        <Shield className="h-[1.05rem] w-[1.05rem]" />
      </span>
      <span className="text-[0.95rem]">Parent Admin Mode</span>
    </Link>
  );
}

export function Navigation() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <div className="border-b border-sidebar-border/60 p-5">
          <Brand />
        </div>
        <div className="flex-1 overflow-y-auto">
          <NavLinks />
        </div>
        <div className="border-t border-sidebar-border/60 p-3">
          <AdminButton />
        </div>
      </aside>

      {/* Mobile / tablet top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-sidebar-border/60 bg-sidebar px-4 py-3 text-sidebar-foreground lg:hidden">
        <Brand />
        <button
          type="button"
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-sidebar-accent/60 text-sidebar-accent-foreground"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 top-[68px] z-40 flex flex-col bg-sidebar text-sidebar-foreground lg:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex-1 overflow-y-auto">
            <NavLinks onNavigate={() => setOpen(false)} />
          </div>
          <div className="border-t border-sidebar-border/60 p-3">
            <AdminButton onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Bottom tab bar (tablet/mobile) */}
      <nav className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around border-t border-sidebar-border/60 bg-sidebar px-2 pb-[env(safe-area-inset-bottom)] text-sidebar-foreground lg:hidden">
        {bottomBarItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold transition-colors',
                isActive ? 'text-sidebar-primary-foreground' : 'text-sidebar-foreground/60',
              )}
            >
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-sidebar-primary text-sidebar-primary-foreground' : 'bg-transparent',
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-semibold text-sidebar-foreground/60"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl">
            <Menu className="h-5 w-5" />
          </span>
          <span>More</span>
        </button>
      </nav>
    </>
  );
}
